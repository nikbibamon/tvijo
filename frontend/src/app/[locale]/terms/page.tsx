import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';

export default function TermsPage() {
  return (
    <div className="bm-page">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-32 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Legal</p>
        <h1 className="mt-3 text-4xl font-bold text-slate-950 dark:text-white">Terms of Service</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
          These terms describe the basic rules for using TVIJO AI OS, demo workspaces and related services. They are provided as a product-facing placeholder and should be reviewed by counsel before production launch.
        </p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-slate-600 dark:text-slate-400">
          <section>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Use of the Service</h2>
            <p className="mt-3">
              You may use the service only for lawful business purposes and in compliance with applicable regulations, security policies and third-party model provider terms.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Accounts</h2>
            <p className="mt-3">
              You are responsible for keeping account credentials secure and for activity performed through your account. We may require email verification before activating access.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Subscriptions</h2>
            <p className="mt-3">
              Paid plans, trials and usage limits are presented on the pricing page or in an order form. Access may be limited if a subscription expires or payment fails.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Contact</h2>
            <p className="mt-3">For terms questions, contact the TVIJO team through the demo or support channels listed on the site.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
