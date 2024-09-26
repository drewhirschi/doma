import { Queue, Worker } from "bullmq";
import { getImgs, getSVGs } from "@/backend/services/jobs/webHelpers";

import { IndustryQueueClient } from "@/backend/services/jobs/industry-queue";
import Redis from "ioredis";
import { SupabaseClient } from "@supabase/supabase-js";
import axios from "axios";
import { fullAccessServiceClient } from "@/shared/supabase-client/ServerClients";
import { getStructuredCompletion } from "@/backend/services/jobs/llmHelpers";
import { is } from "cheerio/dist/commonjs/api/traversing";
import { randomUUID } from "crypto";
import svg2img from "svg2img"
import { z } from "zod";

require("dotenv").config({ path: "./.env.local" });

async function main() {

  const sb = fullAccessServiceClient()
  const companiesGet = await sb.from("company_profile").select()
    .eq("id", 72)
  // .order("id", { ascending: true }).gt("id", 4).limit(1)

  if (companiesGet.error) {
    console.log("failed to get companies", companiesGet.error)
    throw companiesGet.error
  }

  const companies = companiesGet.data

  // const industryQueue = new IndustryQueueClient()

  // for (const company of companies) {
  //   if (!company.origin) {
  //     continue
  //   }
  //   await industryQueue.scrapeLogo(company.origin)
  // }

  // industryQueue.close()

  const company = companies[0]
  


 
  await scrapeSvgLogos(sb, company)
  // await scrapeImgLogos(sb, company)
  return





}


async function scrapeSvgLogos(sb: SupabaseClient, company: CompanyProfile_SB) {
  if (!company.origin) {
    throw new Error("company origin is required")
  }

  const svgs = await getSVGs(company.origin)
  // const svgWithTitles = svgs.filter((svg, i) => svg.title)
  


  // const svgLogoCompletion = await getStructuredCompletion({
  //   system: `You will be provided with a list of titles for SVGs, your job is to respond with the id of any that could be a logo of the company in question.`,
  //   user: `Company name: ${company.name}\n\nTitles: ${JSON.stringify(svgWithTitles.map((svg, i) => ({ id: i, title: svg.title })))}`,
  //   schema: z.object({
  //     possibleLogos: z.array(z.number())
  //   })
  // })

  // const cmpSvgLogos: { html: string, title: string }[] = []
  // try {
  //   svgLogoCompletion?.possibleLogos.forEach((i) => cmpSvgLogos.push(svgWithTitles[i]))
  // } catch (error) {
  //   console.error("Bad svg index", error)
  // }

  // console.log(cmpSvgLogos.map(svg => svg.title))

  // cmpSvgLogos?.map(async svg => {
  //   try {
  //     const svgToPngPromise = new Promise<Buffer>((resolve, reject) =>
  //       svg2img(svg.html, (error, buffer) => {
  //         if (error) {
  //           reject(error);
  //         } else {
  //           resolve(buffer);
  //         }
  //       })
  //     );
  //     const pngBuffer = await svgToPngPromise;
      

  //     const fileName = `logo/${company.id}/${svg.title}`;
  //     const { data, error } = await sb.storage
  //       .from('cmp_assets')
  //       .upload(fileName, pngBuffer, {
  //         contentType: 'image/png',
  //         upsert: true
  //       });


  //     if (error) {
  //       console.error(`Failed to upload logo for company ${company.id}:`, error);
  //     } else {
  //       console.log(`Successfully uploaded logo for company ${company.id}`);

  //       // Get the public URL of the uploaded logo
  //       const { data: { publicUrl } } = sb.storage
  //         .from('cmp_assets')
  //         .getPublicUrl(fileName);

  //       // Update the company profile with the new logo URL
  //       const { error: updateError } = await sb
  //         .from('cmp_logos')
  //         .upsert({ url: publicUrl, path: data.path, cmp_id: company.id, alt: svg.title })

  //       if (updateError) {
  //         console.error(`Failed to update company profile with new logo:`, updateError);
  //       } else {
  //         console.log(`Updated company profile with new logo URL: ${publicUrl}`);
  //       }
  //     }
  //   } catch (error) {
  //     console.error(`Error downloading or processing svg logo from ${company.origin}: ${svg.title}`, error);
  //   }
  // })

  const svgWithoutTitles = svgs.filter((svg, i) => !svg.title).slice(0, 10)
  console.log("svg without titles", svgWithoutTitles.length)

  const nonTitledProms = svgWithoutTitles.map(async (svg, i) => {
    try {
      const svgToPngPromise = new Promise<Buffer>((resolve, reject) =>
        svg2img(svg.html, (error, buffer) => {
          if (error) {
            reject(error);
          } else {
            resolve(buffer);
          }
        })
      );
      const pngBuffer = await svgToPngPromise;

      const fileName = `logo/${company.id}/${randomUUID()}.png`;
      const { data, error } = await sb.storage
        .from('cmp_assets')
        .upload(fileName, pngBuffer, {
          contentType: 'image/png',
          upsert: true
        })

      if (error) {
        console.error(`Failed to upload logo for company ${company.id}:`, error);
        return null
      } 

      const { data: { publicUrl } } = sb.storage
        .from('cmp_assets')
        .getPublicUrl(fileName)


      const isLogoCheck = await getStructuredCompletion({
        schema: z.object({isCompanyLogo: z.boolean(), altText: z.string()}),
        system: `You will be provided with an image and company name, your job is to respond with true if the image is a logo of the company.`,
        user: `Company name: ${company.name}`,
        imageUrl: publicUrl
      })

      if (!isLogoCheck?.isCompanyLogo) {
        //remove stored file
        await sb.storage
          .from('cmp_assets')
          .remove([fileName])
      } 


      const { error: updateError } = await sb
        .from('cmp_logos')
        .upsert({ url: publicUrl, path: data.path, cmp_id: company.id, alt: isLogoCheck?.altText || `${company.name} logo ${i}` })
        

    } catch (error) {
      console.error("Failed to process non-titled svg", error)
    }
  })

  await Promise.all(nonTitledProms)
  
}

