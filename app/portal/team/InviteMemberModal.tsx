import { Button, Modal, Select, TextInput } from '@mantine/core';

import { TeamRoleSelect } from '@/components/TeamRoleSelect';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';

export function InviteMemberModal() {
    const [opened, { open, close }] = useDisclosure(false);
   

    const form = useForm({
        initialValues: {
          email: '',
          role: 'associate',
        },
    
        validate: {
          email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
        },
      });

   

    return (
        <>
            <Modal opened={opened} onClose={close} title="Authentication">
                <form onSubmit={form.onSubmit(values => {form.reset();close()})}>
                    <TextInput
                        label="Email"
                        required
                        {...form.getInputProps('email')}
                    />
                    <TeamRoleSelect defaultValue={form.values.role} withLabel/>
                    <Button mt="sm" type="submit">Invite</Button>
                </form>
            </Modal>

            <Button onClick={open}>Invite a team member</Button>
        </>
    );
}
        
    