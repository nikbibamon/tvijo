import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Eye,
  FileCode2,
  FileText,
  Gauge,
  KeyRound,
  LockKeyhole,
  Server,
  ShieldCheck,
} from 'lucide-react';
import { LOCALES } from '@/i18n/config';
import {
  AGENT_SKILL_INDEX_LOCALES,
  agentSkillsCopy,
  agentSkillsLocale,
} from '@/data/agent-skills';
import {
  breadcrumbJsonLd,
  marketingMetadata,
  normalizeLocale,
} from '@/lib/seo/marketing';
import styles from './agent-skills.module.css';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  const copy = agentSkillsCopy[agentSkillsLocale(params.locale)];
  return marketingMetadata({
    locale: params.locale,
    path: '/agent-skills',
    title: copy.metaTitle,
    description: copy.metaDescription,
    keywords: ['AI agent skills', 'agent skill packs', 'reusable AI skills', 'AI plugins', 'Claude skills', 'AI agent workflows'],
    indexIn: AGENT_SKILL_INDEX_LOCALES,
  });
}

const PUBLIC_ICONS = [Eye, FileText, BookOpen, Server];
const PRIVATE_ICONS = [LockKeyhole, KeyRound, Gauge, ShieldCheck];

export default function AgentSkillsPage({ params }: { params: { locale: string } }) {
  const locale = normalizeLocale(params.locale);
  const copy = agentSkillsCopy[agentSkillsLocale(locale)];
  const workspaceHref = `/${locale}/workspace/plugins`;
  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: copy.nav.packs, path: '/agent-skills' },
  ]);
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: copy.catalogue.title,
    numberOfItems: copy.packs.length,
    itemListElement: copy.packs.map((pack, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: pack.title,
      description: pack.description,
      url: `https://tvijo.com/${locale}/agent-skills#${pack.key}`,
    })),
  };

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href={`/${locale}`} className={styles.logo} aria-label="Tvijo home">
            <span>Tvijo</span>
            <i aria-hidden="true" />
          </Link>
          <nav className={styles.nav} aria-label="Agent skills">
            <a href="#packs">{copy.nav.packs}</a>
            <a href="#how">{copy.nav.how}</a>
            <a href="#trust">{copy.nav.trust}</a>
          </nav>
          <div className={styles.headerActions}>
            <Link href={`/${locale}/login`} className={styles.signIn}>
              {copy.nav.signIn}
            </Link>
            <Link href={workspaceHref} className={styles.headerCta}>
              {copy.nav.workspace}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.shell}>
            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <h1>{copy.hero.title}</h1>
                <p>{copy.hero.lede}</p>
                <div className={styles.heroActions}>
                  <a href="#packs" className={styles.primaryButton}>
                    {copy.hero.primary}
                    <ArrowRight aria-hidden="true" />
                  </a>
                  <a href="#how" className={styles.secondaryButton}>
                    {copy.hero.secondary}
                  </a>
                </div>
                <ul className={styles.proofList}>
                  {copy.hero.proofs.map((proof) => (
                    <li key={proof}>
                      <CheckCircle2 aria-hidden="true" />
                      {proof}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.productVisual} aria-label={copy.hero.documentTitle}>
                <div className={styles.documentWindow}>
                  <div className={styles.windowBar}>
                    <span><i /><i /><i /></span>
                    <code>SKILL.md</code>
                  </div>
                  <div className={styles.documentBody}>
                    <div className={styles.documentLabel}>
                      <FileCode2 aria-hidden="true" />
                      {copy.hero.documentLabel}
                    </div>
                    <h2>{copy.hero.documentTitle}</h2>
                    <p>{copy.hero.documentDescription}</p>
                    <div className={styles.codeLines} aria-hidden="true">
                      <span><b>name:</b> impeccable</span>
                      <span><b>version:</b> 1.0.0</span>
                      <span><b>trust:</b> verified_core</span>
                      <span><b>instructions:</b> readable Markdown</span>
                    </div>
                  </div>
                </div>
                <div className={styles.flow}>
                  <div><Server aria-hidden="true" /><span>{copy.hero.flowAgent}</span></div>
                  <ArrowRight aria-hidden="true" />
                  <div className={styles.gatewayNode}>
                    <ShieldCheck aria-hidden="true" />
                    <span>{copy.hero.flowGateway}<small>{copy.hero.flowGatewayNote}</small></span>
                  </div>
                  <ArrowRight aria-hidden="true" />
                  <div><FileCode2 aria-hidden="true" /><span>{copy.hero.flowProvider}</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.catalogue} id="packs">
          <div className={styles.shell}>
            <p className={styles.eyebrow}>{copy.catalogue.eyebrow}</p>
            <div className={styles.sectionLead}>
              <h2>{copy.catalogue.title}</h2>
              <p>{copy.catalogue.lede}</p>
            </div>
            <div className={styles.packList}>
              {copy.packs.map((pack, index) => (
                <article className={styles.packRow} id={pack.key} key={pack.key} data-pack={pack.key}>
                  <span className={styles.packNumber}>0{index + 1}</span>
                  <div className={styles.packName}>
                    <h3>{pack.title}</h3>
                    <code>v{pack.version}</code>
                  </div>
                  <p>{pack.description}</p>
                  <div className={styles.packMeta}>
                    <span>{pack.tier}</span>
                    <small>{pack.files} {copy.catalogue.files}</small>
                  </div>
                </article>
              ))}
            </div>
            <div className={styles.catalogueFoot}>
              <p><Check aria-hidden="true" />{copy.catalogue.note}</p>
              <Link href={workspaceHref}>
                {copy.catalogue.cta}
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.how} id="how">
          <div className={styles.shell}>
            <p className={styles.eyebrow}>{copy.how.eyebrow}</p>
            <div className={styles.sectionLead}>
              <h2>{copy.how.title}</h2>
              <p>{copy.how.lede}</p>
            </div>
            <div className={styles.steps}>
              {copy.how.steps.map((step) => (
                <article key={step.number}>
                  <span>{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              ))}
            </div>
            <div className={styles.configGrid}>
              <div className={styles.configIntro}>
                <ShieldCheck aria-hidden="true" />
                <h3>{copy.how.configTitle}</h3>
                <p>{copy.how.privateNote}</p>
                <Link href={`/${locale}/workspace/connections`}>
                  {copy.how.cta}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </div>
              <div className={styles.configWindow}>
                <div className={styles.windowBar}>
                  <span><i /><i /><i /></span>
                  <code>config.yaml</code>
                </div>
                <pre>{`model:\n  default: aios-fast\n  provider: custom\n  base_url: <YOUR_APPROVED_GATEWAY>/v1\n  api_key: <YOUR_GATEWAY_KEY>`}</pre>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.trust} id="trust">
          <div className={styles.shell}>
            <p className={styles.eyebrow}>{copy.trust.eyebrow}</p>
            <div className={`${styles.sectionLead} ${styles.trustLead}`}>
              <h2>{copy.trust.title}</h2>
              <p>{copy.trust.lede}</p>
            </div>
            <div className={styles.boundaryGrid}>
              <div className={styles.publicColumn}>
                <h3>{copy.trust.publicTitle}</h3>
                <ul>
                  {copy.trust.publicItems.map((item, index) => {
                    const Icon = PUBLIC_ICONS[index];
                    return <li key={item}><Icon aria-hidden="true" /><span>{item}</span></li>;
                  })}
                </ul>
              </div>
              <div className={styles.privateColumn}>
                <h3>{copy.trust.privateTitle}</h3>
                <ul>
                  {copy.trust.privateItems.map((item, index) => {
                    const Icon = PRIVATE_ICONS[index];
                    return <li key={item}><Icon aria-hidden="true" /><span>{item}</span></li>;
                  })}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.finalCta}>
          <div className={styles.shell}>
            <h2>{copy.finalCta.title}</h2>
            <p>{copy.finalCta.lede}</p>
            <div className={styles.finalActions}>
              <a href="#packs" className={styles.primaryButton}>{copy.finalCta.primary}</a>
              <Link href={workspaceHref} className={styles.secondaryButton}>{copy.finalCta.secondary}</Link>
            </div>
            <span className={styles.provisionNote}>
              <ShieldCheck aria-hidden="true" />
              {copy.finalCta.note}
            </span>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Link href={`/${locale}`} className={styles.logo}><span>Tvijo</span><i aria-hidden="true" /></Link>
          <nav aria-label="Footer">
            <a href="#packs">{copy.nav.packs}</a>
            <a href="#how">{copy.nav.how}</a>
            <Link href={`/${locale}/agent-skills/axes`}>Value axes</Link>
            <Link href={`/${locale}/security`}>Security</Link>
            <Link href={`/${locale}/privacy`}>Privacy</Link>
            <Link href={`/${locale}/login`}>{copy.nav.signIn}</Link>
          </nav>
          <p>{copy.footerTagline}</p>
        </div>
      </footer>
    </div>
  );
}
