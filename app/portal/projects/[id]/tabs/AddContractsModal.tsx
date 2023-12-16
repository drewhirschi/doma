"use client"

import '@mantine/dropzone/styles.css';

import { Button, CloseButton, Group, Modal, Paper, Progress, Stack, Text, rem } from '@mantine/core';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import { IconCircleCheck, IconFile, IconFileZip, IconPhoto, IconUpload, IconX, IconZip } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { FileInput } from '@mantine/core';
import { browserClient } from '@/supabase/BrowerClients';
import { formatBytes } from '@/helper';
import { uploadTenantFile } from '@/supabase/Storage';
import { useDisclosure } from '@mantine/hooks';

interface Props {
    projectId: string
}



export function AddContractsModalButton({ projectId }: Props) {
    const [opened, { open, close }] = useDisclosure(false);

    const supabase = browserClient()
    const [uploadStatus, setUploadStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [files, setFiles] = useState<FileWithPath[]>([]);
    const [uploadProgress, setUploadProgress] = useState(0)










    return (
        <>
            <Modal opened={opened} onClose={close} closeOnClickOutside title="Add Contracts" >

                <Stack>

                    <Dropzone
                        onDrop={(files) => setFiles(files)}
                        onReject={(files) => console.log('rejected files', files)}
                        maxSize={5 * 1024 ** 3}
                        accept={['application/zip']}
                        multiple={false}
                    // {...props}
                    >
                        <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                            <Dropzone.Accept>
                                <IconUpload
                                    style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-blue-6)' }}
                                    stroke={1.5}
                                />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <IconX
                                    style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-red-6)' }}
                                    stroke={1.5}
                                />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <IconFile
                                    style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-dimmed)' }}
                                    stroke={1.5}
                                />
                            </Dropzone.Idle>

                            <div>
                                <Text size="xl" inline>
                                    Drag your zip file here
                                </Text>
                                <Text size="sm" c="dimmed" inline mt={7}>
                                    Zip may not exceed {formatBytes(5 * 1024 ** 3)}
                                </Text>
                            </div>
                        </Group>
                    </Dropzone>
                    {files.map((file) => (
                        <Paper p={"sm"} shadow='sm'>

                            <Group justify='space-between'>
                                <Group>

                                    <IconFileZip
                                        style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-dimmed)' }}
                                        stroke={1.5}
                                    />
                                    <div>
                                        <Text inline>
                                            {file.name}
                                        </Text>
                                        <Text size="sm" c="dimmed" inline mt={7}>
                                            {formatBytes(file.size)}
                                        </Text>
                                    </div>
                                </Group>
                                {(uploadStatus == "success")? <IconCircleCheck
                                 style={{ color: "green" }}
                                 stroke={1.5}
                                /> :<CloseButton onClick={() => {
                                    // Remove the file from the files array
                                    setFiles(files.filter(f => f !== file));
                                }} />}
                            </Group>
                            {uploadStatus != "idle" && <Progress
                            
                                radius="xs"
                                size="xs"
                                animated
                                value={uploadProgress * 100} />}

                        </Paper>
                    ))}

                    {/* <FileInput label="Input label" value={file} onChange={setFile} /> */}
                    <Group>

                        <Button type="submit" disabled={files?.length < 1} loading={uploadStatus == "loading"} onClick={async (e) => {
                            e.preventDefault()
                            try {
                                setUploadStatus("loading")
                                const res = await uploadTenantFile(supabase, `projects/${projectId}/${files[0]?.name}`, files[0]!, {
                                    updatePercentage: (percentage) => {
                                        console.log(percentage)
                                        setUploadProgress(percentage)
                                    }
                                })
                                setUploadStatus("success")
                            } catch (error) {
                                console.log(error)
                            }
                        }}>Submit</Button>
                    </Group>
                </Stack>
            </Modal>

            <Button onClick={open}>Add</Button>
        </>
    );
}