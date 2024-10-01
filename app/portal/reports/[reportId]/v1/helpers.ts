"use server";

import Exa, { ContentsOptions, SearchResult } from "exa-js";

import OpenAI from "openai";

const exa = new Exa(process.env.EXA_API_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// const openai = new OpenAI({ baseURL: "https://api.groq.com/openai/v1", apiKey: process.env.GROQ_API_KEY });

export async function getLLMResponse({
  system = "You are a helpful assistant.",
  user = "",
  temperature = 1,
  model = "gpt-4o",
}): Promise<{
  text: string | null;
  usage: OpenAI.Completions.CompletionUsage | undefined;
}> {
  const completion = await openai.chat.completions.create({
    model,
    temperature,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  return {
    text: completion.choices[0].message.content,
    usage: completion.usage,
  };
}

export async function generateSearchQueries(topic: string, n: number = 4) {
  const userPrompt = `I'm writing a research report on ${topic} and need help coming up with diverse search queries.
Please generate a list of ${n} search queries that would be useful for writing a research report on ${topic}. These queries can be in various formats, from simple keywords to more complex phrases. Do not add any formatting or numbering to the queries.`;

  const completion = await getLLMResponse({
    system:
      "The user will ask you to help generate some search queries. Respond with only the suggested queries in plain text with no extra formatting, each on its own line.",
    user: userPrompt,
    temperature: 1,
    // model: 'llama-3.1-8b-instant'
  });
  return (
    completion.text
      ?.split("\n")
      .filter((s) => s.trim().length > 0)
      .slice(0, n) ?? []
  );
}

export async function generateImageQueries(topic: string, n: number = 4) {
  const userPrompt = `I'm writing a research report on ${topic} and need help coming up with image search queries.
Please generate a list of ${n}  queries that would be useful for finding images on ${topic}. These queries can be in various formats, from simple keywords to more complex phrases. Do not add any formatting or numbering to the queries.`;

  const completion = await getLLMResponse({
    system:
      "The user will ask you to help generate some search queries. Respond with only the suggested queries in plain text with no extra formatting, each on its own line.",
    user: userPrompt,
    temperature: 1,
    // model: 'llama-3.1-8b-instant'
  });
  return (
    completion.text
      ?.split("\n")
      .filter((s) => s.trim().length > 0)
      .slice(0, n) ?? []
  );
}

export async function getSearchResults(
  queries: string[],
  linksPerQuery = 25,
  lookbackMonths: number = 3,
): Promise<SearchResult<ContentsOptions>[]> {
  const date = new Date();
  date.setMonth(date.getMonth() - lookbackMonths);
  const publishedAfter = date.toISOString().split("T")[0];

  let results = [];
  for (const query of queries) {
    const searchResponse = await exa.searchAndContents(query, {
      numResults: linksPerQuery,
      useAutoprompt: true,
      startPublishedDate: publishedAfter,
    });
    results.push(...searchResponse.results);
  }
  return results;
}

async function synthesizeReport(
  topic: string,
  searchContents: SearchResult<ContentsOptions>[],
  contentSlice = 750,
) {
  const inputData = searchContents
    .map(
      (item) =>
        `--START ITEM--\nURL: ${item.url}\nCONTENT: ${item.text.slice(0, contentSlice)}\n--END ITEM--\n`,
    )
    .join("");
  return await getLLMResponse({
    system:
      "You are a helpful research assistant. Write a report according to the user's instructions.",
    user:
      "Input Data:\n" +
      inputData +
      `Write a two paragraph research report about ${topic} based on the provided information. Include as many sources as possible. Provide citations in the text using footnote notation ([#]). First provide the report, followed by a single "References" section that lists all the URLs used, in the format [#] <url>.`,
    //model: 'gpt-4' //want a better report? use gpt-4 (but it costs more)
  });
}

async function researcher(topic: string) {
  console.log(`Starting research on topic: "${topic}"`);

  const searchQueries = await generateSearchQueries(topic, 3);
  console.log("Generated search queries:", searchQueries);

  const searchResults = await getSearchResults(searchQueries);
  console.log(
    `Found ${searchResults.length} search results. Here's the first one:`,
    searchResults[0],
  );

  console.log("Synthesizing report...");
  const report = await synthesizeReport(topic, searchResults);

  return report;
}
