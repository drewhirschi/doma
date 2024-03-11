"use client"

import { Button, ButtonProps } from "@mantine/core";

import { IconChevronLeft } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function BackButton(props: ButtonProps & { href: string }) {
    const router = useRouter()
    return (
        <Button
            component={Link}
            leftSection={<IconChevronLeft size={14} />} variant="subtle"
            // onClick={() => router.back()}
            {...props}>
            Back
        </Button>
    )
}