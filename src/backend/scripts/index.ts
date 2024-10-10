require("dotenv").config({ path: "./.env.local" });




async function main() {
  const sb = fullAccessServiceClient();
  const companiesGet = await sb.from("company_profile").select("*, cmp_li_profile(*)")
    .gte("id", 1863)
    .limit(100)
    .not("web_summary", "is", null)


  if (companiesGet.error) {
    console.log("failed to get companies", companiesGet.error);
    throw companiesGet.error;
  }

  // const company = companiesGet.data;


  const linkedin = new RapidApiLinkdeInScraper()


  for (const company of companiesGet.data) {

    if (company.cmp_li_profile.length > 0) {
      continue
    }
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
        continue
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

  }
  return;
}

main();
