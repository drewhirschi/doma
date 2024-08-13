import { ActionIcon, Box, Button, Grid, Group, Select, Stack, Text, TextInput, Textarea } from "@mantine/core";

import { AgreementTypes } from "@/types/enums";
import { ISection } from "./types";
import { IconDownload } from "@tabler/icons-react";
import MetadataItem from "@/components/MetadataItem";
import { SearchResultPreview } from "./SearchResultPreview";
import { browserClient } from "@/supabase/BrowserClient";
import { draftSection } from "./actions";
import { notifications } from "@mantine/notifications";
import { useDebouncedCallback } from "use-debounce";
import { useForm } from '@mantine/form';
import { useState } from "react";

interface SectionDrawerProps {
    sectionData: ISection | null
    allSections: ISection[]
    setSectionsData: (sections: ISection[]) => void
    topic: string
}



export function SectionDrawerContents({ sectionData, setSectionsData, allSections, topic }: SectionDrawerProps) {

    const [section, setSection] = useState(sectionData)
    const [redraftState, setRedraftState] = useState("idle")

    const debouncedSetSections = useDebouncedCallback((sections: ISection[]) => {
        const index = allSections.findIndex((s) => s.name === section?.name);
        if (index !== -1 && section !== null) {
            allSections[index] = section;
        }
        setSectionsData(sections);
    }, 500);


    if (section === null) {
        return (<></>);
    }

    return (
        <Stack>
            <Grid align="flex-end">
                <Grid.Col span={8}>
                    <TextInput
                        label="Section description"
                        onChange={(e) => {
                            setSection({ ...section, intr: e.target.value })
                            debouncedSetSections(allSections)
                        }}
                        value={section.intr ?? ""}
                    />
                </Grid.Col>
                <Grid.Col span="auto">
                    <Button
                    loading={redraftState === "loading"}
                    onClick={async () => {
                        setRedraftState("loading")
                        const redoneSection = await draftSection(section, topic)
                        setRedraftState("idle")
                        setSection(redoneSection)
                        debouncedSetSections(allSections)
                    }}
                    >Redo</Button>
                </Grid.Col>
            </Grid>


            <Textarea
                label="Content"
                autosize
                onChange={(e) => {
                    setSection({ ...section, md: e.target.value })
                    debouncedSetSections(allSections)
                }}
                value={section.md ?? ""}
            />

            <Text size="sm" fw={500}>Sources ({section.searchResults?.length ?? 0})</Text>
            {section.searchResults?.map((searchResult, i) => (<SearchResultPreview searchResult={searchResult} key={searchResult.url} summary={section.summaries?.[i]?.text} />))}
        </Stack>
    );




}