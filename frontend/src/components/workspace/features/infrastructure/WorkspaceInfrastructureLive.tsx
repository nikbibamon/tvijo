'use client';

import { usePathname } from 'next/navigation';
import { workspaceApi } from '@/lib/workspace-api';
import { useWorkspaceData } from '@/hooks/use-workspace-data';
import { WorkspaceIcon } from '@/components/workspace/WorkspaceIcon';
import { WsEmpty, WsError, WsSnippet } from '@/components/workspace/ui/primitives';
import { parseLocale } from '@/i18n/config';
import { getWorkspaceCopy } from '@/i18n/workspace';

export default function WorkspaceInfrastructureLive() {
  const locale = parseLocale(usePathname());
  const t = getWorkspaceCopy(locale).infrastructure;
  const capability = useWorkspaceData(() => workspaceApi.infraCapability(), []);
  const orders = useWorkspaceData(() => workspaceApi.infraOrders(), []);
  return (
    <div className="twk-admin-page">
      <header className="twk-admin-heading"><div><p className="twk-eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p>{t.subtitle}</p></div></header>
      {capability.loading ? <WsSnippet kind="metrics" rows={2} /> : null}
      {capability.error ? <WsError message={capability.error} onRetry={capability.reload} /> : null}
      {capability.data ? <section className="twk-capability-grid"><article className="twk-admin-panel"><span className="twk-tone-icon twk-tone-icon--teal"><WorkspaceIcon name="server" /></span><div><p>{t.providerIntegration}</p><strong>{capability.data.configured ? t.configured : t.notConfigured}</strong><small>{capability.data.detail || (capability.data.granted ? t.capabilityVerified : t.notGranted)}</small></div></article><article className="twk-admin-panel"><span className="twk-tone-icon twk-tone-icon--neutral"><WorkspaceIcon name="shield" /></span><div><p>{t.provisioning}</p><strong>{capability.data.provisioning_enabled ? t.featureEnabled : t.humanApprovalOnly}</strong><small>{t.quoteApproval}</small></div></article></section> : null}
      <section className="twk-admin-panel twk-infra-explainer"><header className="twk-admin-panel-head"><div><h2>{t.safeFlowTitle}</h2></div></header><div className="twk-billing-lanes"><article><span>1</span><WorkspaceIcon name="server" /><strong>{t.stepChoose}</strong><p>{t.stepChooseCopy}</p></article><i><WorkspaceIcon name="arrow" /></i><article><span>2</span><WorkspaceIcon name="file" /><strong>{t.stepQuote}</strong><p>{t.stepQuoteCopy}</p></article><i><WorkspaceIcon name="arrow" /></i><article><span>3</span><WorkspaceIcon name="user" /><strong>{t.stepApproval}</strong><p>{t.stepApprovalCopy}</p></article><i><WorkspaceIcon name="arrow" /></i><article><span>4</span><WorkspaceIcon name="check" /><strong>{t.stepRule}</strong><p>{t.stepRuleCopy}</p></article></div></section>
      {orders.loading ? <WsSnippet kind="table" rows={2} /> : orders.error ? <WsError message={orders.error} onRetry={orders.reload} /> : orders.data?.orders.length ? <section className="twk-admin-panel"><header className="twk-admin-panel-head"><div><h2>{t.yourRequests}</h2></div></header><div className="twk-admin-table">{orders.data.orders.map((order) => <div className="twk-admin-tr" key={order.id}><span><strong>{order.server_type}</strong><small>{order.location}</small></span><span>{order.status.replaceAll('_', ' ')}</span><span>{order.customer_quote || t.quotePending}</span><span>{new Date(order.created_at).toLocaleDateString()}</span></div>)}</div></section> : <WsEmpty title={t.noRequestsTitle} copy={t.noRequestsCopy} />}
    </div>
  );
}