async function scrapeImgLogos(sb: SupabaseClient, company: CompanyProfile_SB) {
  if (!company.origin) {
    throw new Error("company origin is required")
  }
  const logo = await getImgs(company.origin)

  const completion = await getStructuredCompletion({
    system: `You will be provided with a list of images, your job is to respond with the url of any that could be a logo of the company.`,
    user: `Company name: ${company.name}\n\nImages: ${JSON.stringify(logo)}`,
    schema: z.object({
      possibleLogos: z.array(z.object({ src: z.string(), alt: z.string() }))
    })
  })

  console.log(completion)
  // return 

  completion?.possibleLogos.map(async logo => {
    const logoUrl = new URL(logo.src, company.origin!).href
    console.log(`Downloading logo from: ${logoUrl}`);
    try {
      const response = await axios.get(logoUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');

      const fileName = `logo/${company.id}/${logoUrl.split("/").pop()}`;
      const { data, error } = await sb.storage
        .from('cmp_assets')
        .upload(fileName, buffer, {
          contentType: response.headers['content-type'],
          upsert: true
        });


      if (error) {
        console.error(`Failed to upload logo for company ${company.id}:`, error);
      } else {
        console.log(`Successfully uploaded logo for company ${company.id}`);

        // Get the public URL of the uploaded logo
        const { data: { publicUrl } } = sb.storage
          .from('cmp_assets')
          .getPublicUrl(fileName);

        // Update the company profile with the new logo URL
        const { error: updateError } = await sb
          .from('cmp_logos')
          .upsert({ url: publicUrl, path: data.path, cmp_id: company.id, alt: logo.alt })

        if (updateError) {
          console.error(`Failed to update company profile with new logo:`, updateError);
        } else {
          console.log(`Updated company profile with new logo URL: ${publicUrl}`);
        }
      }
    } catch (error) {
      console.error(`Error downloading or processing logo from ${logoUrl}:`, error);
    }
  })
}

main();


