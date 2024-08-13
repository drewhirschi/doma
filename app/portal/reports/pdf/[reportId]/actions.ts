"use server"

import * as microsoftOauth from "@/oauth/microsoft"

import axios, { AxiosError } from "axios"

import { serverActionClient } from "@/supabase/ServerClients"

export async function sendEmail(recipients: string, emailContent: string) {
    console.log("sending email")
    const sb = serverActionClient()
    const userId = (await sb.auth.getUser()).data.user?.id
    const { data: user, error: userError } = await sb.from("profile").select().eq("id", userId!).single()

    if (userError) throw userError


    const emailAddresses = recipients.split(",").map(r => r.trim())

    if (user.send_email_provider == "microsoft") {
        sendMicrosoftEmail(emailAddresses, user)
    }
}


async function sendMicrosoftEmail(recipients: string[], user: Profile_SB) {
    const url = `https://graph.microsoft.com/v1.0/me/sendMail`;
    const emailData = recipients.map(r => (
        {
            message: {
                subject: "Hello from Graph API",
                body: {
                    contentType: "HTML",
                    content: `This is a test email sent using Microsoft Graph API. <a href="http://localhost:3000/reports/1?parsluid=${encodeURIComponent(r)}">Link</a>`,
                },
                toRecipients: [
                    {
                        emailAddress: {
                            address: r,
                        },
                    },
                ],
            },
            saveToSentItems: "true",
        }))

    const headers = {
        Authorization: `Bearer ${user.send_email_tokens.access_token}`,
        "Content-Type": "application/json",
    };

    // if (Date.now() / 1000 > (user.send_email_token_exp ?? 0)) {
        await microsoftOauth.refreshToken(serverActionClient());
    // }

    try {

        const sendRes = await axios.post(url, emailData[0], { headers });

    } catch (error) {
        // @ts-ignore
        if (error?.name == "AxiosError") {
            const axiosErr = error as AxiosError
            console.log(axiosErr.response?.data)
        } else {
            console.log(error)

        }
    }
}

