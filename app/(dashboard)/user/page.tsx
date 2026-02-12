import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, AlertTriangle, Building2 } from "lucide-react";
import { getUser } from "@/database/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { pool } from "@/database/client";
import type { Row } from "@libsql/client";
import UserForm from "@/components/forms/user-form";
import SignOutBtn from "@/components/forms/sign-out";
import DeleteBtn from "@/components/forms/delete";
import AcceptRequest from "@/components/forms/accept";
import RejectRequest from "@/components/forms/reject";
import NewOrg from "@/components/forms/new-org";

export const dynamic = "force-dynamic";

export default async function UserPage() {
  const user = await getUser(await cookies());

  if (user == null) {
    redirect("/auth/sign-in");
  }

  let requests = null;
  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
    
    requests = await pool.query("SELECT r.email, r.organization_id, o.name AS organization_name FROM requests r JOIN organizations o ON r.organization_id = o.id;");
  }

  const isAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN";
  const isSuperAdmin = user.role === "SUPER_ADMIN"
  return (
      
<>
<PageHeader
        title="Uživatel"
        description="Správa vašeho účtu a nastavení"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-card-foreground">
                  {user.name} {user.surname}
                </h2>
                <Badge
                  variant="secondary"
                  className={`font-normal ${isAdmin ? "bg-primary/10 text-primary" : ""}`}
                >
                  <Shield className="h-3 w-3 mr-1" />
                  {user.role === "SUPER_ADMIN"
                    ? "Super Admin"
                    : user.role === "ADMIN"
                      ? "Administrátor"
                      : "Uživatel"}
                </Badge>
              </div>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {user.email}
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Upravit údaje
            </h3>
            <UserForm user={user} />
          </div>
        </Card>

        {/* Account Actions Card */}
        <Card className="p-6 bg-card border-border">
          <h3 className="font-semibold text-card-foreground mb-6 flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            Účet
          </h3>

          <div className="space-y-6">
            {/* Sign Out */}
            <div>
              <p className="text-sm text-muted-foreground mb-3">Odhlášení</p>
              <SignOutBtn id={user.id} />
            </div>

            {/* Danger Zone */}
            <div className="border-t border-border pt-6">
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-destructive">
                        Nebezpečná zóna
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Smazání účtu je nevratné
                      </p>
                    </div>
                    <DeleteBtn email={user.email} id={user.id} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      {isSuperAdmin && 
        <Card className="p-6 space-y-6 bg-card border-border mt-6 md:max-w-1/2">
          <h3 className="font-semibold text-card-foreground mb-6 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            Založte organizaci
          </h3>
          <NewOrg/>
        </Card>
      }

      {/* Admin Panel - Only visible for admins */}
      {isAdmin && requests && requests.rows.length > 0 && (
        <Card className="p-6 bg-card border-border mt-6">
          <h3 className="font-semibold text-card-foreground mb-6 flex items-center gap-2">
            <Shield className="h-5 w-5 text-warning" />
            Pozvánky
          </h3>

          <div className="space-y-3">
            {requests.rows.map((r: Row, i: number) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-secondary/50 border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-card-foreground">
                    {String(r.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">
                      {String(r.email)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {String(r.organization_name)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AcceptRequest
                    email={String(r.email)}
                    org_id={Number(r.organization_id)}
                  />
                  <RejectRequest email={String(r.email)} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}
