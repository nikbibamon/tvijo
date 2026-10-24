'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useLocale } from '@/i18n/useLocale';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import LanguageSwitcher from '@/components/portal/LanguageSwitcher';
import { portalApiFetch, PortalApiError } from '@/lib/portal-auth-fetch';
import { getAgentroyCopy } from './copy';

type Status = 'queued' | 'running' | 'waiting' | 'completed' | 'blocked' | 'cancelled';
type ProjectOption = { id: string; label: string; available: boolean; reason?: string | null };
type ExecutorOption = { id: string; label: string; available: boolean; reason?: string | null };
type Bootstrap = {
  projects: ProjectOption[];
  executors: ExecutorOption[];
  limits: { task_api_usd: number | string };
  worker: { online: boolean; last_seen: string | null };
};
type Task = {
  id: string;
  title: string;
  project: string;
  executor: string;
  status: Status;
  api_cap_usd: number | string;
  spent_usd: number | string | null;
  created_at: string;
  updated_at: string;
  version: number;
};
type TaskMessage = {
  id: string;
  kind: string;
  role: string;
  text: string;
  created_at: string;
  delivery?: string | null;
};
type TaskDetail = {
  task: Task;
  messages: TaskMessage[];
  worker: { online: boolean; last_seen: string | null };
};
type PendingAction = {
  ownerId: string;
  key: string;
  endpoint: string;
  body: Record<string, unknown>;
  taskId?: string;
  text: string;
  type: 'create' | 'message' | 'cancel';
};

const PENDING_KEY_PREFIX = 'tvijo.agentroy.pending.v1:';
const MAX_TEXT = 16000;
const TASK_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const IDEMPOTENCY_PATTERN = /^[a-z0-9-]{16,64}$/i;

function pendingStorageKey(ownerId: string): string {
  return PENDING_KEY_PREFIX + encodeURIComponent(ownerId);
}

function hasExactKeys(value: Record<string, unknown>, keys: string[]): boolean {
  const actual = Object.keys(value).sort();
  return actual.length === keys.length && actual.every((key, index) => key === [...keys].sort()[index]);
}

function isPendingAction(value: unknown, ownerId: string): value is PendingAction {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const action = value as Partial<PendingAction>;
  if (
    action.ownerId !== ownerId ||
    typeof action.key !== 'string' ||
    !IDEMPOTENCY_PATTERN.test(action.key) ||
    typeof action.endpoint !== 'string' ||
    typeof action.text !== 'string' ||
    action.text.length > MAX_TEXT ||
    !action.body ||
    typeof action.body !== 'object' ||
    Array.isArray(action.body)
  ) return false;

  const body = action.body as Record<string, unknown>;
  if (action.type === 'create') {
    return action.taskId == null &&
      action.endpoint === '/agentroy/tasks/' &&
      hasExactKeys(action as Record<string, unknown>, ['ownerId', 'key', 'endpoint', 'body', 'text', 'type']) &&
      hasExactKeys(body, ['project', 'executor', 'text', 'idempotency_key']) &&
      typeof body.project === 'string' &&
      typeof body.executor === 'string' &&
      typeof body.text === 'string' &&
      body.text === action.text &&
      action.text.trim().length > 0 &&
      body.idempotency_key === action.key;
  }
  if (action.type === 'message') {
    return typeof action.taskId === 'string' &&
      TASK_ID_PATTERN.test(action.taskId) &&
      action.endpoint === '/agentroy/tasks/' + action.taskId + '/messages/' &&
      hasExactKeys(action as Record<string, unknown>, ['ownerId', 'key', 'endpoint', 'body', 'taskId', 'text', 'type']) &&
      hasExactKeys(body, ['text', 'kind', 'idempotency_key']) &&
      typeof body.text === 'string' &&
      body.text === action.text &&
      action.text.trim().length > 0 &&
      ['comment', 'answer', 'continue'].includes(String(body.kind)) &&
      body.idempotency_key === action.key;
  }
  if (action.type === 'cancel') {
    return typeof action.taskId === 'string' &&
      TASK_ID_PATTERN.test(action.taskId) &&
      action.endpoint === '/agentroy/tasks/' + action.taskId + '/cancel/' &&
      hasExactKeys(action as Record<string, unknown>, ['ownerId', 'key', 'endpoint', 'body', 'taskId', 'text', 'type']) &&
      hasExactKeys(body, ['idempotency_key']) &&
      action.text === '' &&
      body.idempotency_key === action.key;
  }
  return false;
}
const TASK_STATUSES: Status[] = ['queued', 'running', 'waiting', 'completed', 'blocked', 'cancelled'];

function idempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'agentroy-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
}

function asTask(result: unknown): Task | null {
  if (!result || typeof result !== 'object') return null;
  const value = result as { task?: Task; id?: string };
  return value.task || (value.id ? value as Task : null);
}

function amount(value: number | string | null | undefined): number | null {
  if (value == null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function money(value: number | string | null | undefined): string {
  const parsed = amount(value);
  if (parsed == null) return '—';
  const places = parsed !== 0 && Math.abs(parsed) < 0.01 ? 6 : 2;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: places,
    maximumFractionDigits: 6,
  }).format(parsed);
  if (parsed !== 0 && Number(formatted.replace(/,/g, '')) === 0) return 'USD <0.000001';
  return 'USD ' + formatted;
}

function dateLabel(value: string | null | undefined, locale: string): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function errorText(error: unknown, fallback: string): string {
  if (error instanceof PortalApiError) {
    if (error.status === 403) return 'Access denied by the server. Check the configured owner and staff access.';
    if (error.status === 404) return 'This task is no longer available to this account.';
  }
  return error instanceof Error ? error.message : fallback;
}

function statusClass(status: string): string {
  switch (status) {
    case 'completed': return 'bg-emerald-100 text-emerald-800 ring-emerald-200';
    case 'running': return 'bg-sky-100 text-sky-800 ring-sky-200';
    case 'waiting': return 'bg-amber-100 text-amber-800 ring-amber-200';
    case 'blocked': return 'bg-rose-100 text-rose-800 ring-rose-200';
    case 'cancelled': return 'bg-slate-100 text-slate-600 ring-slate-200';
    default: return 'bg-violet-100 text-violet-800 ring-violet-200';
  }
}

function statusDescription(status: Status, c: ReturnType<typeof getAgentroyCopy>): string {
  switch (status) {
    case 'queued': return c.queuedExplanation;
    case 'running': return c.runningExplanation;
    case 'waiting': return c.waitingExplanation;
    case 'completed': return c.completedExplanation;
    case 'blocked': return c.blockedExplanation;
    case 'cancelled': return c.cancelledExplanation;
  }
}

function roleLabel(role: string, c: ReturnType<typeof getAgentroyCopy>): string {
  const normalized = role.toLowerCase();
  if (normalized === 'operator' || normalized === 'user' || normalized === 'owner') return c.operator;
  if (normalized === 'worker' || normalized === 'assistant' || normalized === 'executor') return c.workerRole;
  return c.system;
}

function deliveryLabel(delivery: string | null | undefined, c: ReturnType<typeof getAgentroyCopy>): string {
  if (!delivery) return c.deliveryUnknown;
  const normalized = delivery.toLowerCase();
  if (normalized === 'pending' || normalized === 'queued') return c.deliveryPending;
  if (normalized === 'delivered' || normalized === 'sent') return c.deliverySent;
  if (normalized === 'failed' || normalized === 'error') return c.deliveryFailed;
  return c.deliveryUnknown;
}

