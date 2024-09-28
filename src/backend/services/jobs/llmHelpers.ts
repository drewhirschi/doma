import { ChatCompletionContentPart } from 'openai/resources/chat/completions';
import OpenAI from "openai";
import path from 'path';
import { z, } from "zod";
import { zodResponseFormat } from 'openai/helpers/zod';

const openai = new OpenAI();

interface CompletionOptions {
    system: string,
    user: string,
    model?: string,
    imageUrl?: string
}

export async function getCompletion({ model = "gpt-4o-mini-2024-07-18", system, user }: CompletionOptions): Promise<string | null> {

    const completion = await openai.chat.completions.create({
        model,
        messages: [
            { role: "system", content: system },
            { role: "user", content: user },
        ],
        response_format: { type: "text" },
    });

    return completion.choices[0].message.content
}

interface StructuredCompletionOptions<Z extends z.ZodTypeAny> extends CompletionOptions {
    schema: Z
}
export async function getStructuredCompletion<Z extends z.ZodTypeAny = z.ZodNever>({ model = "gpt-4o-mini-2024-07-18", system, user, schema, imageUrl }: StructuredCompletionOptions<Z>): Promise<z.infer<Z> | null> {

    const TIMEOUT_SECONDS = 20;
    const timeout = setTimeout(() => {
        console.warn("getStructuredCompletion has not finished in " + TIMEOUT_SECONDS + " seconds");
    }, TIMEOUT_SECONDS * 1000);
    try {
        const userMessageContent: Array<ChatCompletionContentPart> = [
            { type: 'text', text: user },
        ]
        if (imageUrl) {
            userMessageContent.push({ type: 'image_url', image_url: { url: imageUrl } })
        }
        const response = await openai.beta.chat.completions.parse({
            model,
            messages: [
                { role: "system", content: system },
                { role: "user", content: userMessageContent }
            ],
            response_format: zodResponseFormat(schema, "company_profile"),
        });
        const responseParsed = response.choices[0].message.parsed
        if (!responseParsed) {
            return null
        }

        return responseParsed as z.infer<Z>;
    } finally {
        clearTimeout(timeout);
    }



}






export async function getEmbedding(text: string): Promise<number[]> {
    const embedding = await openai.embeddings.create({
        model: "text-embedding-3-large",
        // model: "text-embedding-3-small",
        input: text,
    });
    return embedding.data[0].embedding;
}

export function cosinesim(a: number[], b: number[]): number {
    const dotProduct = a.reduce((acc, val, idx) => acc + val * b[idx], 0);
    const magnitudeA = Math.sqrt(a.reduce((acc, val) => acc + val ** 2, 0));
    const magnitudeB = Math.sqrt(b.reduce((acc, val) => acc + val ** 2, 0));

    return dotProduct / (magnitudeA * magnitudeB);

}


function splitArrayIntoGroups(arr: any[], numGroups = 4) {
    const result = [];
    const groupSize = Math.ceil(arr.length / numGroups);

    for (let i = 0; i < arr.length; i += groupSize) {
        result.push(arr.slice(i, i + groupSize));
    }

    return result;
}
export async function recursiveDocumentReduction({ documents, instruction }: { documents: string[], instruction: string }): Promise<string> {

    async function mergeDocs(docs: string[]) {
        const doc = await getCompletion({
            system: `You will receive a list of documents. Merge their information into one document. \nAdditional information:\n ${instruction}`,
            "user": docs.map((doc, idx) => `<doc${idx + 1}>\n${doc}\n</doc${idx + 1}>`).join("\n"),
        })
        if (!doc) {
            console.warn("Could not get completion")
            return docs[1]
        }
        return doc
    }

    if (documents.length === 1) {
        return documents[0]
    } else if (documents.length <= 4) {
        return await mergeDocs(documents)

    } else {
        const documentGroups = splitArrayIntoGroups(documents, 4);
        const reductions = await Promise.all(documentGroups.map(docGroup => recursiveDocumentReduction({ documents: docGroup, instruction })))
        return await mergeDocs(reductions)

    }

}