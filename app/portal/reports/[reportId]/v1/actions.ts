"use server"

import { ContentsOptions, SearchResult } from "exa-js";
import { generateSearchQueries, getLLMResponse, getSearchResults } from "./helpers"

import { ISection } from "./types"
import fs from 'fs'

export async function exaSearch(query:string) {


    const QUERIES_PER_SECTION = 3
    const SEARCH_RESULTS_PER_QUERY = 24

    // const queries = await generateSearchQueries(`${topic}: ${section.name}`, QUERIES_PER_SECTION)
    const searchResults = await getSearchResults([query], SEARCH_RESULTS_PER_QUERY)

    return searchResults

}

export async function searchAllSections(topic: string, sectionsData: ISection[]): Promise<ISection[]> {

    // return JSON.parse(fs.readFileSync('sections_health_with_searchdata.json', 'utf-8')) as ISection[]


    const QUERIES_PER_SECTION = 3
    const SEARCH_RESULTS_PER_QUERY = 4

    const queryProms = sectionsData.map(async (section: ISection) => {
        const sectionQueries = await generateSearchQueries(`${topic}: ${section.name}`, QUERIES_PER_SECTION)
        section.queries = sectionQueries
        return section
    })
    sectionsData = await Promise.all(queryProms)


    const searchProms = sectionsData.map(async (section: ISection) => {
        const searchResults = await getSearchResults(section.queries ?? [], SEARCH_RESULTS_PER_QUERY)
        section.searchResults = searchResults
        return section
    })
    sectionsData = await Promise.all(searchProms)


    // const searchResultsMap = arrayToMap(searchResults, result => result.url)
    // const uniqueSearchResults = mapToArray(searchResultsMap)


    fs.writeFileSync('sections_health_with_searchdata.json', JSON.stringify(sectionsData))



    return sectionsData
}

export async function writeDraft(topic: string, sections: ISection[]) {

    // await sleep(5_000)

    return JSON.parse(fs.readFileSync('sections_health_full.json', 'utf-8')) as ISection[]


    // const USAGE: OpenAI.Completions.CompletionUsage = {
    //     prompt_tokens: 0,
    //     completion_tokens: 0,
    //     total_tokens: 0
    // }

    // function addUsage(usage: OpenAI.Completions.CompletionUsage | undefined) {
    //     if (usage) {
    //         USAGE.prompt_tokens += usage.prompt_tokens
    //         USAGE.completion_tokens += usage.completion_tokens
    //         USAGE.total_tokens += usage.total_tokens
    //     }
    // }

    // // generate summaries
    // sections = await Promise.all(sections.map(async (section) => {
    //     section.summaries = await Promise.all(

    //         section.searchResults?.map(async (searchResult) => {

    //             const resp = await getLLMResponse({
    //                 user: `Summarize what the following acticle says about "${section.name}" in ${topic}` + `<arcticle>\n${searchResult.text}\n</arcticle>`

    //             })
    //             addUsage(resp.usage)
    //             return { url: searchResult.url, text: resp.text }
    //         }) ?? []
    //     )

    //     console.log(`Finished summarizing for ${section.name}`)
    //     return section
    // }))


    // // write the sections
    // sections = await Promise.all(sections.map(async (section) => {
    //     const sectionContent = await writeSection(section, topic)
    //     addUsage(sectionContent.usage)
    //     section.md = sectionContent.text
    //     return section
    // }))


    // fs.writeFileSync('sections_health_full.json', JSON.stringify(sections))

    // console.log(USAGE)


    // return sections

}


// export async function draftSection(section: ISection, topic: string) {

//     // generate summaries
//     // section.summaries = await Promise.all(
//     //     section.searchResults?.map(async (searchResult) => {
//     //         const resp = await getLLMResponse({
//     //             user: `Summarize what the following acticle says about "${section.name}" in ${topic}` + `<arcticle>\n${searchResult.text}\n</arcticle>`
//     //         })
//     //         return { url: searchResult.url, text: resp.text }
//     //     }) ?? []
//     // )


//     // write the sections
//     const sectionContent = await writeSection(section, topic)
//     section.md = sectionContent.text



//     return section
// }

export async function writeSection(section: ReportSection_SB & { search_result: SearchResult_SB[] }, topic: string) {
    const prompt = `Write ${section.instruction} and nothing more about ${section.title} in ${topic}. Use markdown formatting but don't include a title.`
    const referenceMaterialPrompt = `\n\n Reference Material:\n\n${section.search_result?.map(sr => sr.summary).join("\n\n")}`
    const completion = await getLLMResponse({ user: prompt + referenceMaterialPrompt })
    return completion
}


export async function saveSections(sections: ISection[]) {
    fs.writeFileSync('sections_health_full.json', JSON.stringify(sections))
}





const aerospaceSections = [{
    name: 'Market Overview',
    intr: '1 short paragraph for a quick overview for the rest of the document',
},
{
    name: "QUARTERLY A&D M&A ACTIVITY",
    intr: '2-3 short paragraphs',
},
{
    name: 'Valuation',
    intr: 'A couple of sentances',
},
{
    name: 'PUBLIC SECTOR VALUATIONS (EV/LTM EBITDA)',
    intr: 'a table or graph',
},
{
    name: 'Factors driving value',
    intr: 'a sentence and 3-6 bullets',
},
{
    name: 'Notable transactions',
    intr: 'sentance and 3-6 bullets',
},
{
    name: 'Aerospace Industry Trends and Drivers',
    intr: '2 paragraphs',
},
{
    name: '2024 DOD BUDGET BY DIVISION',
    intr: 'a short paragraph per division',
},]

