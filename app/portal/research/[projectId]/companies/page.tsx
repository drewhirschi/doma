import { ActionIcon, Anchor, Group, Image, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, } from '@mantine/core';
import { IconAlertCircle, IconChevronLeft, IconExternalLink, IconFileArrowLeft, IconHome, IconMessageCircle, IconPhoto, IconSettings } from '@tabler/icons-react';

import Link from 'next/link';
import { ProjectWithModelCmp } from '../types';
import { isDefined } from '@/types/typeHelpers';
import { serverClient } from '@/shared/supabase-client/ServerClients';

export default async function Page({ params, searchParams }: { params: { projectId: string }, searchParams: { query: string, page: number, cmpId: number } }) {

    const query = searchParams?.query || '';
    const page = Number(searchParams?.page) - 1 || 0;
    const cmpId = Number(searchParams?.cmpId)

    const supabase = serverClient()
    const project = await supabase.from("ib_projects").select("*, model_cmp(*)").eq("id", params.projectId).single<ProjectWithModelCmp>();

    // console.log("project", project.data)
    const companiesGet = await supabase
        .from('company_profile')
        .select('*')
    // .eq('project_id', params.projectId)
    // .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)
    if (companiesGet.error) {
        throw new Error(companiesGet.error.message)
    }
    const companies = companiesGet.data


    const modelCmp = project.data?.model_cmp
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

    console.log(similarCompaniesGet.data?.map(c => ({ name: c.name, sim: c.similarity })))


    // console.log("companies", companies)

    const sortedCompanies = similarCompaniesGet.data
        ?.map(c => ({ ...c, similarity: Number(c.similarity) }))
        .sort((a, b) => b.similarity - a.similarity)
        .map(c => companies.find(cmp => cmp.id === c.id))
        .filter(isDefined)



    const rows = sortedCompanies?.map((element) => (

        <TableTr key={element.id} >
            <TableTd>
                <Group>
                    {element.favicon != null &&
                        <Image src={element.favicon} width={16} height={16} />
                    }
                    <Anchor c={"dark"} fw={500} component={Link} href={`/portal/research/companies/${element.id}`}>

                        {element.name || element.origin}
                    </Anchor>

                </Group>
            </TableTd>
            <TableTd>
                {similarCompaniesGet.data?.find(c => c.name === element.name)?.similarity}
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
            <Table>
                <TableThead>
                    <TableTr>
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

