import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EvidenceFrame, StudyMethodology } from '@/components/compare/AgentEvidence';
import ProgrammeEvidence from '@/components/compare/ProgrammeEvidence';
import { marketingMetadata, ENGLISH_ONLY_LOCALES } from '@/lib/seo/marketing';

export function generateStaticParams() { return [{ locale: 'en' }]; }
export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return marketingMetadata({ locale: params.locale, path: '/compare/methodology', title: 'Agent comparison methodology and source limits | Tvijo', description: 'Six agent studies with historical settings, versions, metrics and limits. Learn how to compare quality, time and cost without mixing unlike results.', keywords: ['agent evaluation methodology', 'harness comparison', 'coding agent evidence'], indexIn: ENGLISH_ONLY_LOCALES });
}
export default function MethodologyPage({ params }: { params: { locale: string } }) {
  if (params.locale !== 'en') notFound();
  return <EvidenceFrame title="Compare the whole configuration" intro="A useful result names the model, harness, provider, task and acceptance check. We keep external studies, own evidence and evaluation hypotheses distinct."><p className="mb-8 text-sm leading-6 text-slate-300">This page explains how we read agent studies published by others and where their sources stop. The protocol for our own trials — what we compare, when a result counts as accepted and how cost is counted — is <a className="text-blue-300 underline underline-offset-4" href="/wiki/tvijo-agent-evaluation-method/">How we evaluate AI agents</a>.</p><ProgrammeEvidence summary /><StudyMethodology /></EvidenceFrame>;
}
