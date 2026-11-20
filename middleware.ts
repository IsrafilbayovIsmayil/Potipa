import { NextRequest, NextResponse } from "next/server";

const SUPPORTED: Record<string, string> = { es: "es", ca: "ca", en: "en", ru: "ru", uk: "ru" }; // Ukrainian speakers get Russian (closest we offer)

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/") {
    const langs = (req.headers.get("accept-language") || "").split(",").map((x) => x.trim().split(";")[0].toLowerCase().slice(0, 2));
    const loc = langs.map((l) => SUPPORTED[l]).find(Boolean) ?? "es";
    return NextResponse.redirect(new URL(`/${loc}`, req.url));
  }
}
export const config = { matcher: ["/"] };
