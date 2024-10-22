import { Job, SandboxedJob } from "bullmq";
import { getImgs, getSVGs } from "../../webHelpers";
import { isDefined, isNotNull } from "@shared/types/typeHelpers";

import { Database } from "@shared/types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import axios from "axios";
import { companyIdSchema } from "@shared/queues/industry-queue.types";
import { fullAccessServiceClient } from "@shared/supabase-client/server";
import { CompletionModels, getStructuredCompletion } from "../../llmHelpers";
import { randomUUID } from "crypto";
import svg2img from "svg2img";
import { z } from "zod";
import https from "https";

const axiosInstance = axios.create({
  headers: {
    "User-Agent": "google-bot",
  },
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
});

export async function scrapeCompanyLogos(
  job: SandboxedJob<z.infer<typeof companyIdSchema>>,
) {
  const sb = fullAccessServiceClient();
  const cmpGet = await sb
    .from("company_profile")
    .select()
    .eq("id", job.data.cmpId)
    .single();
  if (cmpGet.error) {
    throw cmpGet.error;
  }

  const imgLogosFound = await scrapeImgLogos(sb, cmpGet.data);
  if (imgLogosFound) {
    if (imgLogosFound.length > 0) {
      return;
    }
  }

  await scrapeSvgLogos(sb, cmpGet.data);
}

export async function scrapeSvgLogos(
  sb: SupabaseClient,
  company: CompanyProfile_SB,
) {
  if (!company.origin) {
    throw new Error("company origin is required");
  }

  const svgs = await getSVGs(company.origin);

  const svgWithTitles = svgs.filter((svg, i) => svg.title);
  const likelySvgLogoCompletion = await getStructuredCompletion({
    system: `You will be provided with a list of titles for SVGs, your job is to respond with the id of any that could be a logo of the company in question.`,
    user: `Company name: ${company.name}\n\nTitles: ${JSON.stringify(svgWithTitles.map((svg, i) => ({ id: i, title: svg.title })))}`,
    schema: z.object({
      possibleLogos: z.array(z.number()),
    }),
  });

  const cmpSvgLogos: { html: string; title: string }[] = [];
  try {
    likelySvgLogoCompletion?.possibleLogos.forEach((i) =>
      cmpSvgLogos.push(svgWithTitles[i]),
    );
  } catch (error) {
    console.error("Bad svg index", error);
  }

  const savedLogosProms = cmpSvgLogos?.map(async (svg) => {
    try {
      const pngBuffer = await svgToPngAsync(svg.html);
      const fileName = logoFilename(company.id, svg.title);
      const dbLogo = await uploadLogo(
        sb,
        fileName,
        company.id,
        pngBuffer,
        svg.title,
        "image/png",
      );
      return dbLogo;
    } catch (error) {
      console.error(
        `Error downloading or processing svg logo from ${company.origin}: ${svg.title}`,
        error,
      );
    }
  });

  const savedLogos = (await Promise.all(savedLogosProms))
    .filter(isNotNull)
    .filter(isDefined);

  if (savedLogos.length > 0) {
    return;
  }

  const svgWithoutTitles = svgs.filter((svg, i) => !svg.title).slice(0, 3);

  const nonTitledProms = svgWithoutTitles.map(async (svg, i) => {
    try {
      const pngBuffer = await svgToPngAsync(svg.html);
      const fileName = logoFilename(company.id, randomUUID().split("-")[0]);
      const dbLogo = await uploadLogo(
        sb,
        fileName,
        company.id,
        pngBuffer,
        `${company.name} logo ${i}`,
        "image/png",
      );

      if (!dbLogo) {
        return null;
      }

      const isLogoCheck = await getStructuredCompletion({
        schema: z.object({ isCompanyLogo: z.boolean(), altText: z.string() }),
        system: `You will be provided with an image and company name, your job is to respond with true if the image is a logo of the company.`,
        user: `Company name: ${company.name}`,
        imageUrl: dbLogo?.url,
        model: CompletionModels.gpt4o,
      });

      if (!isLogoCheck?.isCompanyLogo) {
        await deleteLogo(sb, dbLogo.url, dbLogo.path);
      }
    } catch (error) {
      console.error("Failed to process non-titled svg", error);
    }
  });

  await Promise.all(nonTitledProms);
}

