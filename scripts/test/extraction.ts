// sum.test.js

import "dotenv/config"

import { execExtractor, parseRefLines, xmlLinesContract } from '@/server/processContract'

import { fullAccessServiceClient } from '@/supabase/ServerClients'
import { a } from "vitest/dist/suite-ghspeorC"
import { getAnnotationContractLines } from "./lineRefAnnotation"
import { ChatCompletionMessage } from "openai/resources"

// import { expect, test } from 'vitest'



const supabase = fullAccessServiceClient()

const TEST_PROJECT_ID = "2b3514bd-7ca7-4236-bf70-17cba9b6cd00"
let completeoldSet: number[] = []
let completenewSet: number[] = []

function test(name: string, fn: () => Promise<void>) {
    console.log(`Running: ${name}`)
    fn()
        .then(() => console.log('Success'))
        .catch((e) => console.error('Error:', e))
}

test('license', async () => {
    // console.log(process.env)
    const extractor = await supabase.from('parslet').select('*').eq("key", "license").single()

    if (!extractor.data) {
        throw new Error('No license extractor found')
    }

    const contracts = await supabase.from('contract')
        .select('*, contract_line(text, page_width, page_height)')
        .eq('project_id', TEST_PROJECT_ID)
        .order("id", { referencedTable: "contract_line", ascending: true })



    const promises = []

    for (const contract of contracts.data!) {
        const xmlContract = xmlLinesContract(contract.contract_line)
        promises.push(execExtractor(extractor.data, xmlContract))
    }

    let results: ChatCompletionMessage[] = await Promise.all(promises)


    const contractsWithResults = contracts.data!.map((c, i) => ({ ...c, results: JSON.parse(results[i].content ?? "") }))


    const incorporatedAgreementsAnnotation = await supabase.from('annotation').select('*')
        .eq("parslet_id", extractor.data.id)
        .in("contract_id", contracts.data?.map(c => c.id) ?? [])

    if (!incorporatedAgreementsAnnotation.data) {
        console.error(incorporatedAgreementsAnnotation.error)
        throw new Error("Couldn't load annotations for incorporated agreements")
    }

    const contractLinesPromises = incorporatedAgreementsAnnotation.data?.map(async a => {
        const contract = contracts.data?.find(c => c.id == a.contract_id)

        if (!contract || !contract.contract_line[0].page_height || !contract.contract_line[0].page_width) {
            console.error("Insufficient data on contract", a.contract_id)
            return new Promise(r => r([]))
        }



        return await getAnnotationContractLines(supabase, a, { height: contract?.contract_line[0].page_height, width: contract?.contract_line[0].page_width, id: a.contract_id })


    })

    const contractLines = await Promise.all(contractLinesPromises)

    const annotationsWithContractLines = incorporatedAgreementsAnnotation.data.map((a, i) => ({ ...a, contractLines: contractLines[i] }))


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
            contract.results.data.reduce((acc: Set<number>, d: any) => {
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
        let oldSet: number[] = [...annotationsReferencedLines]
        let newSet: number[] = [...extractorAgentReferencedLines]
        completeoldSet.push(...annotationsReferencedLines)
        completenewSet.push(...extractorAgentReferencedLines)

        const result = compareNumberSets(oldSet, newSet);
        console.log("Accuracy:", result.oldSetPercentage);
        console.log("Superfluous Information:", result.newSetPercentage);

    }

    const completeresult = compareNumberSets(completeoldSet, completenewSet);
    console.log("Total Accuracy:", completeresult.oldSetPercentage);
    console.log("Total Superfluous Information:", completeresult.newSetPercentage);

    function compareNumberSets(oldSet: number[], newSet: number[]): { oldSetPercentage: number, newSetPercentage: number } {
        const oldSetCount = oldSet.length;
        const newSetCount = newSet.length;

        // Use Sets for efficient membership checks and difference calculations
        const oldSetEntries = new Set(oldSet);
        const newSetEntries = new Set(newSet);

        const accountedOldEntries = new Set([...oldSet].filter((entry) => newSetEntries.has(entry)));
        const unaccountedNewEntries = new Set([...newSet].filter((entry) => !oldSetEntries.has(entry)));

        const accountedOldPercentage = (accountedOldEntries.size / oldSetCount) * 100;
        const unaccountedNewPercentage = (unaccountedNewEntries.size / newSetCount) * 100;

        return {
            oldSetPercentage: accountedOldPercentage,
            newSetPercentage: unaccountedNewPercentage,
        };
    }



})