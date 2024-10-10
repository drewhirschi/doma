import { SandboxedJob } from "bullmq";

export default async function (job: SandboxedJob) {


    switch (job.name) {

        case "get_li_profile":
            // return await scrapeCompanyLogos(job);
            throw new Error("not implemented");
        default:
            throw new Error("unknown_job_name");
    }
}
