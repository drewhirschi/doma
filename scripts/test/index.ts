import { Queue, Worker } from "bullmq";

import { IndustryQueueClient } from "@/backend/services/jobs/industry-queue";
import Redis from "ioredis";
import axios from "axios";
import { fullAccessServiceClient } from "@/shared/supabase-client/ServerClients";
import { getLogo } from "@/backend/services/jobs/webHelpers";
import { getStructuredCompletion } from "@/backend/services/jobs/llmHelpers";
import { z } from "zod";

require("dotenv").config({ path: "./.env.local" });

async function main() {

  const sb = fullAccessServiceClient()
  const companiesGet = await sb.from("company_profile").select()
    .eq("id", 4)
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
  if (!company.origin) {
    throw new Error("company origin is required")
  }


  const logo = await getLogo(company.origin)
  console.log(logo)

  const completion = await getStructuredCompletion({
    system: `You will be provided with a list of images, your job is to respond with the url of any that could be a logo of the company.`,
    user: `Company name: ${company.name}\n\nImages: ${JSON.stringify(logo)}`,
    schema: z.object({
      possibleLogos: z.array(z.object({src: z.string(), alt: z.string()}))
    })
  })

  console.log(completion)

  completion?.possibleLogos.map(async logo => {
    const logoUrl = new URL(logo.src, company.origin!).href
    console.log(`Downloading logo from: ${logoUrl}`);
    try {
      const response = await axios.get(logoUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');
      
      const fileName = `logo/${company.id}_${logoUrl.split("/").pop()}`;
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