export default function AgentroyCenter() {
  const { locale } = useLocale();
  const c = getAgentroyCopy(locale);
  const { user } = useCurrentUser();
  const ownerId = user?.id || null;
  const [bootstrap, setBootstrap] = useState<Bootstrap | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [detail, setDetail] = useState<TaskDetail | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [executorId, setExecutorId] = useState('');
  const [newText, setNewText] = useState('');
  const [messageText, setMessageText] = useState('');
  const [draftOwnerId, setDraftOwnerId] = useState<string | null>(null);
  const visibleNewText = ownerId && draftOwnerId === ownerId ? newText : '';
  const visibleMessageText = ownerId && draftOwnerId === ownerId ? messageText : '';
  const [messageKind, setMessageKind] = useState<'comment' | 'dispatch'>('comment');
  const [pending, setPending] = useState<PendingAction | null>(null);
  const activePending = ownerId && pending?.ownerId === ownerId ? pending : null;
  const [pendingStorageBlocked, setPendingStorageBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const inFlight = useRef(false);
  const pendingRef = useRef<PendingAction | null>(null);

  useEffect(() => {
    pendingRef.current = null;
    setPending(null);
    setPendingStorageBlocked(false);
    setDraftOwnerId(ownerId);
    setNewText('');
    setMessageText('');
    if (!ownerId) return;

    try {
      const saved = window.localStorage.getItem(pendingStorageKey(ownerId));
      if (!saved) return;
      const parsed: unknown = JSON.parse(saved);
      if (!isPendingAction(parsed, ownerId)) {
        setPendingStorageBlocked(true);
        setError(c.pendingInvalid);
        return;
      }
      pendingRef.current = parsed;
      setPending(parsed);
      setDraftOwnerId(ownerId);
      if (parsed.type === 'create') setNewText(parsed.text);
      if (parsed.type === 'message') setMessageText(parsed.text);
    } catch {
      setPendingStorageBlocked(true);
      setError(c.pendingUnreadable);
    }
  }, [c.pendingInvalid, c.pendingUnreadable, ownerId]);

  const refresh = useCallback(async (quiet = false) => {
    if (inFlight.current || !user) return;
    inFlight.current = true;
    if (!quiet) setRefreshing(true);
    try {
      const [nextBootstrap, taskList] = await Promise.all([
        portalApiFetch<Bootstrap>('/agentroy/bootstrap/'),
        portalApiFetch<{ tasks: Task[] }>('/agentroy/tasks/'),
      ]);
      setBootstrap(nextBootstrap);
      const safeTasks = Array.isArray(taskList.tasks)
        ? taskList.tasks.filter((task) => TASK_STATUSES.includes(task.status))
        : [];
      setTasks(safeTasks);
      const chosenId = activeId && safeTasks.some((task) => task.id === activeId)
        ? activeId
        : safeTasks[0]?.id ?? null;
      if (chosenId !== activeId) setActiveId(chosenId);
      if (chosenId) {
        const nextDetail = await portalApiFetch<TaskDetail>('/agentroy/tasks/' + encodeURIComponent(chosenId) + '/');
        setDetail(nextDetail);
      } else {
        setDetail(null);
      }
      setError('');
      setLastUpdated(new Date().toISOString());
    } catch (loadError) {
      setError(errorText(loadError, c.loadFailed));
    } finally {
      setLoading(false);
      setRefreshing(false);
      inFlight.current = false;
    }
  }, [activeId, c.loadFailed, user]);

  useEffect(() => {
    void refresh();
    const poll = () => {
      if (document.visibilityState === 'visible') void refresh(true);
    };
    const timer = window.setInterval(poll, 5000);
    document.addEventListener('visibilitychange', poll);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', poll);
    };
  }, [refresh]);

  useEffect(() => {
    if (!bootstrap) return;
    if (!projectId) {
      const firstAvailable = bootstrap.projects.find((project) => project.available);
      if (firstAvailable) setProjectId(firstAvailable.id);
    }
    if (!executorId) {
      const firstAvailable = bootstrap.executors.find((executor) => executor.available);
      if (firstAvailable) setExecutorId(firstAvailable.id);
    }
  }, [bootstrap, executorId, projectId]);

  const activeTask = useMemo(
    () => detail?.task ?? tasks.find((task) => task.id === activeId) ?? null,
    [activeId, detail?.task, tasks],
  );
  const worker = detail?.worker ?? bootstrap?.worker ?? null;
  const selectedProject = bootstrap?.projects.find((project) => project.id === projectId);
  const selectedExecutor = bootstrap?.executors.find((executor) => executor.id === executorId);
  const spend = amount(activeTask?.spent_usd);
  const cap = amount(activeTask?.api_cap_usd);
  const spendUncertain = !!activeTask && activeTask.status === 'blocked' && spend == null;
  const canCancel = !!activeTask && ['queued', 'running', 'waiting'].includes(activeTask.status);
  const canDispatch = !!activeTask &&
    !['blocked', 'cancelled'].includes(activeTask.status) &&
    !(spend != null && cap != null && spend >= cap);
  const inferredKind = activeTask?.status === 'waiting' ? 'answer' : 'continue';

  const savePending = useCallback((action: PendingAction) => {
    if (!ownerId || !isPendingAction(action, ownerId)) {
      setError(c.pendingOwnerMismatch);
      return false;
    }
    try {
      const storageKey = pendingStorageKey(ownerId);
      if (window.localStorage.getItem(storageKey) != null) {
        setPendingStorageBlocked(true);
        setError(c.pendingExisting);
        return false;
      }
      window.localStorage.setItem(storageKey, JSON.stringify(action));
      pendingRef.current = action;
      setPending(action);
      setPendingStorageBlocked(false);
      return true;
    } catch {
      setError('Could not retain this request in browser storage; it has not been sent.');
      return false;
    }
  }, [c.pendingExisting, c.pendingOwnerMismatch, ownerId]);

  const clearPending = useCallback((action: PendingAction) => {
    if (!ownerId || action.ownerId !== ownerId || pendingRef.current?.key !== action.key) return false;
    try {
      const storageKey = pendingStorageKey(ownerId);
      const saved = window.localStorage.getItem(storageKey);
      if (!saved || JSON.stringify(JSON.parse(saved)) !== JSON.stringify(action)) {
        setError(c.pendingAccepted);
        return false;
      }
      window.localStorage.removeItem(storageKey);
      if (window.localStorage.getItem(storageKey) != null) throw new Error('Request record remains stored');
    } catch {
      setError(c.pendingAccepted);
      return false;
    }
    pendingRef.current = null;
    setPending(null);
    return true;
  }, [c.pendingAccepted, ownerId]);

  const sendPending = useCallback(async (action: PendingAction) => {
    if (!ownerId || !isPendingAction(action, ownerId)) {
      setError(c.pendingOwnerMismatch);
      return;
    }
    setPosting(true);
    setError('');
    try {
      const saved = window.localStorage.getItem(pendingStorageKey(ownerId));
      if (!saved || JSON.stringify(JSON.parse(saved)) !== JSON.stringify(action)) {
        setPendingStorageBlocked(true);
        throw new Error(c.pendingOwnerMismatch);
      }
      if (action.type === 'message' || action.type === 'cancel') {
        const ownedTask = await portalApiFetch<TaskDetail>(
          '/agentroy/tasks/' + encodeURIComponent(action.taskId as string) + '/',
        );
        if (ownedTask.task?.id !== action.taskId) {
          throw new Error(c.pendingTaskOwnership);
        }
      }
      const result = await portalApiFetch<unknown>(action.endpoint, {
        method: 'POST',
        body: JSON.stringify(action.body),
      });
      const retryRecordCleared = clearPending(action);
      if (retryRecordCleared && action.type === 'create') {
        const created = asTask(result);
        if (created?.id) {
          setActiveId(created.id);
          setShowNewTask(false);
          setNewText('');
        }
      }
      if (retryRecordCleared && action.type === 'message') {
        setMessageText((current) => current === action.text ? '' : current);
      }
      await refresh(true);
    } catch (sendError) {
      setError(errorText(sendError, c.loadFailed));
    } finally {
      setPosting(false);
    }
  }, [c.loadFailed, c.pendingOwnerMismatch, c.pendingTaskOwnership, clearPending, ownerId, refresh]);

  const submitNewTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ownerId) return;
    const text = visibleNewText.trim();
    if (!text || text.length > MAX_TEXT || !projectId || !executorId) return;
    if (!selectedProject?.available || !selectedExecutor?.available) return;
    if (activePending || pendingStorageBlocked) {
      setError(c.pending);
      return;
    }
    const key = idempotencyKey();
    const action: PendingAction = {
      ownerId: ownerId || '',
      key,
      endpoint: '/agentroy/tasks/',
      body: { project: projectId, executor: executorId, text, idempotency_key: key },
      text,
      type: 'create',
    };
    if (savePending(action)) await sendPending(action);
  };

  const submitMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ownerId) return;
    const text = visibleMessageText.trim();
    if (!activeTask || !text || text.length > MAX_TEXT) return;
    if (activePending || pendingStorageBlocked) {
      setError(c.pending);
      return;
    }
    const kind = messageKind === 'comment' ? 'comment' : inferredKind;
    if (kind !== 'comment' && !canDispatch) return;
    const key = idempotencyKey();
    const action: PendingAction = {
      ownerId: ownerId || '',
      key,
      endpoint: '/agentroy/tasks/' + encodeURIComponent(activeTask.id) + '/messages/',
      body: { text, kind, idempotency_key: key },
      taskId: activeTask.id,
      text,
      type: 'message',
    };
    if (savePending(action)) await sendPending(action);
  };

  const cancelTask = async () => {
    if (!ownerId) return;
    if (!activeTask || !canCancel || activePending || pendingStorageBlocked) return;
    if (!window.confirm(c.cancelConfirm)) return;
    const key = idempotencyKey();
    const action: PendingAction = {
      ownerId: ownerId || '',
      key,
      endpoint: '/agentroy/tasks/' + encodeURIComponent(activeTask.id) + '/cancel/',
      body: { idempotency_key: key },
      taskId: activeTask.id,
      text: '',
      type: 'cancel',
    };
    if (savePending(action)) await sendPending(action);
  };

  const availableProjects = bootstrap?.projects.filter((project) => project.available) ?? [];
  const availableExecutors = bootstrap?.executors.filter((executor) => executor.available) ?? [];
  const statusCounts = tasks.reduce<Record<string, number>>((counts, task) => {
    counts[task.status] = (counts[task.status] || 0) + 1;
    return counts;
  }, {});

  if (loading && !bootstrap) {
    return (
      <main className="min-h-screen bg-[#f4f7f7] px-4 pb-10 pt-24 sm:px-6">
        <div className="mx-auto max-w-7xl animate-pulse rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-5 h-4 w-40 rounded bg-slate-200" />
          <div className="mb-10 h-8 w-80 rounded bg-slate-100" />
          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            <div className="h-[560px] rounded-3xl bg-slate-100" />
            <div className="h-[560px] rounded-3xl bg-slate-50" />
          </div>
        </div>
      </main>
    );
  }

  if (error && !bootstrap && !loading) {
    return (
      <main className="min-h-screen bg-[#f4f7f7] px-4 pb-10 pt-24 sm:px-6">
        <section className="mx-auto max-w-2xl rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">Agentroy</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">{c.loadFailed}</h1>
          <p className="mt-3 break-words text-sm text-slate-600">{error}</p>
          <button onClick={() => void refresh()} className="mt-6 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">{c.retry}</button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7f7] px-3 pb-8 pt-20 text-slate-900 sm:px-5 sm:pt-24">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-5 flex flex-col gap-4 rounded-[1.75rem] border border-slate-200/80 bg-white px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-700">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              Tvijo · Private operations
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{c.title}</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{c.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-xl border border-slate-200 px-1"><LanguageSwitcher /></div>
            <Link href={'/' + locale + '/workspace'} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:border-teal-300 hover:text-teal-800">{c.workspace}</Link>
            <button onClick={() => void refresh()} disabled={refreshing} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-400 disabled:opacity-50">{refreshing ? '…' : c.refresh}</button>
            <button onClick={() => { setShowNewTask(true); setActiveId(null); setDetail(null); }} className="rounded-xl bg-[#123b3d] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0b2e30]">{c.newTask}</button>
          </div>
        </header>

        {error && (
          <div role="alert" className="mb-4 flex flex-col gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 sm:flex-row sm:items-center sm:justify-between">
            <span className="break-words">{error}</span>
            {activePending && <button onClick={() => void sendPending(activePending)} disabled={posting} className="shrink-0 rounded-lg border border-rose-300 bg-white px-3 py-1.5 font-semibold disabled:opacity-50">{c.retryPending}</button>}
          </div>
        )}

        {activePending && !error && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <p className="font-semibold">{c.pending}</p>
            <p className="mt-1">{c.savedLocally}</p>
            <button onClick={() => void sendPending(activePending)} disabled={posting} className="mt-2 rounded-lg border border-amber-300 bg-white px-3 py-1.5 font-semibold disabled:opacity-50">{c.retryPending}</button>
          </div>
        )}

        <div className="grid min-h-[calc(100vh-230px)] gap-4 lg:grid-cols-[310px_minmax(0,1fr)]">
          <aside className="flex min-h-[220px] flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-sm lg:min-h-[680px]">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{c.tasks}</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">{tasks.length}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {TASK_STATUSES.filter((status) => statusCounts[status]).map((status) => (
                  <span key={status} className={'rounded-full px-2 py-1 text-[10px] font-semibold ring-1 ring-inset ' + statusClass(status)}>
                    {status} · {statusCounts[status]}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-b border-slate-100 p-4 text-xs">
              <div className="col-span-1 rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-slate-400">{c.worker}</p>
                <p className={'mt-1 font-semibold ' + (worker?.online ? 'text-emerald-700' : 'text-amber-700')}>{worker?.online ? c.online : c.offline}</p>
              </div>
              <div className="col-span-2 rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-slate-400">{c.lastSeen}</p>
                <p className="mt-1 truncate font-medium text-slate-700">{dateLabel(worker?.last_seen, locale)}</p>
              </div>
            </div>
            {!worker?.online && <p className="border-b border-amber-100 bg-amber-50 px-4 py-2.5 text-xs leading-5 text-amber-900">{c.waitingForWorker}</p>}

            <div className="flex-1 space-y-1 overflow-y-auto p-2">
              {tasks.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm font-semibold text-slate-700">{c.noTasks}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{c.noTasksBody}</p>
                  <button onClick={() => { setShowNewTask(true); setActiveId(null); }} className="mt-4 rounded-lg bg-[#123b3d] px-3 py-2 text-xs font-semibold text-white">{c.createTask}</button>
                </div>
              )}
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => { setActiveId(task.id); setShowNewTask(false); setMessageKind('comment'); }}
                  aria-current={activeId === task.id ? 'true' : undefined}
                  className={'block w-full rounded-2xl px-3.5 py-3 text-left transition ' + (activeId === task.id && !showNewTask ? 'bg-[#e8f3f1] ring-1 ring-inset ring-teal-200' : 'hover:bg-slate-50')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-800">{task.title || task.project}</p>
                    <span className={'shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ring-1 ring-inset ' + statusClass(task.status)}>{task.status}</span>
                  </div>
                  <p className="mt-2 truncate text-[11px] text-slate-500">{task.project} · {task.executor}</p>
                  <p className="mt-1 text-[10px] text-slate-400">{dateLabel(task.updated_at, locale)}</p>
                </button>
              ))}
            </div>

            <div className="border-t border-slate-100 px-4 py-3 text-[11px] leading-5 text-slate-500">
              <p className="font-semibold text-slate-700">{c.taskCapNotice}</p>
              <p>{c.sourceNote}</p>
            </div>
          </aside>

          <section className="flex min-h-[560px] flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-sm lg:min-h-[680px]">
            {showNewTask ? (
              <div className="flex-1 p-5 sm:p-8">
                <div className="mx-auto max-w-3xl">
                  <div className="mb-7 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">{c.projectMap}</p>
                      <h2 className="mt-2 text-2xl font-semibold">{c.createTask}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{c.taskCapNotice}</p>
                    </div>
                    {activeTask && <button onClick={() => setShowNewTask(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold">{c.cancel}</button>}
                  </div>
                  <form onSubmit={submitNewTask} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        {c.project}
                        <select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 font-normal outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" required>
                          {bootstrap?.projects.map((project) => (
                            <option key={project.id} value={project.id} disabled={!project.available}>
                              {project.label}{project.available ? '' : ' · ' + (project.reason || c.unavailableProject)}
                            </option>
                          ))}
                        </select>
                        {selectedProject && !selectedProject.available && <span className="mt-1 block text-xs font-normal text-amber-700">{selectedProject.reason || c.unavailableReason}</span>}
                      </label>
                      <label className="block text-sm font-semibold text-slate-700">
                        {c.executor}
                        <select value={executorId} onChange={(event) => setExecutorId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 font-normal outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" required>
                          {bootstrap?.executors.map((executor) => (
                            <option key={executor.id} value={executor.id} disabled={!executor.available}>
                              {executor.label}{executor.available ? '' : ' · ' + (executor.reason || c.unavailableExecutor)}
                            </option>
                          ))}
                        </select>
                        {selectedExecutor && !selectedExecutor.available && <span className="mt-1 block text-xs font-normal text-amber-700">{selectedExecutor.reason || c.unavailableReason}</span>}
                      </label>
                    </div>
                    <label className="block text-sm font-semibold text-slate-700">
                      {c.taskRequest}
                      <textarea value={visibleNewText} onChange={(event) => { setDraftOwnerId(ownerId); setNewText(event.target.value); }} maxLength={MAX_TEXT} rows={12} placeholder={c.taskPlaceholder} className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-[#fbfdfd] px-4 py-3 text-sm font-normal leading-6 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" required />
                    </label>
                    <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-xs leading-5 text-slate-500"><p>{c.requestHint}</p><p>{visibleNewText.length}/{MAX_TEXT}</p></div>
                      <button type="submit" disabled={posting || !!activePending || pendingStorageBlocked || !visibleNewText.trim() || !selectedProject?.available || !selectedExecutor?.available} className="rounded-xl bg-[#123b3d] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#0b2e30] disabled:cursor-not-allowed disabled:opacity-45">
                        {posting ? c.creating : c.submitTask}
                      </button>
                    </div>
                  </form>
                  {availableProjects.length === 0 || availableExecutors.length === 0 ? (
                    <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{c.unavailableReason}</p>
                  ) : null}
                </div>
              </div>
            ) : activeTask ? (
              <>
                <div className="border-b border-slate-100 px-5 py-4 sm:px-7">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="max-w-3xl break-words text-lg font-semibold sm:text-xl">{activeTask.title || c.taskRequest}</h2>
                        <span className={'rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ' + statusClass(activeTask.status)}>{activeTask.status}</span>
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-500">{activeTask.project} · {activeTask.executor} · {dateLabel(activeTask.updated_at, locale)}</p>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{statusDescription(activeTask.status, c)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <div className="rounded-xl bg-slate-50 px-3 py-2 text-right text-xs">
                        <p className="text-slate-400">{c.budget}</p>
                        <p className="font-semibold text-slate-800">{money(activeTask.api_cap_usd)}</p>
                        <p className="mt-1 text-slate-400">{c.spent}: {money(activeTask.spent_usd)}</p>
                      </div>
                      {canCancel && <button onClick={() => void cancelTask()} disabled={posting || !!activePending || pendingStorageBlocked} className="rounded-xl border border-rose-200 px-3 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">{c.cancel}</button>}
                    </div>
                  </div>
                  {spendUncertain && <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{c.unknownSpend}</p>}
                </div>

                <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#fbfdfd_0%,#f5f9f8_100%)] px-4 py-5 sm:px-7">
                  <div className="mx-auto max-w-4xl">
                    <div className="mb-5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      <span>{c.history}</span>
                      <span>{lastUpdated ? dateLabel(lastUpdated, locale) : ''}</span>
                    </div>
                    {(detail?.messages?.length ?? 0) === 0 && <p className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">{c.noMessages}</p>}
                    <div className="space-y-4">
                      {(detail?.messages || []).map((message) => {
                        const own = ['operator', 'user', 'owner'].includes(message.role.toLowerCase());
                        return (
                          <article key={message.id} className={'max-w-[94%] rounded-2xl border px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:max-w-[82%] ' + (own ? 'ml-auto border-teal-200 bg-[#e8f3f1]' : 'border-slate-200 bg-white')}>
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-slate-700">{roleLabel(message.role, c)} <span className="font-normal text-slate-400">· {message.kind}</span></span>
                              <time className="text-[10px] text-slate-400">{dateLabel(message.created_at, locale)}</time>
                            </div>
                            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{message.text}</p>
                            {(own || message.delivery) && (
                              <div className="mt-3 flex justify-end">
                                <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] text-slate-500">{c.delivery}: {deliveryLabel(message.delivery, c)}</span>
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <form onSubmit={submitMessage} className="border-t border-slate-100 bg-white px-4 py-4 sm:px-7">
                  <div className="mx-auto max-w-4xl">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <label className={'cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold ' + (messageKind === 'comment' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                        <input type="radio" name="message-kind" className="sr-only" checked={messageKind === 'comment'} onChange={() => setMessageKind('comment')} />
                        {c.commentMode}
                      </label>
                      <label className={'cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold ' + (messageKind === 'dispatch' ? 'bg-[#123b3d] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200') + (!canDispatch ? ' cursor-not-allowed opacity-50' : '')}>
                        <input type="radio" name="message-kind" className="sr-only" checked={messageKind === 'dispatch'} disabled={!canDispatch} onChange={() => setMessageKind('dispatch')} />
                        {activeTask.status === 'waiting' ? c.answer : c.continue}
                      </label>
                      <span className="text-[11px] text-slate-500">
                        {messageKind === 'comment' ? c.commentHint : inferredKind === 'answer' ? c.answerHint : c.continueHint}
                      </span>
                    </div>
                    <textarea value={visibleMessageText} onChange={(event) => { setDraftOwnerId(ownerId); setMessageText(event.target.value); }} maxLength={MAX_TEXT} rows={3} placeholder={c.messagePlaceholder} className="w-full resize-y rounded-2xl border border-slate-200 bg-[#fbfdfd] px-4 py-3 text-sm leading-6 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[11px] text-slate-400">{visibleMessageText.length}/{MAX_TEXT} · {messageKind === 'comment' ? c.comment : c.dispatchMode}</p>
                      <button type="submit" disabled={posting || !!activePending || pendingStorageBlocked || !visibleMessageText.trim() || (messageKind === 'dispatch' && !canDispatch)} className="rounded-xl bg-[#123b3d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0b2e30] disabled:cursor-not-allowed disabled:opacity-45">
                        {posting ? c.sending : messageKind === 'comment' ? c.sendComment : inferredKind === 'answer' ? c.sendAnswer : c.sendContinue}
                      </button>
                    </div>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-8 text-center">
                <div className="max-w-md">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f3f1] text-2xl text-teal-800">↗</div>
                  <h2 className="mt-4 text-xl font-semibold">{tasks.length ? c.chooseTask : c.noTasks}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{tasks.length ? c.subtitle : c.noTasksBody}</p>
                  {!tasks.length && <button onClick={() => setShowNewTask(true)} className="mt-5 rounded-xl bg-[#123b3d] px-4 py-2.5 text-sm font-semibold text-white">{c.createTask}</button>}
                </div>
              </div>
            )}
          </section>
        </div>

        <footer className="mt-5 rounded-[1.75rem] border border-slate-200/80 bg-white px-5 py-5 shadow-sm sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold">{c.sourceLinks}</h2>
              <p className="mt-1 text-xs text-slate-500">{c.sourceNote}</p>
            </div>
            <nav aria-label={c.sourceLinks} className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-teal-800">
              <a href="https://dsh.tvijo.com/download" target="_blank" rel="noreferrer">{c.terminalDownload}</a>
              <a href="https://dsh.tvijo.com/docs" target="_blank" rel="noreferrer">{c.terminalDocs}</a>
              <a href="https://platform.tvijo.com/keys" target="_blank" rel="noreferrer">{c.keys}</a>
              <a href="https://github.com/nikbibamon/cursortvijo" target="_blank" rel="noreferrer">{c.editorSource}</a>
              <Link href={'/' + locale} className="hover:underline">{c.home}</Link>
            </nav>
          </div>
        </footer>
      </div>
    </main>
  );
}
