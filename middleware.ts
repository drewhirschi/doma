import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/ux/supabase-client/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/portal")) {
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(request.nextUrl.pathname)}`, request.url)
    );
  }

  if (
    request.nextUrl.pathname.startsWith("/portal") &&
    !user?.app_metadata?.tenant_id
  ) {
    return NextResponse.redirect(`${process.env.AUTH_URL}/tenant-create`);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
