import SignUpForm from "@/components/forms/sign-up";
import { pool } from "@/database/client";
import { Organization } from "@/types";
import { Wrench } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SignUp() {

  const { rows } = await pool.query<Organization>("SELECT id,name FROM organizations");

  return (
    <div className="min-h-screen w-full flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary/20 via-background to-background p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Wrench className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">Houfek</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-foreground text-balance">
            Připojte se k Houfek Tool Management
          </h1>
          <p className="text-lg text-muted-foreground text-pretty">
            Vytvořte si účet a získejte přístup ke správě nástrojů vaší
            organizace.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Houfek Tool Management
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
              Houfek
            </span>
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold text-foreground">
              Registrace
            </h2>
            <p className="text-muted-foreground">
              Vytvořte si účet pro přístup do systému
            </p>
          </div>

          <SignUpForm rows={rows} />
        </div>
      </div>
    </div>
  );
}
