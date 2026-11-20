import { getRole } from "@/lib/auth";
import AdminLogin from "@/components/AdminLogin";
import AdminScreen from "@/components/AdminScreen";

export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const who = await getRole();
  return who ? <AdminScreen role={who.role} label={who.label} /> : <AdminLogin />;
}
