import { Html, Button, Text } from "@react-email/components";

type SignInEmailProps = {
  code: string;
};

export function SignInEmail({ code }: SignInEmailProps) {
  return (
    <Html lang="en">
      <Text>{code}</Text>
      <Button href="http://localhost:3000/verify">
        Zadejte kód
      </Button>
    </Html>
  );
}
