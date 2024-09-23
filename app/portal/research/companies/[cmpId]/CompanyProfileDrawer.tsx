"use client"

import { ActionIcon, Group, Title } from '@mantine/core';

import { BackButton } from '@/ux/components/BackButton';
import { IconExternalLink } from '@tabler/icons-react';
import Link from 'next/link';
import Markdown from 'react-markdown';
import { browserClient } from '@/shared/supabase-client/BrowserClient';
import { useSBFetch } from '@/ux/hooks';

type Props = {
    companyId: number
}



export function CompanyProfile({ companyId }: Props) {
    const supabase = browserClient()
    const { data, loading, error, refetch, } = useSBFetch<CompanyProfile_SB>(
        () => supabase.from('company_profile').select('*').eq('id', companyId).single(),
        [companyId]
    );



    if (!companyId) return null


    if (error) {
        return <p>{error.message}</p>
    } else if (loading) {
        return <p>Loading...</p>
    }

    return (
        <><Group>
            <BackButton browser />
            <Title>{data?.name}</Title>
            {data?.origin && <ActionIcon
                p={"xs"}
                variant='subtle'
                component={Link}
                href={data.origin}
                target='_blank'
                size="xl"
                aria-label="Open in a new tab"
            >
                <IconExternalLink size={20} />
            </ActionIcon>}
        </Group>
            <Markdown>{data?.web_summary}</Markdown>
        </>
    );
}