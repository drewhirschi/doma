import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { routeClient } from "@/supabase/ServerClients"

export async function GET(request: NextRequest) {
  console.log(request.url)
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    const redirectUrl = requestUrl.origin + `/login?${encodeURIComponent("errorMessage=no code was provided")}`
    return NextResponse.redirect(redirectUrl)
  }

  const supabase = routeClient()
  const authRes = await supabase.auth.exchangeCodeForSession(code)


  if (authRes.error) {
    console.log(authRes.error)
    return NextResponse.redirect("/login?errorMessage=" + authRes.error.message)
  }

  if (authRes.data.user.app_metadata.tenant_id) {
    const redirectUrl = requestUrl.origin + "/portal/settings"
    return NextResponse.redirect(redirectUrl)
  } else {
    const redirectUrl = requestUrl.origin + "/tenant-create"
    return NextResponse.redirect(redirectUrl)
  }


}