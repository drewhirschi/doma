"use client"

import { Button, ButtonProps } from "@mantine/core";

import { IconChevronLeft } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type BackButtonProps = ButtonProps & ({ href: string } | { browser: true });

export function BackButton(props: BackButtonProps) {
    const router = useRouter()

    if ('browser' in props) {
        return (
            <Button
                leftSection={<IconChevronLeft size={14} />} variant="subtle"
                onClick={() => router.back()}
                {...props}>
                Back
            </Button>
        )
    }

    return (
        <Button
            component={Link}
            leftSection={<IconChevronLeft size={14} />} variant="subtle"
            {...props}>
            Back
        </Button>
    )
}