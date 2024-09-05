import { CompanyProfile } from './CompanyProfileDrawer';
import React from 'react';

interface IpageProps { }

export default async function Page({ params, searchParams }:
    { params: { projectId: string, cmpId: number }, searchParams: { query: string, page: number, cmpId: number } }) {
    return (
        <div>
            <CompanyProfile companyId={params.cmpId} />
        </div>
    );
}