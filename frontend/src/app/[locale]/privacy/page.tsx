import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';

export default function PrivacyPage() {
  return (
    <div className="bm-page">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-32 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Legal</p>
        <h1 className="mt-3 text-4xl font-bold text-slate-950 dark:text-white">Privacy Policy</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
          This policy explains how TVIJO handles account, product and newsletter data. It is provided as a product-facing placeholder and should be reviewed by counsel before production launch.
        </p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-slate-600 dark:text-slate-400">
          <section>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Data We Collect</h2>
            <p className="mt-3">
              We may collect account details, workspace activity, product usage, support requests and newsletter preferences needed to operate and improve the service.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">How We Use Data</h2>
            <p className="mt-3">
              Data is used to authenticate users, provide AI governance features, send requested communications, protect the service and measure product performance.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Newsletter Consent</h2>
            <p className="mt-3">
              Newsletter emails are sent only when you opt in. You can unsubscribe at any time through email links or available account preferences.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Contact</h2>
            <p className="mt-3">For privacy questions or data requests, contact the TVIJO team through the support channels listed on the site.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
