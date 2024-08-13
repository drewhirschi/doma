import { ContentsOptions, SearchResult } from 'exa-js';

import OpenAI from 'openai';
import fs from 'fs';
import { getLLMResponse } from '../helpers';

const TOPIC = "Aerospace industry"
const USAGE: OpenAI.Completions.CompletionUsage = {
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0
}

function addUsage(usage: OpenAI.Completions.CompletionUsage | undefined) {
    if (usage) {
        USAGE.prompt_tokens += usage.prompt_tokens
        USAGE.completion_tokens += usage.completion_tokens
        USAGE.total_tokens += usage.total_tokens
    }
}

interface ISection {
    name: string
    intr: string
    summaries: { url: string, text: string | null }[]
    md?: string | null
}
let sections: ISection[] = [
    {
        name: 'Market Overview',
        intr: '1 short paragraph for a quick overview for the rest of the document',
        summaries: []
    },
    {
        name: "QUARTERLY A&D M&A ACTIVITY",
        intr: '2-3 short paragraphs',
        summaries: []
    },
    {
        name: 'Valuation',
        intr: 'A couple of sentances',
        summaries: []
    },
    {
        name: 'PUBLIC SECTOR VALUATIONS (EV/LTM EBITDA)',
        intr: 'a table or graph',
        summaries: []
    },
    {
        name: 'Factors driving value',
        intr: 'sentance and 3-6 bullets',
        summaries: []
    },
    {
        name: 'Notable transactions',
        intr: 'sentance and 3-6 bullets',
        summaries: []
    },
    {
        name: 'Aerospace Industry Trends and Drivers',
        intr: '2 paragraphs',
        summaries: []
    },
    {
        name: '2024 DOD BUDGET BY DIVISION',
        intr: 'a short paragraph per division',
        summaries: []
    },
]

async function main() {
    const searchResults: SearchResult<ContentsOptions>[] = JSON.parse(fs.readFileSync('searchResults.json', 'utf-8'))


    // generate summaries
    sections = await Promise.all(sections.map(async (section) => {
        section.summaries = await Promise.all(

            searchResults.map(async (searchResult) => {

                const resp = await getLLMResponse({
                    user: `Summarize what the following acticle says about "${section.name}" in ${TOPIC}` + `<arcticle>\n${searchResult.text}\n</arcticle>`

                })
                addUsage(resp.usage)
                return { url: searchResult.url, text: resp.text }
            })
        )
        
        console.log(`Finished summarizing for ${section.name}`)
        return section
    }))


    // write the sections
    sections = await Promise.all(sections.map(async (section) => {
        const sectionContent = await writeSection(section)
        section.md = sectionContent.text
        return section
    }))


    fs.writeFileSync('sections.json', JSON.stringify(sections))


    console.log(USAGE)
}


async function writeSection(section: ISection) {
    const prompt = `Write ${section.intr} about ${section.name} in ${TOPIC}. Use markdown formatting.`
    const referenceMaterialPrompt = `\n\n Reference Material:\n\n${section.summaries.map(s => s.text).join("\n\n")}`
    const completion = await getLLMResponse({ user: prompt + referenceMaterialPrompt })
    addUsage(completion.usage)
    return completion
}





// main()


async function redoSection(sectionIdx:number) {
    const savedSections = JSON.parse(fs.readFileSync('sections.json', 'utf-8'))

    const section = sections[sectionIdx]

    const sectionContent = await writeSection(section)
    section.md = sectionContent.text

    console.log(section.md)


    savedSections[sectionIdx] = section

    fs.writeFileSync('sections.json', JSON.stringify(savedSections))
    
}


// redoSection(0)

async function updateReport() {

    sections = JSON.parse(fs.readFileSync('sections.json', 'utf-8'))

    const reportStr = sections.map(section => section.md).filter(Boolean).join("\n\n")

    fs.writeFileSync('report.md', reportStr)
}

updateReport()



