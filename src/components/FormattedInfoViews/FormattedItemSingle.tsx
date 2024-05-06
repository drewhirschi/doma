import { UseFormReturnType, useForm } from '@mantine/form';
import { useEffect, useState } from "react";

import { AnnotationsList } from "./AnnotationsList";
import { browserClient } from '@/supabase/BrowerClients';
import { notifications } from "@mantine/notifications";
import { useDebouncedCallback } from "use-debounce";

export interface ViewProps<T> {
    form: UseFormReturnType<T>
    afterChange: () => void
}

export interface FormatterViewWrapperProps {
    info: FormattedInfo_SB<any>[]
    handleSave: (infoId: number, data: any) => Promise<void>
    annotations: Annotation_SB[]
    removeAnnotation: (id: string) => void
    ItemView: React.ComponentType<ViewProps<any>>
    formatterKey: string
    contractId: string
}

export function FormattedInfoView({ info, handleSave, annotations, removeAnnotation, ItemView, formatterKey, contractId }: FormatterViewWrapperProps) {

    const form = useForm({
        initialValues:  info[0]?.data,
    })

    useEffect(() => {
        form.setValues(info[0]?.data)
    }, [JSON.stringify(info[0]?.data)])





    const debouncedSave = useDebouncedCallback(async () => {
        await handleSave(0, form.values)
    }, 600)


    async function handleChildFormChange() {
        try {
            debouncedSave()
        } catch (e) {
            console.error(e)
            notifications.show({
                title: "Failed to save",
                message: "An error occurred while saving the data",
                color: "red"
            })
        }
    }

    if (info[0] === undefined) {
        return null
    }


    return (
        <>
            <AnnotationsList
                annotations={annotations}
                removeAnnotation={removeAnnotation}
            />
            <form onChange={handleChildFormChange} id={formatterKey + info[0].id} >
                {<ItemView
                    form={form}
                    afterChange={handleChildFormChange} />}
            </form>
        </>

    )
}