async function scrapeImgLogos(sb: SupabaseClient, company: CompanyProfile_SB) {
  if (!company.origin) {
    throw new Error("company origin is required");
  }
  const logo = await getImgs(company.origin);

  const completion = await getStructuredCompletion({
    system: `You will be provided with a list of images, your job is to respond with the url of any that could be a logo of the company.`,
    user: `Company name: ${company.name}\n\nImages: ${JSON.stringify(logo)}`,
    schema: z.object({
      possibleLogos: z.array(z.object({ src: z.string(), alt: z.string() })),
    }),
  });

  const dbLogosProms =
    completion?.possibleLogos.map(async (logo) => {
      const logoUrl = new URL(logo.src, company.origin!).href;
      try {
        const response = await axiosInstance.get(logoUrl, {
          responseType: "arraybuffer",
        });
        const buffer = Buffer.from(response.data, "binary");
        const fileName = logoFilename(
          company.id,
          logoUrl.split("/").pop() ?? randomUUID().split("-")[0],
        );
        return await uploadLogo(
          sb,
          fileName,
          company.id,
          buffer,
          logo.alt,
          response.headers["content-type"] ?? "image/png",
        );
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(
            `Failed to download logo from ${logoUrl}:`,
            error.response?.status,
            error.response?.statusText,
          );
        } else {
          console.error(
            `Error downloading or processing logo from ${logoUrl}:`,
            error,
          );
        }
        return null;
      }
    }) ?? [];

  const dbLogos = (await Promise.all(dbLogosProms))
    .filter(isNotNull)
    .filter(isDefined);
  return dbLogos;
}

async function uploadLogo(
  sb: SupabaseClient<Database>,
  fileName: string,
  cmpId: number,
  buffer: Buffer,
  alt: string,
  type: string,
) {
  const { data, error } = await sb.storage
    .from("cmp_assets")
    .upload(fileName, buffer, {
      contentType: type,
      upsert: true,
    });

  if (error) {
    console.error(`Failed to upload logo for company ${cmpId}:`, error);
    return null;
  } else {
    const {
      data: { publicUrl },
    } = sb.storage.from("cmp_assets").getPublicUrl(fileName);

    const { error: updateError, data: uploadedLogo } = await sb
      .from("cmp_logos")
      .upsert({ url: publicUrl, path: data.path, cmp_id: cmpId, alt })
      .select()
      .single();

    if (updateError) {
      console.error(
        `Failed to update company profile with new logo:`,
        updateError,
      );
    }

    return uploadedLogo;
  }
}

async function deleteLogo(
  sb: SupabaseClient<Database>,
  url: string,
  filename: string,
) {
  //remove stored file
  const deleteNonLogo = await sb.storage.from("cmp_assets").remove([filename]);
  if (deleteNonLogo.error) {
    console.error("Failed to delete non-logo", deleteNonLogo.error);
    throw deleteNonLogo.error;
  }
  const deleteLogoRow = await sb.from("cmp_logos").delete().eq("url", url);

  if (deleteLogoRow.error) {
    console.error("Failed to delete logo", deleteLogoRow.error);
    throw deleteLogoRow.error;
  }
  return;
}

function logoFilename(cmpId: number, name: string) {
  return (
    `logo/${cmpId}/${name.replaceAll(" ", "_")}`
      .replaceAll(".png", "")
      .replaceAll("~", "_") + ".png"
  );
}

async function svgToPngAsync(svgXml: string) {
  return new Promise<Buffer>((resolve, reject) =>
    svg2img(svgXml, (error, buffer) => {
      if (error) {
        reject(error);
      } else {
        resolve(buffer);
      }
    }),
  );
}
