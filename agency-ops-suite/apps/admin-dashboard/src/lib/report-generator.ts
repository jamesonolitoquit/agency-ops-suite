/**
 * Client Report Generator
 * Creates downloadable HTML reports for clients with operational metrics
 */

export interface ClientReportData {
  clientId: string;
  clientName: string;
  domain: string;
  plan: string;
  monthlyFee: number;
  status: string;
  reportPeriod: string;
  generatedAt: string;
  deploymentReadiness: {
    ready: boolean;
    liveUrl: string;
  };
  operationalMetrics: {
    requestsCompleted: number;
    requestsPending: number;
    upcomingBillingDue: number;
  };
  deploymentChecklist: {
    domainConnected: boolean;
    sslActive: boolean;
    ctaWorks: boolean;
    mobileResponsive: boolean;
    seoMetaTags: boolean;
    completionPercent: number;
  };
}

export function generateClientReportHTML(data: ClientReportData): string {
  const createdDate = new Date(data.generatedAt).toLocaleDateString();
  const checkmarkIcon = '✓';
  const xIcon = '✗';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agency Ops Report - ${data.clientName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1f2937; background: #f9fafb; }
        .container { max-width: 900px; margin: 0 auto; padding: 40px 20px; }
        .page { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 40px; margin-bottom: 20px; page-break-after: always; }
        
        .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 30px; margin-bottom: 30px; }
        .header h1 { font-size: 28px; color: #111827; margin-bottom: 5px; }
        .header p { color: #6b7280; font-size: 14px; }
        .meta { display: flex; gap: 20px; margin-top: 15px; font-size: 13px; color: #6b7280; }
        .meta strong { color: #111827; }
        
        .section { margin-bottom: 30px; }
        .section h2 { font-size: 18px; color: #111827; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; }
        
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
        .info-item { background: #f3f4f6; padding: 12px; border-radius: 6px; }
        .info-label { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; }
        .info-value { font-size: 16px; color: #111827; font-weight: 500; }
        
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .status-active { background: #d1fae5; color: #065f46; }
        .status-paused { background: #fef3c7; color: #92400e; }
        .status-ready { background: #bfdbfe; color: #1e40af; }
        .status-not-ready { background: #fee2e2; color: #991b1b; }
        
        .checklist { background: #f9fafb; padding: 15px; border-radius: 6px; }
        .checklist-item { display: flex; align-items: center; padding: 8px 0; font-size: 14px; }
        .checklist-item.complete { color: #059669; }
        .checklist-item.incomplete { color: #dc2626; }
        .checklist-icon { margin-right: 10px; font-weight: bold; font-size: 16px; }
        .checklist-label { flex: 1; }
        
        .metrics-row { display: flex; gap: 20px; margin: 15px 0; }
        .metric { flex: 1; background: #f3f4f6; padding: 12px; border-radius: 6px; }
        .metric-value { font-size: 20px; font-weight: bold; color: #111827; }
        .metric-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
        
        .progress-bar { width: 100%; height: 24px; background: #e5e7eb; border-radius: 12px; overflow: hidden; margin-top: 8px; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #10b981); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 600; }
        
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
        
        @media print {
            body { background: white; }
            .page { box-shadow: none; page-break-after: always; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="page">
            <div class="header">
                <h1>${data.clientName}</h1>
                <p>Monthly Operational Report</p>
                <div class="meta">
                    <div><strong>Report Period:</strong> ${data.reportPeriod}</div>
                    <div><strong>Generated:</strong> ${createdDate}</div>
                    <div><strong>Domain:</strong> ${data.domain}</div>
                </div>
            </div>
            
            <div class="section">
                <h2>Client Overview</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Plan</div>
                        <div class="info-value">${data.plan.charAt(0).toUpperCase() + data.plan.slice(1)}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Monthly Fee</div>
                        <div class="info-value">$${(data.monthlyFee / 100).toLocaleString()}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Status</div>
                        <div class="info-value"><span class="status-badge status-${data.status === 'active' ? 'active' : 'paused'}">${data.status}</span></div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Deploy Readiness</div>
                        <div class="info-value"><span class="status-badge ${data.deploymentReadiness.ready ? 'status-ready' : 'status-not-ready'}">${data.deploymentReadiness.ready ? 'Ready' : 'Not Ready'}</span></div>
                    </div>
                </div>
                ${data.deploymentReadiness.ready ? `<div style="font-size: 13px; color: #6b7280;"><strong>Live URL:</strong> ${data.deploymentReadiness.liveUrl}</div>` : ''}
            </div>
            
            <div class="section">
                <h2>Deployment Checklist</h2>
                <div class="checklist">
                    <div class="checklist-item ${data.deploymentChecklist.domainConnected ? 'complete' : 'incomplete'}">
                        <span class="checklist-icon">${data.deploymentChecklist.domainConnected ? checkmarkIcon : xIcon}</span>
                        <span class="checklist-label">Domain Connected</span>
                    </div>
                    <div class="checklist-item ${data.deploymentChecklist.sslActive ? 'complete' : 'incomplete'}">
                        <span class="checklist-icon">${data.deploymentChecklist.sslActive ? checkmarkIcon : xIcon}</span>
                        <span class="checklist-label">SSL Certificate Active</span>
                    </div>
                    <div class="checklist-item ${data.deploymentChecklist.ctaWorks ? 'complete' : 'incomplete'}">
                        <span class="checklist-icon">${data.deploymentChecklist.ctaWorks ? checkmarkIcon : xIcon}</span>
                        <span class="checklist-label">CTA Functional</span>
                    </div>
                    <div class="checklist-item ${data.deploymentChecklist.mobileResponsive ? 'complete' : 'incomplete'}">
                        <span class="checklist-icon">${data.deploymentChecklist.mobileResponsive ? checkmarkIcon : xIcon}</span>
                        <span class="checklist-label">Mobile Responsive</span>
                    </div>
                    <div class="checklist-item ${data.deploymentChecklist.seoMetaTags ? 'complete' : 'incomplete'}">
                        <span class="checklist-icon">${data.deploymentChecklist.seoMetaTags ? checkmarkIcon : xIcon}</span>
                        <span class="checklist-label">SEO Meta Tags</span>
                    </div>
                    <div style="margin-top: 12px; font-size: 13px; font-weight: 600; color: #1f2937;">
                        Completion: <span style="color: #3b82f6;">${data.deploymentChecklist.completionPercent}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${data.deploymentChecklist.completionPercent}%">${data.deploymentChecklist.completionPercent}%</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>Operational Metrics</h2>
                <div class="metrics-row">
                    <div class="metric">
                        <div class="metric-value">${data.operationalMetrics.requestsCompleted}</div>
                        <div class="metric-label">Requests Completed</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">${data.operationalMetrics.requestsPending}</div>
                        <div class="metric-label">Requests Pending</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">$${(data.operationalMetrics.upcomingBillingDue / 100).toLocaleString()}</div>
                        <div class="metric-label">Upcoming Billing</div>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p>This report was automatically generated by the Agency Ops Suite.<br>For questions, contact your account manager.</p>
            </div>
        </div>
    </div>
</body>
</html>
`;
}
