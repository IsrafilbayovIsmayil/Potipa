import { isAdmin } from "@/lib/auth";
import AdminLogin from "@/components/AdminLogin";
import AdminScreen from "@/components/AdminScreen";

export const dynamic = "force-dynamic";
export default async function AdminPage() {
  return (await isAdmin()) ? <AdminScreen /> : <AdminLogin />;
}
