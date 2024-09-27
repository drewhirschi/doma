import { rerm, rok } from "../utils"

import { Database } from "../types/supabase"
import { Json } from "../types/supabase-generated"
import { SupabaseClient } from "@supabase/supabase-js"
import axios from "axios"

export const EMAIL_SCOPES = "Mail.Send offline_access"

export interface MicrosoftTokenResponse {
    token_type: string
    scope: string
    expires_in: number
    ext_expires_in: number
    access_token: string
    refresh_token: string

}

//exchange code for access token
export async function exchangeCodeForToken(sb: SupabaseClient<Database>, code: string) {
    let tokenRes = null
    let tokenError = null
    try {
        tokenRes = await axios.post<MicrosoftTokenResponse>('https://login.microsoftonline.com/common/oauth2/v2.0/token', {


            client_id: process.env.MICROSOFT_CLIENT_ID ?? "",
            scope: EMAIL_SCOPES,
            code,
            redirect_uri: process.env.AUTH_URL + '/api/v1/auth/callback/microsoft',
            client_secret: process.env.MICROSOFT_CLIENT_SECRET ?? "",
            grant_type: 'authorization_code',
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            },
            params: {
            },
        });
    } catch (error) {
        console.log(error)
        tokenError = error
        return rerm("Error exchanging code for token", error, "MICROSOFT_TOKEN_EXCHANGE_ERROR")
    }

    const userId = (await sb.auth.getUser()).data.user?.id
    const update = await sb.from("profile")
        .update({
            send_email_provider: "microsoft",
            send_email_tokens: tokenRes.data! as unknown as Json,
            send_email_token_exp: Math.floor(Date.now() / 1000) + tokenRes.data.expires_in
        })
        .eq("id", userId!)

    return rok(true)
}

// refresh
export async function refreshToken(sb: SupabaseClient<Database>) {

    const userId = (await sb.auth.getUser()).data.user?.id
    const user = await sb.from("profile").select()
        .eq("id", userId!).single()

    if (user.error) {
        return rerm("Failed to refresh token", user.error, "MICROSOFT_TOKEN_REFRESH_ERROR")
    }

    const url = `https://login.microsoftonline.com/common/oauth2/v2.0/token`;

    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
    };

    const data = {
        client_id: process.env.MICROSOFT_CLIENT_ID ?? "",
        scope: EMAIL_SCOPES,
        refresh_token: (user.data.send_email_tokens as unknown as  MicrosoftTokenResponse).refresh_token,
        grant_type: "refresh_token",
        client_secret: process.env.MICROSOFT_CLIENT_SECRET ?? "",
    };

    try {
        
        
        const refreshRes = await axios.post(url, data, { headers });
        const update = await sb.from("profile").update({
            send_email_tokens: refreshRes.data,
            send_email_token_exp: Math.floor(Date.now() / 1000) + refreshRes.data.expires_in
        }).eq("id", userId!)

        return rok(refreshRes.data);

    } catch (error) {
        rerm("Failed to refresh token", error, "MICROSOFT_TOKEN_REFRESH_ERROR")
    }

    
}


export function authUrl(state?: string) {
    const microsoftUrlParams = new URLSearchParams()
    microsoftUrlParams.set('client_id', process.env.MICROSOFT_CLIENT_ID!)
    microsoftUrlParams.set('redirect_uri', process.env.AUTH_URL + '/api/v1/auth/callback/microsoft')
    microsoftUrlParams.set('response_type', 'code')
    microsoftUrlParams.set('response_mode', 'query')
    microsoftUrlParams.set('scope', EMAIL_SCOPES)
    if (state) microsoftUrlParams.set('state', state)



    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${microsoftUrlParams.toString()}`
}
