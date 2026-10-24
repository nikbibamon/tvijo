'use client';

/**
 * In-product support assistant.
 *
 * It answers from the knowledge base and says plainly when it cannot. There
 * is no model call behind it, so it never invents a price, a limit or a
 * capability — when it is unsure it offers to hand the question to a person,
 * carrying the original wording so nobody retypes it.
 *
 * specs/2026-08-workspace-solution-catalog-and-assistant.md §4.5/§4.6.
 */

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { WorkspaceIcon } from '@/components/workspace/WorkspaceIcon';
import type { Locale } from '@/i18n/config';
import { getWorkspaceCopy } from '@/i18n/workspace';
import { workspaceApi } from '@/lib/workspace-api';
import type { AssistantSource } from '@/types/workspace';

type Turn = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: AssistantSource[];
  status?: 'answered' | 'unsure';
  queryId?: string;
};

let turnCounter = 0;
function nextTurnId() {
  turnCounter += 1;
  return `turn-${turnCounter}`;
}

/** The user question that produced this answer, in the user's own words. */
function askedBefore(turns: Turn[], answerId: string) {
  const index = turns.findIndex((turn) => turn.id === answerId);
  for (let i = index - 1; i >= 0; i -= 1) {
    if (turns[i].role === 'user') return turns[i].text;
  }
  return '';
}

