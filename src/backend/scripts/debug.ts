import { getEmbedding } from "../services/jobs/llmHelpers";

async function main() {


    const emb1 = await getEmbedding("hello world")
    const emb2 = await getEmbedding("world, hello")

    const sim = cosinesim(emb1, emb2)

    console.log(sim)
}

main()

function cosinesim(emb1: number[], emb2: number[]) {

    const dot = emb1.reduce((a, b, i) => a + b * emb2[i], 0);
    const norm1 = Math.sqrt(emb1.reduce((a, b) => a + b * b, 0));
    const norm2 = Math.sqrt(emb2.reduce((a, b) => a + b * b, 0));
    return dot / (norm1 * norm2);
}
