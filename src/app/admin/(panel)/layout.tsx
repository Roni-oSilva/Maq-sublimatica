import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/sidebar";
import { requireAdmin } from "@/lib/admin";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: { default: "Administração", template: "%s | Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  const settings = await getSettings();
  return (
    <div className="min-h-screen bg-paper lg:flex">
      <AdminSidebar email={user.email ?? ""} storeName={settings.store_name} />
      <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
    </div>
  );
}
