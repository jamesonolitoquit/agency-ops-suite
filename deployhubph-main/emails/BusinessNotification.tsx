import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'react-email';

interface Props {
  fromName: string;
  fromEmail: string;
  businessName: string;
  serviceNeeded: string;
  budgetRange: string;
  projectDetails: string;
}

export default function BusinessNotification({
  fromName,
  fromEmail,
  businessName,
  serviceNeeded,
  budgetRange,
  projectDetails,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>New inquiry from {fromName}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>Deploy Hub</Text>
            <Text style={headerSubtitle}>New Client Inquiry</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={heading}>You have a new inquiry 🎉</Heading>
            <Text style={paragraph}>
              A potential client has submitted an inquiry through your website. Here are the details:
            </Text>

            <Hr style={divider} />

            {/* Details */}
            <Section style={detailsBox}>
              <Row label="Full Name" value={fromName} />
              <Row label="Email Address" value={fromEmail} />
              <Row label="Business Name" value={businessName} />
              <Row label="Service Needed" value={serviceNeeded} />
              <Row label="Budget Range" value={budgetRange} />
            </Section>

            <Hr style={divider} />

            <Text style={detailLabel}>Project Details</Text>
            <Section style={projectBox}>
              <Text style={projectText}>{projectDetails}</Text>
            </Section>

            <Hr style={divider} />

            <Text style={paragraph}>
              Reply directly to this email or reach the client at{' '}
              <a href={`mailto:${fromEmail}`} style={link}>
                {fromEmail}
              </a>
              .
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>Deploy Hub · deployhubph@gmail.com</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Section style={row}>
      <Text style={detailLabel}>{label}</Text>
      <Text style={detailValue}>{value}</Text>
    </Section>
  );
}

const body: React.CSSProperties = {
  backgroundColor: '#0f172a',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  margin: 0,
  padding: '40px 0',
};

const container: React.CSSProperties = {
  backgroundColor: '#1e293b',
  borderRadius: '16px',
  maxWidth: '560px',
  margin: '0 auto',
  overflow: 'hidden',
  border: '1px solid #334155',
};

const header: React.CSSProperties = {
  background: 'linear-gradient(135deg, #0891b2, #3b82f6)',
  padding: '32px 40px',
  textAlign: 'center',
};

const logo: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 4px',
  letterSpacing: '-0.5px',
};

const headerSubtitle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.75)',
  fontSize: '13px',
  margin: 0,
  textTransform: 'uppercase',
  letterSpacing: '2px',
};

const content: React.CSSProperties = {
  padding: '32px 40px',
};

const heading: React.CSSProperties = {
  color: '#f1f5f9',
  fontSize: '22px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const paragraph: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 24px',
};

const divider: React.CSSProperties = {
  borderColor: '#334155',
  margin: '24px 0',
};

const detailsBox: React.CSSProperties = {
  backgroundColor: '#0f172a',
  borderRadius: '12px',
  padding: '8px 20px',
};

const row: React.CSSProperties = {
  padding: '10px 0',
  borderBottom: '1px solid #1e293b',
};

const detailLabel: React.CSSProperties = {
  color: '#64748b',
  fontSize: '11px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  margin: '0 0 2px',
};

const detailValue: React.CSSProperties = {
  color: '#e2e8f0',
  fontSize: '15px',
  margin: 0,
};

const projectBox: React.CSSProperties = {
  backgroundColor: '#0f172a',
  borderRadius: '12px',
  padding: '16px 20px',
  borderLeft: '3px solid #22d3ee',
};

const projectText: React.CSSProperties = {
  color: '#cbd5e1',
  fontSize: '14px',
  lineHeight: '1.7',
  margin: 0,
  whiteSpace: 'pre-wrap',
};

const link: React.CSSProperties = {
  color: '#22d3ee',
  textDecoration: 'none',
};

const footer: React.CSSProperties = {
  backgroundColor: '#0f172a',
  padding: '20px 40px',
  textAlign: 'center',
};

const footerText: React.CSSProperties = {
  color: '#475569',
  fontSize: '12px',
  margin: 0,
};
