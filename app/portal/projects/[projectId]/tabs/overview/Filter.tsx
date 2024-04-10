"use client"

import { Button, Popover, Select, Text, TextInput } from '@mantine/core';
import { useEffect, useState } from 'react';

import { browserClient } from '@/supabase/BrowerClients';
import { getFormatterShape } from '@/shared/getFormatterShape';
import { useForm } from '@mantine/form';

interface Props {

    projectId: string
}


export function FilterPopover(props: Props) {

    // const [formatterKey, setFormatterKey] = useState(null)
    // const [field, setField] = useState(null)
    // const [operator, setOperator] = useState<"<" | ">" | "=" | null>(null)
    const form = useForm({
        initialValues: {
            formatterKey: '',
            field: "",
        },


    });
    const [formatters, setFormatters] = useState<Formatter_SB[]>([])

    const sb = browserClient()

    useEffect(() => {
        sb.from("formatters").select("*").order("priority").then(({ data, error }) => {
            if (error) {
                console.error(error)
                return
            }

            setFormatters(data)
        })


    }, [])

    console.log(getFormatterShape(form.values.formatterKey).shape)

    return (
        <Popover width={300} trapFocus position="bottom" withArrow shadow="md" closeOnClickOutside={false}>
            <Popover.Target>
                <Button>Filter</Button>
            </Popover.Target>
            <Popover.Dropdown>
                <Select
                {...form.getInputProps('formatterKey')}
                    searchable
                    label="Topic"
                    placeholder="Pick value"
                    data={formatters.map((f) => ({ value: f.key, label: f.display_name }))}
                    size="xs"
                />
                <Select
                    searchable
                    label="Field"
                    placeholder="Pick value"
                    data={Object.keys(getFormatterShape(form.values.formatterKey).shape)}
                    size="xs"
                    disabled={!form.values.formatterKey}
                />
                <Select
                    searchable
                    label="Operator"
                    placeholder="Pick value"
                    data={["<", ">", "="]}
                    size="xs"
                />
                <TextInput
                size='xs'
                />


            </Popover.Dropdown>
        </Popover>
    );
}