import { AgreementInfoFormatResponse, IncorporatedAgreementsShape, TermFormatResponse, } from "@/types/formattersTypes"
import { Anchor, Badge, Button, Group, InputVariant, MantineComponent, Select, SelectProps, SelectStylesNames, SimpleGrid, Stack, Text, Textarea, Title } from "@mantine/core"
import { useEffect, useState } from "react"

import { AnnotationsList } from "./AnnotationsList"
import { BoolSelect } from "../BoolSelect"
import { DatePickerInput } from "@mantine/dates"
import { ViewProps } from "./FormattedItemSingle"
import { notifications } from "@mantine/notifications"
import { useForm } from '@mantine/form';
import { z } from "zod"

export function FormattedIncorporatedAgreements({ form, afterChange: onChange }: ViewProps<z.infer<typeof IncorporatedAgreementsShape>>) {


    return (
        <Stack gap={4}>
            <Textarea
                autosize
                {...form.getInputProps('name')}
                value={form.getInputProps(`name`).value ?? ""}

            />


      

        </Stack>

    )
}