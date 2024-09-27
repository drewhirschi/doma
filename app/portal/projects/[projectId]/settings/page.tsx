'use client'

import { Button, Modal, Text, TextInput } from '@mantine/core';
import { deleteProject, renameProject } from './actions';

import { actionWithNotification } from '@/ux/clientComp';
import { browserClient } from '@/ux/supabase-client/BrowserClient';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProjectSettingsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
    const { projectId } = useParams();
    const supabase = browserClient();
    const [projectName, setProjectName] = useState('');
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

    const handleDeleteProject = async () => {
        try {
            await actionWithNotification(
                async () => deleteProject(parseInt(projectId as string)),
                {
                    loadingMessage: 'Deleting project...',
                    successMessage: 'Project deleted successfully',
                }
            );
            setIsModalOpen(false);
            router.push('/portal/projects');
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };



    const handleRenameProject = async () => {
        try {
            await actionWithNotification(
                async () => {
                    await renameProject(parseInt(projectId as string), projectName)
                },
                {
                    loadingMessage: 'Renaming project...',
                    successMessage: 'Project renamed successfully',
                }
            );
            setIsRenameModalOpen(false);
        } catch (error) {
            console.error('Error renaming project:', error);
        }
    };

    return (
        <div>
            <Button onClick={() => setIsRenameModalOpen(true)} mb="md">
                Rename Project
            </Button>
            <Button color="red" onClick={() => setIsModalOpen(true)} mb="md">
                Delete Project
            </Button>

            <Modal
                opened={isRenameModalOpen}
                onClose={() => setIsRenameModalOpen(false)}
                title="Rename Project"
            >
                <TextInput
                    value={projectName}
                    onChange={(event) => setProjectName(event.currentTarget.value)}
                    placeholder="New project name"
                    mb="md"
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            handleRenameProject();
                        }
                    }}
                />
                <Button onClick={handleRenameProject}>
                    Confirm Rename
                </Button>
            </Modal>

            <Modal
                opened={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Confirm Project Deletion"
            >
                <Text mb="md">Are you sure you want to delete this project? This action cannot be undone.</Text>
                <Button color="red" onClick={handleDeleteProject}>
                    Confirm Delete
                </Button>
            </Modal>
        </div>
    );
}
