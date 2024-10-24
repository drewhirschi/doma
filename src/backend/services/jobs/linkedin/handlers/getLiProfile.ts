import { RapidApiLinkdeInScraper, llmChooseProfile, searchForLinkedInCompanySlug } from "@shared/LinkedIn";

import { SandboxedJob } from "bullmq";
import { fullAccessServiceClient } from "@shared/supabase-client/server";
import { isNotNull } from "@shared/types/typeHelpers";





export default async function handler(job: SandboxedJob) {
    return await getProfile(job.data.cmpId);

}

export async function getProfile(cmpId: number) {


    const sb = fullAccessServiceClient();
    const companieGet = await sb.from("company_profile").select("*, cmp_li_profile(*)")
        .eq("id", cmpId).single();



    if (companieGet.error) {
        console.log("failed to get company", companieGet.error);
        throw companieGet.error;
    }
    const company = companieGet.data;


    if (company.cmp_li_profile.length > 0) {
        return "already indexed"
    }

    const linkedin = new RapidApiLinkdeInScraper()



    try {

        const candidatesSearchResults = await searchForLinkedInCompanySlug(company.name!);

        const candidateProfileProms = candidatesSearchResults.map(async (candidate) => {

            const linkedinProfile = await linkedin.getCompany(candidate);


            return linkedinProfile

        })

        const candidateProfiles = (await Promise.all(candidateProfileProms)).filter(isNotNull)


        let profile
        if (candidateProfiles.length > 1) {
            profile = await llmChooseProfile(candidateProfiles, company.web_summary!)
        } else if (candidateProfiles.length === 1) {
            profile = candidateProfiles[0]
        }

        if (!profile) {
            console.warn(`no profile found for ${company.name} [${company.id}]`);
            return "no profile found"
        }




        const insertData = linkedin.sbFormat(profile);


        const insertProfile = await sb.from("cmp_li_profile").insert(insertData);
        if (insertProfile.error) {
            console.log("failed to insert profile", insertProfile.error);
            throw insertProfile.error;
        }

        console.log("finished: ", company.name);
    } catch (error) {
        console.error("Failed: ", company.id, error);
    }


    return;
}

