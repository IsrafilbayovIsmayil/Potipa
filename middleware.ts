import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/") {
    const al = (req.headers.get("accept-language") || "").toLowerCase();
    const loc = al.startsWith("ca") || al.includes(",ca") ? "ca" : "es";
    return NextResponse.redirect(new URL(`/${loc}`, req.url));
  }
}
export const config = { matcher: ["/"] };
