"use client"

import { ActionIcon, Anchor, Button, Checkbox, Group, Image, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, } from '@mantine/core';
import { IconExternalLink, IconPlus, } from '@tabler/icons-react';
import { use, useEffect, useState } from 'react';

import { AddToDealModal } from './AddToDealModal';
import Link from 'next/link';
import { browserClient } from '@/shared/supabase-client/BrowserClient';
import { isDefined } from '@/types/typeHelpers';
import { serverClient } from '@/shared/supabase-client/ServerClients';

interface CompanyWithSimilarity extends CompanyProfile_SB {
    similarity: number;
}

export default function Page({ params, searchParams }: { params: { cmpId: string }, searchParams: { query: string, page: number, cmpId: number } }) {
    const [selectedCompanies, setSelectedCompanies] = useState<number[]>([]);
    const [sortedCompanies, setSortedCompanies] = useState<CompanyWithSimilarity[]>([]);
    const [loading, setLoading] = useState(false)

    const handleCheckboxChange = (companyId: number) => {
        setSelectedCompanies(prev =>
            prev.includes(companyId)
                ? prev.filter(id => id !== companyId)
                : [...prev, companyId]
        );
    };



    const query = searchParams?.query || '';
    const page = Number(searchParams?.page) - 1 || 0;

    useEffect(() => {

        const loadData = async () => {
            setLoading(true)

            const supabase = browserClient()

            const companyGet = await supabase
                .from('company_profile')
                .select('*')
                .eq('id', params.cmpId)
                .single()

            if (companyGet.error) {
                throw new Error(companyGet.error.message)
            }
            const modelCmp = companyGet.data




            if (!modelCmp) {
                throw new Error("Could not find model company")
            } else if (!modelCmp.web_summary_emb) {
                throw new Error("Model company has no web summary emb")
            }
            const similarCompaniesGet = await supabase.rpc('match_cmp_summaries', {
                match_count: 30,
                match_threshold: 0.05,
                query_embedding: modelCmp.web_summary_emb!
            })

            if (similarCompaniesGet.error) {
                throw new Error(similarCompaniesGet.error.message)
            }

            const companiesGet = await supabase
                .from('company_profile')
                .select('*')
                .in('id', similarCompaniesGet.data?.map(c => c.id) || [])

            if (companiesGet.error) {
                throw new Error(companiesGet.error.message)
            }


            // console.log("companies", companies)

            const sortedCompanies = similarCompaniesGet.data
                ?.map(c => ({ ...c, similarity: Number(c.similarity) }))
                .sort((a, b) => b.similarity - a.similarity)
                .map(c => {
                    const company = companiesGet.data?.find(cmp => cmp.id === c.id)
                    if (!company) {
                        console.log("Could not find company", c.id)
                        return undefined
                    }
                    return {
                        ...company,
                        similarity: c.similarity
                    }
                })
                .filter(isDefined)

            setLoading(false)

            setSortedCompanies(sortedCompanies)

        }
        loadData()


        return () => {

        }
    }, [])

    useEffect(() => {

        const loadData = async () => {

            const supabase = browserClient()

            const companyGet = await supabase
                .from('company_profile')
                .select('*')
                .eq('id', params.cmpId)
                .single()

            if (companyGet.error) {
                throw new Error(companyGet.error.message)
            }
            const modelCmp = companyGet.data

            if (!modelCmp.web_summary_emb) {
                return
            }
            console.log("modelCmp", modelCmp)
            const companiesGet = await supabase.rpc('match_cmp_adaptive', {
                match_count: 50,
                query_embedding: modelCmp.web_summary_emb
            })

            if (companiesGet.error) {
                throw new Error(companiesGet.error.message)
            }
            console.log("adaptive",companiesGet.data.map(c => c.name))

        }

        loadData()

       

    }, [])

    const rows = sortedCompanies?.map((element) => (

        <TableTr key={element.id} >
            <TableTd>
                <Checkbox
                    checked={selectedCompanies.includes(element.id)}
                    onChange={() => handleCheckboxChange(element.id)}
                />
            </TableTd>
            <TableTd>
                <Group>
                    {element.favicon != null &&
                        <Image src={element.favicon} width={16} height={16} />
                    }
                    <Anchor c={"dark"} fw={500} component={Link} href={`/portal/research/companies/${element.id}/overview`}>

                        {element.name || element.origin}
                    </Anchor>

                </Group>
            </TableTd>
            <TableTd>
                {element.similarity}
            </TableTd>
            <TableTd>
                {element.origin}
            </TableTd>


            <TableTd>
                <Group>
                    {element.origin && <ActionIcon
                        p={"xs"}
                        variant='subtle'
                        component={Link}
                        href={element.origin}
                        size="xl"
                        aria-label="Open in a new tab"
                    >
                        <IconExternalLink size={20} />
                    </ActionIcon>}
                </Group>
            </TableTd>


        </TableTr>

    ));


    return (
        <>
            <Group mb="md" justify='flex-end'>
                <AddToDealModal selectedCompanies={selectedCompanies} />
                {/* You can add more buttons here if needed */}
            </Group>
            <Table>
                <TableThead>
                    <TableTr>
                        <TableTd>
                            <Checkbox
                                checked={selectedCompanies.length === sortedCompanies.length}
                                onChange={() => {
                                    if (selectedCompanies.length === sortedCompanies.length) {
                                        setSelectedCompanies([]);
                                    } else {
                                        setSelectedCompanies(sortedCompanies.map(company => company.id));
                                    }
                                }}
                                indeterminate={selectedCompanies.length > 0 && selectedCompanies.length < sortedCompanies.length}
                            />
                        </TableTd>
                        <TableTh>Name</TableTh>
                        <TableTh>Relevance score</TableTh>
                        <TableTh>Website</TableTh>

                    </TableTr>
                </TableThead>
                <TableTbody>{rows}</TableTbody>
            </Table>
            {/* <CompanyProfile companyId={cmpId} /> */}
        </>
    );


};

