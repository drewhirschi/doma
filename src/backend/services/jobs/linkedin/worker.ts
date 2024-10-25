import { SandboxedJob } from "bullmq";
import getLinkedInProfile from "./handlers/getLiProfile"

export default async function (job: SandboxedJob) {


    switch (job.name) {

        case "get_li_profile":
            return await getLinkedInProfile(job);

        default:
            throw new Error("unknown_job_name");
    }
}
