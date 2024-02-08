// sum.test.js

import "dotenv/config"

import { execExtractor, parseRefLines, buildXmlContract } from '@/server/extractionAgent'

import { fullAccessServiceClient } from '@/supabase/ServerClients'
import { a } from "vitest/dist/suite-ghspeorC"
import { getAnnotationContractLines } from "./lineRefAnnotation"
import { ChatCompletionMessage } from "openai/resources"

// import { expect, test } from 'vitest'



const supabase = fullAccessServiceClient()

const TEST_PROJECT_ID = "2b3514bd-7ca7-4236-bf70-17cba9b6cd00"


function test(name: string, fn: () => Promise<void>) {
    console.log(`Running: ${name}`)
    fn()
        .then(() => console.log('Success'))
        .catch((e) => console.error('Error:', e))
}

test('license', async () => {
    const extractor = await supabase.from('parslet').select('*').eq("key", "license").single()

    if (!extractor.data) {
        throw new Error('No license extractor found')
    }

    const contracts = await supabase.from('contract')
        .select('*, contract_line(text, page_width, page_height, ntokens)')
        .eq('project_id', TEST_PROJECT_ID)
        .order("id", { referencedTable: "contract_line", ascending: true })



    const promises = []

    for (const contract of contracts.data!) {
        promises.push(execExtractor(extractor.data, contract))
    }

    let results = await Promise.all(promises)


    const contractsWithResults = contracts.data!.map((c, i) => ({ ...c, results: results[i].ok }))


    const annotations = await supabase.from('annotation').select('*')
        .eq("parslet_id", extractor.data.id)
        .in("contract_id", contracts.data?.map(c => c.id) ?? [])

    if (!annotations.data) {
        console.error(annotations.error)
        throw new Error("Couldn't load annotations for incorporated agreements")
    }

    const contractLinesPromises = annotations.data?.map(async a => {
        const contract = contracts.data?.find(c => c.id == a.contract_id)

        if (!contract || !contract.contract_line[0].page_height || !contract.contract_line[0].page_width) {
            console.error("Insufficient data on contract", a.contract_id)
            return new Promise(r => r([]))
        }



        return await getAnnotationContractLines(supabase, a, { height: contract?.contract_line[0].page_height, width: contract?.contract_line[0].page_width, id: a.contract_id })


    })

    const contractLines = await Promise.all(contractLinesPromises)

    const annotationsWithContractLines = annotations.data.map((a, i) => ({ ...a, contractLines: contractLines[i] }))


    let completeHumanSet: number[] = []
    let completeAiSet: number[] = []

    for (const contract of contractsWithResults) {
        console.log("Contract", contract.display_name)
        const annotationsReferencedLines = annotationsWithContractLines.filter(a => a.contract_id == contract.id)
            .reduce((acc, a) => {
                if (Array.isArray(a.contractLines)) {
                    a.contractLines.map((l: any) => l.id).forEach((l: any) => acc.add(l))
                }
                return acc
            }, new Set<number>)

        const extractorAgentReferencedLines = new Set<number>
        try {
            contract.results?.reduce((acc: Set<number>, d: any) => {
                const { start, end } = parseRefLines(d.lines)
                for (let i = start; i <= end; i++) {
                    acc.add(i)
                }
                return acc
            }, extractorAgentReferencedLines)

        } catch {
            console.error("Expected a different format from the agent response.")
            console.error("resp", contract.results)
        }

        console.log("Ezra referenced lines", Array.from(annotationsReferencedLines))
        console.log("Extractor referenced lines", Array.from(extractorAgentReferencedLines))


        completeHumanSet.push(...annotationsReferencedLines)
        completeAiSet.push(...extractorAgentReferencedLines)

        const result = compareNumberSets(annotationsReferencedLines, extractorAgentReferencedLines);
        console.log("Accuracy:", result.oldSetPercentage);
        console.log("Superfluous Information:", result.newSetPercentage);

    }

    // const completeresult = compareNumberSets(completeHumanSet, completeAiSet);
    // console.log("Total Accuracy:", completeresult.oldSetPercentage);
    // console.log("Total Superfluous Information:", completeresult.newSetPercentage);

    function compareNumberSets(humanSet: Set<number>, aiSet: Set<number>): { oldSetPercentage: number, newSetPercentage: number } {


        const accountedOldEntries = new Set([...humanSet].filter((entry) => humanSet.has(entry)));
        const unaccountedNewEntries = new Set([...aiSet].filter((entry) => !aiSet.has(entry)));

        const accountedOldPercentage = (accountedOldEntries.size / humanSet.size) * 100;
        const unaccountedNewPercentage = (unaccountedNewEntries.size / aiSet.size) * 100;

        return {
            oldSetPercentage: accountedOldPercentage,
            newSetPercentage: unaccountedNewPercentage,
        };
    }



})