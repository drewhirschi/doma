import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { routeClient } from '../../../src/supabase/ServerClients'

export async function GET(request: NextRequest) {
  console.log(request.url)
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = routeClient()
    const authRes = await supabase.auth.exchangeCodeForSession(code)
    // URL to redirect to after sign in process completes
    const redirectUrl = requestUrl.origin + "/portal/projects"
    return NextResponse.redirect(redirectUrl)
  }

  // URL to redirect to after sign in process completes
  const redirectUrl = requestUrl.origin + `/login?${encodeURIComponent("errorMessage=no code was provided")}`
  return NextResponse.redirect(redirectUrl)
}