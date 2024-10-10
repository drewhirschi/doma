import axios from "axios";
import https from 'https';

const agent = new https.Agent({
    rejectUnauthorized: false
});
async function main() {

    try {

        const res = await axios.get("https://rosenwellpetro.com", {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.142.86 Safari/537.36'
            },
            // httpsAgent: agent
        })

        console.log('res', res.data)
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log("axioserror", error.cause, error.message, error.status)
        } else {

            console.log(error)
        }
    }
}

main()