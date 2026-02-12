import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Preview,
} from "@react-email/components";

type SignInEmailProps = {
  code: string;
  company: string;
};

export function SignInEmail({ code, company }: SignInEmailProps) {
  return (
    <Html lang="cs">
      <Head />
      <Preview>Váš přihlašovací kód: {code}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>{company}</Text>
            <Text style={logoSubtext}>Tool Management</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={title}>Přihlašovací kód</Text>
            <Text style={description}>
              Pro dokončení přihlášení použijte následující kód. Kód je platný po dobu 10 minut.
            </Text>

            {/* Code Box */}
            <Section style={codeContainer}>
              <Text style={codeText}>{code}</Text>
            </Section>

            <Text style={description}>
              Nebo klikněte na tlačítko níže pro přechod na ověřovací stránku:
            </Text>

            <Section style={buttonContainer}>
              <Button
                href="http://localhost:3000/auth/verify"
                style={button}
              >
                Zadat kód
              </Button>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Pokud jste o tento email nežádali, můžete ho ignorovat.
            </Text>
            <Text style={footerText}>
              Houfek Tool Management System
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#0f1117",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "480px",
};

const header = {
  textAlign: "center" as const,
  paddingBottom: "32px",
};

const logo = {
  color: "#4ade80",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0",
  letterSpacing: "-0.5px",
};

const logoSubtext = {
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: "500",
  margin: "4px 0 0 0",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
};

const content = {
  backgroundColor: "#1a1d27",
  borderRadius: "12px",
  padding: "40px 32px",
  border: "1px solid #2a2d3a",
};

const title = {
  color: "#f3f4f6",
  fontSize: "24px",
  fontWeight: "600",
  textAlign: "center" as const,
  margin: "0 0 16px 0",
};

const description = {
  color: "#9ca3af",
  fontSize: "15px",
  lineHeight: "24px",
  textAlign: "center" as const,
  margin: "0 0 24px 0",
};

const codeContainer = {
  backgroundColor: "#0f1117",
  borderRadius: "8px",
  padding: "24px",
  margin: "0 0 24px 0",
  border: "1px solid #2a2d3a",
};

const codeText = {
  color: "#4ade80",
  fontSize: "36px",
  fontWeight: "700",
  textAlign: "center" as const,
  margin: "0",
  letterSpacing: "8px",
  fontFamily: "monospace",
};

const buttonContainer = {
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#4ade80",
  color: "#0f1117",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
  borderRadius: "8px",
};

const divider = {
  borderColor: "#2a2d3a",
  margin: "32px 0",
};

const footer = {
  textAlign: "center" as const,
};

const footerText = {
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0 0 8px 0",
};

export default SignInEmail;