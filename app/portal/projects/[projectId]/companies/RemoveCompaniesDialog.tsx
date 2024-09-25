import { Button, Group, Modal, Text } from '@mantine/core';

import { LoadingState } from '@/types/loadingstate';
import { actionWithNotification } from '@/ux/clientComp';
import { browserClient } from '@/shared/supabase-client/BrowserClient';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';

interface RemoveCompaniesDialogProps {
    selectedCompanies: number[];
    projectId: string;
    onRemoveSuccess: () => void;
}

export function RemoveCompaniesDialog({ selectedCompanies, projectId, onRemoveSuccess }: RemoveCompaniesDialogProps) {
    const [opened, { open, close }] = useDisclosure(false);
    const [removeLoading, setRemoveLoading] = useState<LoadingState>(LoadingState.IDLE);

    const handleRemove = async () => {
        setRemoveLoading(LoadingState.LOADING);
        const supabase = browserClient();

        await actionWithNotification(async () => {
            const { error } = await supabase
                .from('deal_comps')
                .delete()
                .eq('project_id', projectId)
                .in('company_id', selectedCompanies);

            if (error) throw error;
        }, {
            successMessage: "Companies removed from project",
            errorMessage: "Error removing companies",
            loadingMessage: "Removing companies"
        });

        setRemoveLoading(LoadingState.IDLE);
        close();
        onRemoveSuccess();
    };

    return (
        <>
            <Button onClick={open} color="red" disabled={selectedCompanies.length === 0} variant='subtle'>
                Remove Selected
            </Button>

            <Modal opened={opened} onClose={close} title="Remove Companies">
                <Text>Are you sure you want to remove {selectedCompanies.length} companies from this project?</Text>
                <Group justify="flex-end" mt="md">
                    <Button variant="outline" onClick={close}>Cancel</Button>
                    <Button 
                    
                        color="red" 
                        onClick={handleRemove}
                        loading={removeLoading === LoadingState.LOADING}
                    >
                        Remove
                    </Button>
                </Group>
            </Modal>
        </>
    );
}
