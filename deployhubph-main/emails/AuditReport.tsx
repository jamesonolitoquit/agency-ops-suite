import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from 'react-email';

interface Props {
  url: string;
  performance: number;
  seo: number;
  accessibility: number;
  bestPractices: number;
  brokenLinks: number;
  mixedContentIssues: number;
  passedHeaders: number;
  totalHeaders: number;
  imageIssues: number;
}

function scoreLabel(score: number) {
  if (score >= 90) return '✅ Good';
  if (score >= 50) return '⚠️ Needs work';
  return '❌ Poor';
}

function ScoreRow({ label, score }: { label: string; score: number }) {
  return (
    <Section style={row}>
      <Text style={rowLabel}>{label}</Text>
      <Text style={{ ...rowValue, color: score >= 90 ? '#4ade80' : score >= 50 ? '#facc15' : '#f87171' }}>
        {score}/100 — {scoreLabel(score)}
      </Text>
    </Section>
  );
}

function StatusRow({ label, ok, detail }: { label: string; ok: boolean; detail?: string }) {
  return (
    <Section style={row}>
      <Text style={rowLabel}>{label}</Text>
      <Text style={{ ...rowValue, color: ok ? '#4ade80' : '#f87171' }}>
        {ok ? '✅ Pass' : '❌ Fail'}{detail ? ` — ${detail}` : ''}
      </Text>
    </Section>
  );
}

export default function AuditReportEmail({
  url, performance, seo, accessibility, bestPractices,
  brokenLinks, mixedContentIssues, passedHeaders, totalHeaders, imageIssues,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Your Deploy Check audit report for {url}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>Deploy Hub</Text>
            <Text style={headerSubtitle}>Deploy Check — Audit Report</Text>
          </Section>

          {/* Intro */}
          <Section style={content}>
            <Heading style={heading}>Your audit report is ready</Heading>
            <Text style={paragraph}>
              Here's a summary of the Deploy Check audit for:
            </Text>
            <Section style={urlBox}>
              <Text style={urlText}>{url}</Text>
            </Section>

            <Hr style={divider} />

            {/* Lighthouse */}
            <Text style={sectionTitle}>Lighthouse Scores</Text>
            <Section style={detailsBox}>
              <ScoreRow label="Performance" score={performance} />
              <ScoreRow label="SEO" score={seo} />
              <ScoreRow label="Accessibility" score={accessibility} />
              <ScoreRow label="Best Practices" score={bestPractices} />
            </Section>

            <Hr style={divider} />

            {/* Security & Quality */}
            <Text style={sectionTitle}>Security & Quality</Text>
            <Section style={detailsBox}>
              <StatusRow label="Security Headers" ok={passedHeaders === totalHeaders} detail={`${passedHeaders}/${totalHeaders} passed`} />
              <StatusRow label="Mixed Content" ok={mixedContentIssues === 0} detail={mixedContentIssues > 0 ? `${mixedContentIssues} issue(s) found` : undefined} />
              <StatusRow label="Broken Links" ok={brokenLinks === 0} detail={brokenLinks > 0 ? `${brokenLinks} broken link(s)` : undefined} />
              <StatusRow label="Image Alt Tags" ok={imageIssues === 0} detail={imageIssues > 0 ? `${imageIssues} image(s) missing alt` : undefined} />
            </Section>

            <Hr style={divider} />

            <Text style={paragraph}>
              Want a full manual security audit, penetration test, and detailed fix report? Our team at Deploy Hub can help.
            </Text>

            <Section style={{ textAlign: 'center', marginTop: '8px' }}>
              <a href="https://www.deployhub.ph/contact" style={ctaButton}>
                Book a Free Consultation
              </a>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>Deploy Hub · deployhubph@gmail.com</Text>
            <Text style={footerNote}>You're receiving this because you requested an audit report on deployhub.ph</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = { backgroundColor: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', margin: 0, padding: '40px 0' };
const container: React.CSSProperties = { backgroundColor: '#1e293b', borderRadius: '16px', maxWidth: '560px', margin: '0 auto', overflow: 'hidden', border: '1px solid #334155' };
const header: React.CSSProperties = { background: 'linear-gradient(135deg, #0891b2, #3b82f6)', padding: '32px 40px', textAlign: 'center' };
const logo: React.CSSProperties = { color: '#ffffff', fontSize: '24px', fontWeight: '700', margin: '0 0 4px', letterSpacing: '-0.5px' };
const headerSubtitle: React.CSSProperties = { color: 'rgba(255,255,255,0.75)', fontSize: '13px', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' };
const content: React.CSSProperties = { padding: '32px 40px' };
const heading: React.CSSProperties = { color: '#f1f5f9', fontSize: '22px', fontWeight: '600', margin: '0 0 12px' };
const paragraph: React.CSSProperties = { color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', margin: '0 0 16px' };
const urlBox: React.CSSProperties = { backgroundColor: '#0f172a', borderRadius: '10px', padding: '12px 16px', borderLeft: '3px solid #22d3ee' };
const urlText: React.CSSProperties = { color: '#22d3ee', fontSize: '14px', margin: 0, wordBreak: 'break-all' };
const divider: React.CSSProperties = { borderColor: '#334155', margin: '24px 0' };
const sectionTitle: React.CSSProperties = { color: '#64748b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' };
const detailsBox: React.CSSProperties = { backgroundColor: '#0f172a', borderRadius: '12px', padding: '4px 20px' };
const row: React.CSSProperties = { padding: '10px 0', borderBottom: '1px solid #1e293b' };
const rowLabel: React.CSSProperties = { color: '#94a3b8', fontSize: '14px', margin: '0 0 2px' };
const rowValue: React.CSSProperties = { fontSize: '14px', fontWeight: '600', margin: 0 };
const ctaButton: React.CSSProperties = { background: 'linear-gradient(135deg, #0891b2, #3b82f6)', borderRadius: '999px', color: '#ffffff', display: 'inline-block', fontSize: '14px', fontWeight: '600', padding: '12px 28px', textDecoration: 'none' };
const footer: React.CSSProperties = { backgroundColor: '#0f172a', padding: '20px 40px', textAlign: 'center' };
const footerText: React.CSSProperties = { color: '#475569', fontSize: '12px', margin: '0 0 4px' };
const footerNote: React.CSSProperties = { color: '#334155', fontSize: '11px', margin: 0 };
