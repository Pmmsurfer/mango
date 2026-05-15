import { redirect } from "next/navigation";
import { Sidebar } from "@/components/app/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: brand } = await supabase
    .from("brands")
    .select("id, name")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (!brand) redirect("/onboarding");

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar brandName={brand.name} userEmail={user.email} />
      <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
