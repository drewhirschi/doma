"use client"

import 'maplibre-gl/dist/maplibre-gl.css';
import 'maplibre-gl/dist/maplibre-gl.css';

import { ActionIcon, Box, Button, Container, Group, Paper, Stack, TextInput } from '@mantine/core';
import { queueFindIndustryCompanies, queueFindIndustyActivity } from './actions';

import { AddToDealModal } from '../companies/AddToDealModal';
import CompanySummaryEditor from '@/ux/components/CompanySummaryEditor';
import { IconDownload } from '@tabler/icons-react';
import { LogosMeun } from './LogosMenu';
import Map from 'react-map-gl/maplibre';
import { Protocol } from "pmtiles";
import type { Tables } from '@/shared/types/supabase-generated';
import { actionWithNotification } from '@/ux/clientComp';
import maplibregl from 'maplibre-gl';
import { useEffect } from 'react';

export default function OverviewTab({
    companyProfile,
    logos
}: {
    companyProfile: CompanyProfile_SB
    logos: Tables<'cmp_logos'>[]
}) {



    useEffect(() => {

        let protocol = new Protocol();
        maplibregl.addProtocol("pmtiles", protocol.tile);
        return () => {
            maplibregl.removeProtocol("pmtiles");
        }
    }, [])



    console.log("hq", companyProfile.headquaters)

    return (
        <Group align='flex-start' m={"sm"}>
            <Stack>

                <Paper
                    radius={8}
                    withBorder
                    p={"xs"}
                >


                    <Box my={"xs"}>

                        <Button disabled={companyProfile == null} onClick={() => {
                            actionWithNotification(() =>
                                queueFindIndustryCompanies(companyProfile!.id)
                            )
                        }}>Find companies</Button>
                        <Button disabled={companyProfile == null} onClick={() => {
                            actionWithNotification(() =>
                                queueFindIndustyActivity(companyProfile!.id)
                            )
                        }}>Find Transactions</Button>
                        <AddToDealModal selectedCompanies={[companyProfile.id]} />
                    </Box>
                </Paper>
                <Paper
                    style={{
                        backgroundSize: '20px 20px',
                        backgroundImage: 'repeating-linear-gradient(45deg, #ddd 0, #ddd 10px, transparent 10px, transparent 20px)'
                    }}
                    radius={8}
                    withBorder
                    p={"xs"}
                >
                    {logos.map((l) => (
                        <Box key={l.url} pos="relative">

                            <img alt={l.alt ?? ""} src={l.url} height={100} />
                            <Group
                                gap={"xs"}
                                pos="absolute"
                                right={0}
                                bottom={0}>
                                <LogosMeun logo={l} />
                                <ActionIcon

                                    variant="filled"
                                    aria-label="Download logo"
                                    onClick={async () => {
                                        try {
                                            const response = await fetch(l.url);
                                            const blob = await response.blob();
                                            const url = window.URL.createObjectURL(blob);
                                            const link = document.createElement('a');
                                            link.href = url;
                                            link.download = `${l.alt || 'download'}.png`;
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                            window.URL.revokeObjectURL(url);
                                        } catch (error) {
                                            console.error('Download failed:', error);
                                            // Handle the error (e.g., show a notification to the user)
                                        }
                                    }}
                                >
                                    <IconDownload style={{ width: '70%', height: '70%' }} stroke={1.5} />
                                </ActionIcon>
                            </Group>
                        </Box>
                    ))}

                </Paper>
                <Paper
                    id='hq-map'
                    radius={8}
                    withBorder
                    p={"xs"}
                >
                    {/* <Map
                        initialViewState={{
                            longitude: companyProfile.headquaters,
                            latitude: 37.8,
                            zoom: 14
                        }}
                        style={{ width: 600, height: 400 }}
                        mapStyle="https://demotiles.maplibre.org/style.json"
                    /> */}

                </Paper>

            </Stack>
            <CompanySummaryEditor companyProfile={companyProfile} />
        </Group>

    );
}