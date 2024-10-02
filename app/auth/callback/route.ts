import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { routeClient } from "@/shared/supabase-client/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  console.log({ sp: searchParams.toString(), origin })
  const code = searchParams.get('code')
  // const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = routeClient()
    const { error, data: session } = await supabase.auth.exchangeCodeForSession(code)

    let next = "/tenant-create"
    if (session.user?.app_metadata?.tenant_id) {
      next = "/portal/projects"
    }
    console.log({ next })

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      console.log({ forwardedHost })
      const isLocalEnv = process.env.NODE_ENV === 'development'
      console.log({ isLocalEnv })
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?${encodeURIComponent("errorMessage=no code was provided")}`)
}
// 