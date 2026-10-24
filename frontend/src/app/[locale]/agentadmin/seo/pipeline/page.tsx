'use client';

/**
 * SEO Content Pipeline — draft review UI.
 * Generation: GEN-SEO-001 (frontend).
 *
 * Staff-only (backend enforces IsStaff).  Lists plans + drafts, lets staff:
 *   - create a plan
 *   - generate a draft for a plan
 *   - preview a draft (title / meta / markdown / cost / provider)
 *   - approve / reject / publish
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  approveDraft,
  createSeoPlan,
  fetchSeoDrafts,
  fetchSeoPlans,
  generateDraftForPlan,
  publishDraft,
  rejectDraft,
  type SeoDraft,
  type SeoPlan,
} from '@/services/seo-pipeline-api';

type Busy =
  | null
  | { kind: 'create' }
  | { kind: 'generate'; planId: string }
  | { kind: 'approve' | 'reject' | 'publish'; draftId: string };

const STATUS_COLOURS: Record<string, string> = {
  planned: 'bg-slate-700/60 text-slate-300 border-slate-600/60',
  queued: 'bg-amber-500/20 text-amber-200 border-amber-500/40',
  drafting: 'bg-sky-500/20 text-sky-200 border-sky-500/40',
  ready: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40',
  approved: 'bg-emerald-500/25 text-emerald-100 border-emerald-400/60',
  rejected: 'bg-rose-500/20 text-rose-200 border-rose-500/40',
  failed: 'bg-rose-500/25 text-rose-100 border-rose-400/60',
  published: 'bg-indigo-500/25 text-indigo-100 border-indigo-400/60',
  generating: 'bg-sky-500/20 text-sky-200 border-sky-500/40',
  pending: 'bg-slate-700/60 text-slate-300 border-slate-600/60',
  archived: 'bg-slate-800/60 text-slate-500 border-slate-700/60',
};

function StatusChip({ status }: { status: string }) {
  const cls =
    STATUS_COLOURS[status] ||
    'bg-slate-800/60 text-slate-300 border-slate-700/60';
  return (
    <span
      className={`inline-block text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${cls}`}
    >
      {status}
    </span>
  );
}

export default function SeoPipelinePage() {
  const [plans, setPlans] = useState<SeoPlan[]>([]);
  const [drafts, setDrafts] = useState<SeoDraft[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<Busy>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Create-plan form state
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    target_keyword: '',
    angle: '',
    language: 'en',
    audience: 'intermediate' as SeoPlan['audience'],
    priority: 5,
    preferred_provider: 'openai',
    preferred_model: '',
    target_word_count: 1200,
  });

  const reload = useCallback(async () => {
    setLoading(true);
    const [p, d] = await Promise.all([fetchSeoPlans(), fetchSeoDrafts()]);
    setPlans(p);
    setDrafts(d);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const selectedDraft = useMemo(
    () => drafts.find(d => d.id === selectedDraftId) || null,
    [drafts, selectedDraftId],
  );

  const draftsByPlan = useMemo(() => {
    const m: Record<string, SeoDraft[]> = {};
    for (const d of drafts) (m[d.plan] ||= []).push(d);
    return m;
  }, [drafts]);

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.title.trim()) return;
      setBusy({ kind: 'create' });
      const plan = await createSeoPlan({
        title: form.title.trim(),
        target_keyword: form.target_keyword.trim() || undefined,
        angle: form.angle.trim() || undefined,
        audience: form.audience,
        language: form.language.trim() || 'en',
        priority: form.priority,
        target_word_count: form.target_word_count,
        preferred_provider: form.preferred_provider || undefined,
        preferred_model: form.preferred_model.trim() || undefined,
      });
      setBusy(null);
      if (plan) {
        setToast(`Plan "${plan.title}" created.`);
        setShowCreate(false);
        setForm(f => ({ ...f, title: '', target_keyword: '', angle: '' }));
        await reload();
      } else {
        setToast('Failed to create plan — are you logged in as staff?');
      }
    },
    [form, reload],
  );

  const handleGenerate = useCallback(
    async (plan: SeoPlan) => {
      setBusy({ kind: 'generate', planId: plan.id });
      const draft = await generateDraftForPlan(plan.id);
      setBusy(null);
      if (draft) {
        setToast(
          `Draft "${draft.title || '—'}" (${draft.status}) — ${draft.provider || '?'} · $${draft.cost_usd}`,
        );
        setSelectedDraftId(draft.id);
        await reload();
      } else {
        setToast('Draft generation failed (see server logs).');
      }
    },
    [reload],
  );

  const handleApprove = useCallback(
    async (draft: SeoDraft) => {
      setBusy({ kind: 'approve', draftId: draft.id });
      const res = await approveDraft(draft.id);
      setBusy(null);
      if (res) {
        setToast('Draft approved.');
        await reload();
      } else {
        setToast('Approve failed.');
      }
    },
    [reload],
  );

  const handleReject = useCallback(
    async (draft: SeoDraft) => {
      setBusy({ kind: 'reject', draftId: draft.id });
      const res = await rejectDraft(draft.id);
      setBusy(null);
      if (res) {
        setToast('Draft rejected.');
        await reload();
      } else {
        setToast('Reject failed.');
      }
    },
    [reload],
  );

  const handlePublish = useCallback(
    async (draft: SeoDraft) => {
      setBusy({ kind: 'publish', draftId: draft.id });
      const res = await publishDraft(draft.id);
      setBusy(null);
      if (res.ok) {
        setToast(`Published as KBArticle ${res.draft.published_article_id}.`);
        await reload();
      } else {
        setToast(`Publish failed: ${res.detail}`);
      }
    },
    [reload],
  );

  return (
    <div className="min-h-screen text-slate-100 bg-[#070b14] p-6 space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">SEO Content Pipeline</h1>
          <p className="text-sm text-slate-400">
            Plan SEO articles, generate drafts via Groq / OpenAI, approve and
            publish straight into the Knowledge Base.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={reload}
            className="px-3 py-1.5 text-xs rounded-lg bg-slate-800/70 hover:bg-slate-700/70 border border-slate-700/60"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(s => !s)}
            className="px-3 py-1.5 text-xs rounded-lg bg-cyan-500/25 text-cyan-100 hover:bg-cyan-500/35 border border-cyan-400/60"
          >
            {showCreate ? 'Cancel' : '+ New plan'}
          </button>
        </div>
      </header>

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="bg-slate-900/60 border border-slate-800/70 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm"
        >
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs uppercase tracking-wide text-slate-400">
              Title *
            </span>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
              className="bg-slate-950/60 border border-slate-700/60 rounded-lg px-2.5 py-1.5"
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs uppercase tracking-wide text-slate-400">
              Angle / editor brief
            </span>
            <textarea
              value={form.angle}
              rows={3}
              onChange={e => setForm(f => ({ ...f, angle: e.target.value }))}
              className="bg-slate-950/60 border border-slate-700/60 rounded-lg px-2.5 py-1.5 resize-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-slate-400">
              Target keyword
            </span>
            <input
              value={form.target_keyword}
              onChange={e => setForm(f => ({ ...f, target_keyword: e.target.value }))}
              className="bg-slate-950/60 border border-slate-700/60 rounded-lg px-2.5 py-1.5"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-slate-400">Language</span>
            <input
              value={form.language}
              onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
              className="bg-slate-950/60 border border-slate-700/60 rounded-lg px-2.5 py-1.5"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-slate-400">Audience</span>
            <select
              value={form.audience}
              onChange={e => setForm(f => ({ ...f, audience: e.target.value as SeoPlan['audience'] }))}
              className="bg-slate-950/60 border border-slate-700/60 rounded-lg px-2.5 py-1.5"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-slate-400">Priority (1-10)</span>
            <input
              type="number"
              min={1}
              max={10}
              value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))}
              className="bg-slate-950/60 border border-slate-700/60 rounded-lg px-2.5 py-1.5"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-slate-400">Target word count</span>
            <input
              type="number"
              min={200}
              step={100}
              value={form.target_word_count}
              onChange={e => setForm(f => ({ ...f, target_word_count: Number(e.target.value) }))}
              className="bg-slate-950/60 border border-slate-700/60 rounded-lg px-2.5 py-1.5"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-slate-400">Preferred provider</span>
            <select
              value={form.preferred_provider}
              onChange={e => setForm(f => ({ ...f, preferred_provider: e.target.value }))}
              className="bg-slate-950/60 border border-slate-700/60 rounded-lg px-2.5 py-1.5"
            >
              <option value="">auto (LLMRouter)</option>
              <option value="openai">OpenAI</option>
              <option value="groq">Groq</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-slate-400">Preferred model</span>
            <input
              value={form.preferred_model}
              placeholder="e.g. gpt-4o-mini or llama-3.3-70b-versatile"
              onChange={e => setForm(f => ({ ...f, preferred_model: e.target.value }))}
              className="bg-slate-950/60 border border-slate-700/60 rounded-lg px-2.5 py-1.5"
            />
          </label>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button
              type="submit"
              disabled={busy?.kind === 'create' || !form.title.trim()}
              className="px-3 py-1.5 text-xs rounded-lg bg-cyan-500/25 hover:bg-cyan-500/35 border border-cyan-400/60 disabled:opacity-50"
            >
              {busy?.kind === 'create' ? 'Saving…' : 'Create plan'}
            </button>
          </div>
        </form>
      )}

      {/* Plans list */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Plans {plans.length > 0 && <span className="text-slate-500">({plans.length})</span>}
        </h2>
        {loading ? (
          <div className="text-xs text-slate-500 italic">Loading…</div>
        ) : plans.length === 0 ? (
          <div className="text-xs text-slate-500 italic">
            No plans yet. Create one above or via Django admin.
          </div>
        ) : (
          <div className="space-y-2">
            {plans.map(plan => (
              <div
                key={plan.id}
                className="bg-slate-900/60 border border-slate-800/70 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate" title={plan.title}>
                      {plan.title}
                    </span>
                    <StatusChip status={plan.status} />
                    <span className="text-[10px] text-slate-500">prio {plan.priority}</span>
                    <span className="text-[10px] text-slate-500">{plan.language}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {plan.target_keyword || '—'} · {plan.drafts_count} drafts ·
                    {' '}
                    latest: {plan.latest_draft_status || 'none'}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleGenerate(plan)}
                    disabled={busy?.kind === 'generate' && busy.planId === plan.id}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800/70 hover:bg-slate-700/70 border border-slate-700/60 disabled:opacity-50"
                  >
                    {busy?.kind === 'generate' && busy.planId === plan.id
                      ? 'Generating…'
                      : 'Generate draft'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Drafts list + preview */}
      <section className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Drafts {drafts.length > 0 && <span className="text-slate-500">({drafts.length})</span>}
          </h2>
          {drafts.length === 0 ? (
            <div className="text-xs text-slate-500 italic">No drafts yet.</div>
          ) : (
            <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {drafts.map(d => {
                const active = d.id === selectedDraftId;
                return (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedDraftId(d.id)}
                      className={`w-full text-left bg-slate-900/60 border rounded-xl p-3 transition-colors ${
                        active
                          ? 'border-cyan-400/60 bg-slate-800/70'
                          : 'border-slate-800/70 hover:border-slate-700/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <StatusChip status={d.status} />
                        <span className="text-[10px] text-slate-500">
                          {d.provider || '?'}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-auto">
                          ${d.cost_usd}
                        </span>
                      </div>
                      <div className="text-sm font-medium truncate" title={d.title}>
                        {d.title || d.plan_title || '(untitled)'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        plan: {d.plan_title}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="bg-slate-900/60 border border-slate-800/70 rounded-xl p-4 min-h-[40vh]">
          {!selectedDraft ? (
            <div className="text-xs text-slate-500 italic h-full flex items-center justify-center">
              Select a draft on the left to review.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <StatusChip status={selectedDraft.status} />
                    <span className="text-[11px] text-slate-500">
                      {selectedDraft.provider || '?'} · {selectedDraft.model_name || '?'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      tokens: {selectedDraft.total_tokens ?? '—'} · ${selectedDraft.cost_usd} ·
                      {' '}
                      {selectedDraft.latency_ms}ms
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">{selectedDraft.title || '(untitled)'}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    plan: {selectedDraft.plan_title} ({selectedDraft.plan_slug})
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    disabled={
                      !(selectedDraft.status === 'ready' || selectedDraft.status === 'rejected') ||
                      busy?.kind === 'approve'
                    }
                    onClick={() => handleApprove(selectedDraft)}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 disabled:opacity-40"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={
                      !(selectedDraft.status === 'ready' || selectedDraft.status === 'approved') ||
                      busy?.kind === 'reject'
                    }
                    onClick={() => handleReject(selectedDraft)}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 disabled:opacity-40"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    disabled={selectedDraft.status !== 'approved' || busy?.kind === 'publish'}
                    onClick={() => handlePublish(selectedDraft)}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-indigo-500/25 hover:bg-indigo-500/35 border border-indigo-400/60 disabled:opacity-40"
                  >
                    Publish to KB
                  </button>
                </div>
              </div>

              {selectedDraft.error_message && (
                <div className="bg-rose-950/60 border border-rose-500/40 rounded-lg p-2 text-xs text-rose-200 whitespace-pre-wrap">
                  {selectedDraft.error_message}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[10px] uppercase text-slate-500">Meta title</div>
                  <div className="text-slate-200">{selectedDraft.meta_title || '—'}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-500">Meta description</div>
                  <div className="text-slate-200">{selectedDraft.meta_description || '—'}</div>
                </div>
              </div>

              {selectedDraft.excerpt && (
                <div className="text-sm text-slate-300 italic border-l-2 border-slate-700/60 pl-3">
                  {selectedDraft.excerpt}
                </div>
              )}

              {selectedDraft.outline?.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase text-slate-500 mb-1">Outline</div>
                  <ul className="text-xs text-slate-300 list-disc ml-5 space-y-0.5">
                    {selectedDraft.outline.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <div className="text-[10px] uppercase text-slate-500 mb-1">Markdown</div>
                <pre className="bg-slate-950/80 border border-slate-800/70 rounded-lg p-3 text-xs text-slate-200 whitespace-pre-wrap max-h-[45vh] overflow-y-auto">
                  {selectedDraft.content_md || '(empty)'}
                </pre>
              </div>

              {selectedDraft.published_article_id && (
                <div className="text-xs text-emerald-300">
                  Published as KBArticle{' '}
                  <code className="text-emerald-200">{selectedDraft.published_article_id}</code>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/90 border border-slate-700/70 text-slate-100 text-xs px-3 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* Debug panel: plan → drafts mapping */}
      <details className="text-[11px] text-slate-500">
        <summary className="cursor-pointer">Debug: plan → drafts map</summary>
        <pre className="mt-2 bg-slate-950/70 border border-slate-800/70 rounded-lg p-2 overflow-x-auto">
          {JSON.stringify(
            Object.fromEntries(
              Object.entries(draftsByPlan).map(([pid, ds]) => [
                pid,
                ds.map(d => ({ id: d.id, status: d.status, cost: d.cost_usd })),
              ]),
            ),
            null,
            2,
          )}
        </pre>
      </details>
    </div>
  );
}
