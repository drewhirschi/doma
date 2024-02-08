import pLimit from "p-limit";

export async function unzipTenantFile() {

    const rateLimitter = pLimit(10);

    for (let i = 0; i < 100; i++) {
        // rateLimitter(() => worker(i))
        worker(rateLimitter, i)
    }

}

async function worker(limit:any, i:number) {

    console.log("starting worker", i)
    await limit(() => {
        return new Promise<void>((resolve, reject) => {
            const delay = Math.floor(Math.random() * 2000) + 1000; // Random delay between 1 and 3 seconds
            setTimeout(() => {
                console.log(i)
                resolve()
            }, delay);
        });
    });
}

unzipTenantFile()


