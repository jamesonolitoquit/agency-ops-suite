import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from 'react-email';

interface Props {
  name: string;
  websiteUrl: string;
  auditType: string;
}

export default function ManualAuditConfirmation({ name, websiteUrl, auditType }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Your manual audit booking is confirmed — Deploy Hub</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>Deploy Hub</Text>
            <Text style={headerSubtitle}>Booking Confirmed</Text>
          </Section>
          <Section style={content}>
            <Heading style={heading}>We've got your booking, {name}! 🎉</Heading>
            <Text style={paragraph}>
              Thanks for booking a manual audit with Deploy Hub. Our team will review your request and reach out within <strong style={highlight}>24 hours</strong> to schedule your audit session.
            </Text>
            <Hr style={divider} />
            <Text style={sectionLabel}>Booking Summary</Text>
            <Section style={detailsBox}>
              <Section style={row}>
                <Text style={rowLabel}>Website</Text>
                <Text style={rowValue}>{websiteUrl}</Text>
              </Section>
              <Section style={row}>
                <Text style={rowLabel}>Audit Type</Text>
                <Text style={rowValue}>{auditType}</Text>
              </Section>
            </Section>
            <Hr style={divider} />
            <Text style={paragraph}>
              In the meantime, you can run a free automated scan anytime using our Deploy Check tool.
            </Text>
            <Section style={{ textAlign: 'center', marginTop: '8px' }}>
              <a href="https://www.deployhub.ph/audit" style={ctaButton}>
                Run Another Scan
              </a>
            </Section>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>Deploy Hub · deployhubph@gmail.com</Text>
            <Text style={footerNote}>You're receiving this because you booked a manual audit on deployhub.ph</Text>
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
const highlight: React.CSSProperties = { color: '#22d3ee' };
const divider: React.CSSProperties = { borderColor: '#334155', margin: '24px 0' };
const sectionLabel: React.CSSProperties = { color: '#64748b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' };
const detailsBox: React.CSSProperties = { backgroundColor: '#0f172a', borderRadius: '12px', padding: '8px 20px' };
const row: React.CSSProperties = { padding: '10px 0', borderBottom: '1px solid #1e293b' };
const rowLabel: React.CSSProperties = { color: '#64748b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 2px' };
const rowValue: React.CSSProperties = { color: '#e2e8f0', fontSize: '15px', margin: 0 };
const ctaButton: React.CSSProperties = { background: 'linear-gradient(135deg, #0891b2, #3b82f6)', borderRadius: '999px', color: '#ffffff', display: 'inline-block', fontSize: '14px', fontWeight: '600', padding: '12px 28px', textDecoration: 'none' };
const footer: React.CSSProperties = { backgroundColor: '#0f172a', padding: '20px 40px', textAlign: 'center' };
const footerText: React.CSSProperties = { color: '#475569', fontSize: '12px', margin: '0 0 4px' };
const footerNote: React.CSSProperties = { color: '#334155', fontSize: '11px', margin: 0 };
