"use client"

import { Box, Button, Center, Container, Divider, Drawer, Grid, Group, Loader, Stack, Stepper, Text, TextInput, Textarea, Title, UnstyledButton, rem } from "@mantine/core";
import { saveSections, search, writeDraft } from "./actions";
import { useEffect, useState } from "react";

import { ISection } from "./types";
import { IconPlus } from "@tabler/icons-react";
import { SectionDrawerContents } from "./SectionEditDrawer";
import { SectionView } from "./SectionView";

export function ReportEditor() {

    const [activeStep, setActive] = useState(1);
    const nextStep = () => setActive((current) => (current < 2 ? current + 1 : current));
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    const [topic, setTopic] = useState("vitamin, supplement, and nutrition products industries")
    const [sectionsData, setSectionsData] = useState<ISection[]>([])
    const [searchState, setSearchState] = useState('idle')

    const [draftState, setDraftState] = useState('idle')

    const [activeSetcion, setActiveSetcion] = useState<ISection | null>(null)

    useEffect(() => {


        setDraftState('loading')
        writeDraft(topic, sectionsData).then((draft) => {
            setDraftState('success')
            setSectionsData(draft)
        }).catch((err) => {
            console.log(err)
            setDraftState('error')
        })

        if (activeStep === 1) {
            // setSearchState('loading')
            // search(topic, sectionsData).then((sectionsWithSearchResults) => {
            //     setSectionsData(sectionsWithSearchResults)
            //     setSearchState('success')

            // }).catch((err) => {
            //     console.log(err)
            //     setSearchState('error')
            // })


        }

        return () => { }
    }, [])







    return (
        <Box>


            <Stepper p={"lg"} active={activeStep} onStepClick={setActive} mih={600}>

                <Stepper.Step label="Outline" description="" >
                    <Container>
                        <Title order={4}>Topic</Title>
                        {/* <Group> */}

                        <Textarea
                            // label="What topic would you like to research?"
                            value={topic}
                            onChange={(event) => setTopic(event.currentTarget.value)}
                            autosize
                            name="topic"
                            placeholder="Aerospace"
                        />
                        {/* </Group> */}
                        <Divider mt={"sm"} />

                        <Title order={4}>Outline</Title>
                        <Stack gap={"xs"}>
                            {sectionsData.map((section: ISection, i: number) => (
                                <Box key={i} pb={"xs"}>

                                    <TextInput
                                        key={i + "name"}
                                        value={section.name}
                                        onChange={(event) => {
                                            const newSections = [...sectionsData]
                                            newSections[i].name = event.currentTarget.value
                                            setSectionsData(newSections)
                                        }}
                                        label="Name"

                                    />
                                    <TextInput
                                        key={i + "instruction"}
                                        value={section.intr}
                                        onChange={(event) => {
                                            const newSections = [...sectionsData]
                                            newSections[i].intr = event.currentTarget.value
                                            setSectionsData(newSections)
                                        }}
                                        description={"Description"}

                                    />
                                </Box>
                            ))}


                        </Stack>
                    </Container>
                </Stepper.Step>


                <Stepper.Step label="Draft" description="">
                    <Container>

                        {searchState === 'error' && <Text color={"red"}>Search Error</Text>}
                        <Button disabled={searchState !== 'success'} loading={draftState === 'loading'}
                            onClick={async () => {
                                setDraftState('loading')
                                const sectionsWithMd = await writeDraft(topic, sectionsData)
                                setSectionsData(sectionsWithMd)
                                setDraftState('success')
                            }}
                        >Write a draft</Button>
                        <Button loading={searchState === 'loading'}
                            onClick={async () => {
                                setSearchState('loading')
                                const sections = await search(topic, sectionsData)
                                setSectionsData(sections)
                                setSearchState('success')
                            }}
                        >Search</Button>
                        <Button onClick={() => {
                            saveSections(sectionsData)
                        }}>Save</Button>
                        <Button onClick={() => {
                            const combinedMd = `# ${topic}\n\n` +sectionsData.reduce((acc: string, section: ISection) => {
                                return `${acc}## ${section.name}\n${section.md}\n\n`;
                            }, '');

                            const blob = new Blob([combinedMd], { type: "text/markdown" })
                            const url = URL.createObjectURL(blob)
                            const link = document.createElement('a')
                            link.href = url
                            link.download = `${topic.replaceAll(" ", "_")}.md`
                            link.click()
                            URL.revokeObjectURL(url)
                        }}>Export</Button>
                        {draftState === 'error' && <Text c={"red"}>Error</Text>}
                        {draftState === 'success' &&

                            <Box>
                                {sectionsData.map((section: ISection, i: number) => (
                                    <Box>



                                        <UnstyledButton onClick={() => setActiveSetcion(section)}>

                                            <SectionView key={i} section={section} />
                                        </UnstyledButton>
                                    </Box>
                                ))}

                            </Box>
                        }
                        <Button variant="default" fullWidth
                            leftSection={<IconPlus style={{ width: rem(14), height: rem(14) }} />}
                        >Add section</Button>
                    </Container>

                </Stepper.Step>
                <Stepper.Completed>
                    Done
                </Stepper.Completed>
            </Stepper>


            <Group justify="center" mt="xl" pb={"xl"}>
                <Button variant="default" onClick={prevStep}>Back</Button>
                <Button onClick={nextStep}>Next step</Button>
            </Group>

            <Drawer
                offset={8} radius="md" size={"xl"}
                opened={activeSetcion !== null}
                onClose={() => setActiveSetcion(null)}
                // title={activeSetcion?.name}
                position="right"
            >
                <SectionDrawerContents
                    topic={topic}
                    sectionData={activeSetcion}
                    allSections={sectionsData}
                    setSectionsData={setSectionsData} />
            </Drawer>
        </Box >

    );
}