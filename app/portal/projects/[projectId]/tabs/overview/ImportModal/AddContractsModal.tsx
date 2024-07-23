"use client"

import '@mantine/dropzone/styles.css';

import { Box, Button, CloseButton, Group, Modal, Paper, Progress, ScrollArea, Stack, Stepper, Text, rem } from '@mantine/core';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import { IconAlertCircle, IconCircleCheck, IconDeviceFloppy, IconFile, IconFileZip, IconFolder, IconPhoto, IconUpload, IconUserPlus, IconX, IconZip } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { FileInput } from '@mantine/core';
import { FileObject } from '@supabase/storage-js'
import { browserClient } from '@/supabase/BrowserClient';
import { formatBytes } from '@/ux/helper';
import { unzipFileServerAction } from './AddContractsModal.actions';
import { uploadTenantFile } from '@/supabase/Storage';
import { useDisclosure } from '@mantine/hooks';

interface Props {
    project: Project_SB
}

enum WizStatus {
    IDLE,
    UPLOADING,
    UPLOAD_SUCCESS,
    UPLOAD_ERROR,
    UNZIPPING,
    UNZIP_SUCCESS,
    UNZIPPING_ERROR,
    ASSIGNING
}

enum WizSteps {
    UPLOAD,
    UNZIP,
    ASSIGN

}

export function AddContractsModalButton({ project }: Props) {
    const [opened, { open: openModal, close: partialCloseModal }] = useDisclosure(false);

    const supabase = browserClient()
    const [uploadStatus, setUploadStatus] = useState<WizStatus>(WizStatus.IDLE)
    const [files, setFiles] = useState<FileWithPath[]>([]);
    const [uploadProgress, setUploadProgress] = useState<Map<string, number>>(new Map())
    const [uploadedFiles, setUploadedFiles] = useState<FileObject[]>([])

    const [activeStep, setActiveStep] = useState(WizSteps.UPLOAD);
    const nextStep = () => setActiveStep((current) => (current < 3 ? current + 1 : current));
    const prevStep = () => setActiveStep((current) => (current > 0 ? current - 1 : current));


    const closeModal = () => {
        partialCloseModal();
        setUploadStatus(WizStatus.IDLE);
        setFiles([]);
        setUploadProgress(new Map())
    }

    const uploadAndUnpackFiles = async (e: any) => {
        e.preventDefault();
        try {
            setUploadStatus(WizStatus.UPLOADING);
            const uploadProms = files.map(async (file) => {

                const fileName = `${project.tenant_id}/projects/${project.id}/${file?.name}`
                const uploadurl = await uploadTenantFile(supabase, fileName, file, {
                    updatePercentage: (percentage) => {
                        setUploadProgress((prevState) => {
                            prevState.set(file.name, percentage)
                            return prevState
                        });
                    }
                });

            })

            await Promise.all(uploadProms)
            setUploadStatus(WizStatus.UPLOAD_SUCCESS);
        } catch (error) {
            setUploadStatus(WizStatus.UPLOAD_ERROR);
            return
        }

        setUploadStatus(WizStatus.UNZIPPING);
        // setActiveStep(WizSteps.UNZIP);

        try {
            files.map(async (file) => {
                if (file.type === "application/zip") {
                    await unzipFileServerAction(`${project.tenant_id}/projects/${project.id}/${file?.name}`, project.id);

                }
            })
            setUploadStatus(WizStatus.UNZIP_SUCCESS);
        } catch (error) {
            setUploadStatus(WizStatus.UNZIPPING_ERROR);

        }

        // setActiveStep(WizSteps.ASSIGN);

        try {


            const filesListRes = await supabase.storage.from("tenants").list(`${project.tenant_id}/projects/${project.id}/${files[0]?.name.replace(".zip", "")}`)
            if (filesListRes.error) {
                throw filesListRes.error
            }
            setUploadedFiles(filesListRes.data)
        } catch (error) {

        }
    }






    return (
        <>
            <Modal opened={opened} onClose={closeModal} closeOnClickOutside title="Add Contracts" size={"lg"} >
                <Stack mih={480} justify='space-between'>
                    <Stepper size="sm" active={activeStep} onStepClick={setActiveStep} p="md">

                        <Stepper.Step
                            label="Upload"
                            loading={uploadStatus == WizStatus.UPLOADING}


                            icon={<IconUpload style={{ width: rem(18), height: rem(18) }} />}
                        >
                            <Stack>

                                <Dropzone
                                    useFsAccessApi
                                    onDrop={(files) => setFiles(files)}
                                    onReject={(files) => console.log('rejected files', files)}
                                    maxSize={5 * 1024 ** 3}
                                    accept={['application/zip',
                                        "application/x-zip-compressed",
                                        'application/pdf',
                                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                        'text/csv'
                                    ]}
                                    multiple={true}
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
                                {files.map((file) => {
                                    const fileUploadProgress = (uploadProgress.get(file.name) ?? 0) * 100;
                                    const fileuploadSuccess = fileUploadProgress === 100;
                                    return (
                                        <Paper key={file.name} p={"sm"} shadow='sm'>

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
                                                {fileuploadSuccess ? <IconCircleCheck
                                                    style={{ color: "green" }}
                                                    stroke={1.5}
                                                /> : <CloseButton onClick={() => {
                                                    // Remove the file from the files array
                                                    setFiles(files.filter(f => f !== file));
                                                }} />}
                                            </Group>
                                            {uploadStatus !== WizStatus.IDLE && (
                                                <Progress.Root radius="xs" size="xs">
                                                    <Progress.Section
                                                        color={fileuploadSuccess ? "green" : "blue"}
                                                        animated={uploadStatus === WizStatus.UPLOADING}
                                                        value={fileUploadProgress}
                                                        style={{
                                                            transform: `translateX(-${100 - fileUploadProgress}%)`,
                                                            transition: "transform 200ms ease", // Add CSS transition
                                                        }}
                                                    />
                                                </Progress.Root>
                                            )}

                                        </Paper>
                                    )
                                })}
                            </Stack>


                        </Stepper.Step>

                        <Stepper.Step label="Read Files" allowStepClick={false} loading={uploadStatus == WizStatus.UNZIPPING} icon={<IconDeviceFloppy style={{ width: rem(18), height: rem(18) }} />} >


                        </Stepper.Step>
                        <Stepper.Step label="Assign" icon={<IconUserPlus style={{ width: rem(18), height: rem(18) }} />} >
                            <ScrollArea mah={480}>

                                {uploadedFiles.map((file) => (
                                    <Paper key={file.name} p={"sm"} shadow='sm'>
                                        <Group>
                                            {!!file.id ? <IconFile
                                                size={18}
                                                stroke={1.5}
                                            /> :
                                                <IconFolder
                                                    size={18}
                                                    stroke={1.5}
                                                />}
                                            {file.name}
                                        </Group>
                                    </Paper>))
                                }
                            </ScrollArea>
                        </Stepper.Step>

                    </Stepper>


                    <Group justify="center">


                        <Button type="submit" disabled={files?.length < 1}
                            loading={uploadStatus === WizStatus.UPLOADING}
                            onClick={uploadStatus === WizStatus.IDLE ? uploadAndUnpackFiles : closeModal}
                        >{uploadStatus === WizStatus.IDLE ? "Upload" : "Close"}</Button>


                        {/* <Button variant="default" onClick={prevStep}>Back</Button>
                        <Button onClick={nextStep}>Next step</Button> */}
                    </Group>

                </Stack>
            </Modal>

            <Button onClick={openModal}>Import</Button>
        </>
    );
}
