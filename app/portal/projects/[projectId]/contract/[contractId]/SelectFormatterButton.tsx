import { Box, Button, Collapse, Text } from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

import { FormatterWithInfo } from "@/types/complex";
import { useDisclosure } from "@mantine/hooks";

export function SelectFormatterButton(props: { formatter: FormatterWithInfo, handleClick: (id: number) => void }) {

    const [opened, { toggle }] = useDisclosure(false);

    const { formatter, handleClick } = props

    const buttonProps = {
        variant: "subtle",
        // color: "gray",
        fullWidth: true,
        justify: "start"

    }

    let newItemId = 0
    if (formatter.hitems) {
       newItemId = formatter.formatted_info.length == 0 ? 0 : Math.max(...formatter.formatted_info.map(fi => fi.id)) + 1
    }

    return <Box>
        <Button.Group maw={220}>

            <Button
                {...buttonProps}


                onClick={() => handleClick(newItemId)}
            >{formatter.display_name}</Button>
            {formatter.hitems && formatter.formatted_info.length > 0 &&

                <Button variant="subtle" onClick={toggle}>{opened ? <IconChevronUp /> : <IconChevronDown />}</Button>


                

            }
        </Button.Group>
        <Collapse in={opened}>
            {formatter.formatted_info.map((fi, j) => (
                <Button
                    {...buttonProps}
                    key={j}
                    onClick={() => handleClick(fi.id)}
                    ml={20}
                >
                    {`Item ${j + 1}`}
                </Button>
            ))}
        </Collapse>
    </Box>
}