export default function AssistantWidget({ locale }: { locale: Locale }) {
  const copy = getWorkspaceCopy(locale).assistant;
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [escalateFor, setEscalateFor] = useState<string | null>(null);
  const [escalateMessage, setEscalateMessage] = useState('');
  const [escalateContact, setEscalateContact] = useState('');
  const [shareQuestion, setShareQuestion] = useState(true);
  const [escalated, setEscalated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [turns, busy, escalateFor, escalated]);

  // Escape closes the panel and returns focus to the launcher, so a keyboard
  // user is never left focused on a hidden subtree.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      launcherRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const ask = async (text: string) => {
    const trimmed = text.trim().slice(0, 500);
    if (!trimmed || busy) return;
    setError('');
    setEscalateFor(null);
    setEscalated(false);
    setTurns((current) => [...current, { id: nextTurnId(), role: 'user', text: trimmed }]);
    setQuestion('');
    setBusy(true);
    try {
      const answer = await workspaceApi.assistantAsk(trimmed, locale);
      setTurns((current) => [...current, {
        id: nextTurnId(),
        role: 'assistant',
        text: answer.answer,
        sources: answer.sources,
        status: answer.status,
        queryId: answer.query_id,
      }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.failed);
    } finally {
      setBusy(false);
    }
  };

  const sendEscalation = async (queryId: string, question: string) => {
    setBusy(true);
    setError('');
    try {
      await workspaceApi.assistantEscalate({
        query_id: queryId,
        // The stored copy is redacted, so the original wording travels only
        // from here — and only when the user ticked the box.
        question: shareQuestion ? question : '',
        question_consent: shareQuestion,
        message: escalateMessage,
        contact: escalateContact,
      });
      setEscalated(true);
      setEscalateFor(null);
      setEscalateMessage('');
      setEscalateContact('');
      setShareQuestion(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.failed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        className={open ? 'twk-assistant-launcher is-open' : 'twk-assistant-launcher'}
        aria-label={open ? copy.close : copy.launcher}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <WorkspaceIcon name={open ? 'x' : 'bot'} />
        <span>{copy.launcher}</span>
      </button>

      {open ? (
        <section className="twk-assistant-panel" role="dialog" aria-label={copy.title}>
          <header className="twk-assistant-head">
            <span className="twk-assistant-avatar"><WorkspaceIcon name="bot" /></span>
            <div>
              <strong>{copy.title}</strong>
              <small>{copy.subtitle}</small>
            </div>
            <button
              type="button"
              className="twk-icon-button"
              aria-label={copy.close}
              onClick={() => { setOpen(false); launcherRef.current?.focus(); }}
            >
              <WorkspaceIcon name="x" />
            </button>
          </header>

          <div className="twk-assistant-log" ref={logRef}>
            {turns.length === 0 ? (
              <div className="twk-assistant-greeting">
                <p>{copy.greeting}</p>
                <div className="twk-assistant-suggestions">
                  {copy.suggestions.map((suggestion) => (
                    <button key={suggestion} type="button" onClick={() => ask(suggestion)}>{suggestion}</button>
                  ))}
                </div>
              </div>
            ) : null}

            {turns.map((turn) => (
              <div key={turn.id} className={`twk-assistant-turn is-${turn.role}`}>
                <span className="twk-turn-author">{turn.role === 'user' ? copy.you : copy.name}</span>
                <p>{turn.text}</p>

                {turn.sources && turn.sources.length ? (
                  <div className="twk-turn-sources">
                    <span>{copy.sourcesLabel}</span>
                    {turn.sources.map((source) => (
                      <Link key={source.href} href={`/${locale}${source.href}`}>
                        <WorkspaceIcon name={source.kind === 'kb' ? 'book' : 'arrow'} />
                        {source.label}
                      </Link>
                    ))}
                  </div>
                ) : null}

                {turn.role === 'assistant' && turn.status === 'unsure' && turn.queryId ? (
                  <div className="twk-turn-escalate">
                    <span className="twk-status-pill is-warn">{copy.unsureBadge}</span>
                    {escalated ? (
                      <p className="twk-request-ack"><WorkspaceIcon name="check" />{copy.escalateDone}</p>
                    ) : escalateFor === turn.queryId ? (
                      <form
                        className="twk-request-form"
                        onSubmit={(event) => {
                          event.preventDefault();
                          void sendEscalation(turn.queryId as string, askedBefore(turns, turn.id));
                        }}
                      >
                        <p className="twk-request-note">{copy.escalateCopy}</p>
                        <label className="twk-consent">
                          <input
                            type="checkbox"
                            checked={shareQuestion}
                            onChange={(event) => setShareQuestion(event.target.checked)}
                          />
                          <span>{copy.escalateConsent}</span>
                        </label>
                        {!shareQuestion ? (
                          <p className="twk-consent-note">{copy.escalateConsentRequired}</p>
                        ) : null}
                        <label>
                          <span>{copy.escalateMessageLabel}</span>
                          <textarea
                            rows={2}
                            maxLength={2000}
                            value={escalateMessage}
                            placeholder={copy.escalateMessagePlaceholder}
                            onChange={(event) => setEscalateMessage(event.target.value)}
                          />
                        </label>
                        <label>
                          <span>{copy.escalateContactLabel}</span>
                          <input
                            maxLength={190}
                            value={escalateContact}
                            placeholder={copy.escalateContactPlaceholder}
                            onChange={(event) => setEscalateContact(event.target.value)}
                          />
                        </label>
                        <div className="twk-request-actions">
                          <button className="twk-primary-button" type="submit" disabled={busy}>{copy.escalateSubmit}</button>
                          <button className="twk-text-button" type="button" onClick={() => setEscalateFor(null)}>{copy.close}</button>
                        </div>
                      </form>
                    ) : (
                      <button className="twk-secondary-button" type="button" onClick={() => setEscalateFor(turn.queryId as string)}>
                        {copy.escalateCta}
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            ))}

            {busy ? <p className="twk-assistant-thinking">{copy.thinking}</p> : null}
            {error ? <p className="twk-form-error">{error}</p> : null}
          </div>

          <form
            className="twk-assistant-input"
            onSubmit={(event) => { event.preventDefault(); void ask(question); }}
          >
            <input
              ref={inputRef}
              value={question}
              maxLength={500}
              placeholder={copy.placeholder}
              onChange={(event) => setQuestion(event.target.value)}
            />
            <button type="submit" className="twk-primary-button" disabled={busy || !question.trim()}>
              {copy.send}
            </button>
          </form>
          <p className="twk-assistant-scope">{copy.scopeNote}</p>
        </section>
      ) : null}
    </>
  );
}
