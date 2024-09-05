import { Queue } from "bullmq";

async function main() {

    
    const myQueue = new Queue('industry', )
    // const completed = await myQueue.getJobs(['completed'], 0, 100, true);
    const active = await myQueue.getActive()


    // console.log(active.)
}

main()