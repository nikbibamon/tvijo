'use client';

/**
 * FAQ — copy lives in src/i18n/locales/*.ts (`faqPage`); English is the source of truth.
 */

import { useState } from 'react';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import { useLocale } from '@/i18n/useLocale';

interface FAQItem {
  question: string;
  answer: string;
}

function AccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-slate-700/50 rounded-xl overflow-hidden mb-3 bg-slate-900/40">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-800/50 transition-colors"
      >
        <span className="font-semibold text-white">{item.question}</span>
        <span className={`text-slate-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && <div className="px-6 pb-4 text-gray-300 leading-relaxed">{item.answer}</div>}
    </div>
  );
}

export default function FAQPage() {
  const { t } = useLocale();
  const c = t.faqPage;
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (key: string) => {
    const newOpen = new Set(openItems);
    if (newOpen.has(key)) newOpen.delete(key);
    else newOpen.add(key);
    setOpenItems(newOpen);
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: c.categories.flatMap((category) =>
      category.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      }))
    ),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4">{c.title}</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">{c.sub}</p>
        </section>

        <section className="space-y-8">
          {c.categories.map((category) => (
            <div key={category.name}>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>{category.icon}</span>
                {category.name}
              </h2>
              {category.items.map((item, idx) => {
                const key = `${category.name}-${idx}`;
                return (
                  <AccordionItem key={key} item={item} isOpen={openItems.has(key)} onToggle={() => toggleItem(key)} />
                );
              })}
            </div>
          ))}
        </section>

        <section className="mt-16 text-center">
          <p className="text-gray-400 mb-4">{c.stillEvaluating}</p>
          <a
            href="https://t.me/bibamon"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors"
          >
            {c.contact}
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
}
