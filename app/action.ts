'use server'

import { CookieOptions, createServerClient } from '@supabase/ssr';

import { cookies } from 'next/headers'
import { redirect } from "next/navigation"

// export async function fetchLink(link: string): Promise<{ error?: any }> {
//     const response = await fetch(link);
//     const html = await response.text();

//     const $ = cheerio.load(html);


//     $('script').remove();
//     $('meta').remove();
//     $('svg').remove();
//     $('style').remove();
//     $('link').remove();
//     $('noscript').remove();
//     $('iframe').remove();
//     $('img').remove();
//     $('form').remove();
//     $('button').remove();


//     // console.log($.text())


//     const { data, error } = await sbsc.from("contract").insert({
//         raw_text: $.text(),
//     }).select().single()

//     if (error) {
//         return { error }
//     }

//     const pdfBuf = await convertLinkToPDF(link)

//     const webpdfFilename = 'webpdfs/github_terms_of_service.pdf';
//     const { data: upload, error: uploadE } = await sbsc.storage.from('atlasaitools').upload(webpdfFilename, pdfBuf);

//     if (uploadE) {
//         console.error('Failed to upload PDF:', error);
//         return { error: uploadE }
//     }


//     const update = await sbsc.from("contract").update({
//         webpdf: webpdfFilename,
//     }).eq('id', data?.id)

//     if (update.error) {
//         return { error: update.error }
//     }


//     return redirect('/contract/' + data?.id)

// }


// async function convertLinkToPDF(url: string) {
//     // Launch a headless browser
//     const browser = await chromium.launch();
//     const context = await browser.newContext();

//     const page = await context.newPage();
//     await page.goto(url, { waitUntil: 'networkidle' });
//     const pdfBuffer = await page.pdf({  format: 'A4' });
//     await browser.close();

//     return pdfBuffer

// }

// async function convertLinkToPDF(url: string): Promise<Buffer> {
//     const browser = await puppeteer.launch();
//     const versionInfo = await browser.version();
//     console.log('Chromium version:', versionInfo);
//     const page = await browser.newPage();

//     await page.goto(url, { waitUntil: 'networkidle2' });
//     const pdfBuffer: Buffer = await page.pdf({ path: format: 'A4' });

//     await browser.close();
//     return pdfBuffer;
// }