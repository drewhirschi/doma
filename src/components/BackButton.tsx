import { Button, ButtonProps } from "@mantine/core";

import { IconChevronLeft } from "@tabler/icons-react";
import Link from "next/link";

export function BackButton(props: ButtonProps & { href: string }) {

    return (
        <Button leftSection={<IconChevronLeft size={14} />} variant="subtle" component={Link} {...props}>
            Back
        </Button>
    )
}