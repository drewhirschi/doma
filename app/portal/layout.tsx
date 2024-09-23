import { Flex, ScrollArea } from '@mantine/core';

import { NavBar } from './navbar';
import classnames from "./layout.module.css"

export default async function Home({ children, params }: {
    children: React.ReactNode
    params: { team: string }
}) {



    return (
        <Flex
            w={"100%"}
            direction={"row"}
            wrap={"nowrap"}
            h={"100vh"}
        >
            <NavBar />
            <ScrollArea h={"100%"} className={classnames.content}>
                {children}
            </ScrollArea>
        </Flex>

    )
}
