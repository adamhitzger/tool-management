import VerifyOTP from "@/components/forms/verify-otp";
import { Wrench, ShieldCheck } from "lucide-react";

export default function Verify() {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-background to-background p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Wrench className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">Teijin</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-foreground text-balance">
            Ověření identity
          </h1>
          <p className="text-lg text-muted-foreground text-pretty">
            Pro vaši bezpečnost používáme jednorázové kódy zasílané na váš
            e-mail.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Teijin Tool Management
        </p>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Wrench className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              Teijin
            </span>
          </div>

          <div className="space-y-4 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">
              Zadejte kód
            </h2>
            <p className="text-muted-foreground">
              Na váš e-mail jsme odeslali 6místný ověřovací kód
            </p>
          </div>

          <div className="flex justify-center">
            <VerifyOTP />
          </div>
        </div>
      </div>
    </div>
  );
}
