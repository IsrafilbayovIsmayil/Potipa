import { NextRequest, NextResponse } from "next/server";
import { getRole } from "@/lib/auth";
import { listEnquiries, setEnquiryHandled } from "@/lib/enquiries";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getRole())) return NextResponse.json({ error: "auth" }, { status: 401 });
  return NextResponse.json({ enquiries: await listEnquiries() }, { headers: { "cache-control": "no-store" } });
}
export async function PATCH(req: NextRequest) {
  if (!(await getRole())) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { id, handled } = await req.json().catch(() => ({}));
  if (typeof id !== "string" || typeof handled !== "boolean") return NextResponse.json({ error: "bad_request" }, { status: 400 });
  return (await setEnquiryHandled(id, handled)) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not_found" }, { status: 404 });
}
