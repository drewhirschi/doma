"use client"

import { Box, useMantineColorScheme, useMantineTheme } from '@mantine/core';

import React from "react";

export const Meteors = ({
    number = 5, // default number of meteors
}: {
    number?: number;
}) => {
    const colors = useMantineColorScheme()
    const theme = useMantineTheme()
    const meteors = new Array(number).fill(null);
    return (
        <Box className="relative w-full h-screen">
            {meteors.map((_, idx) => (
                <Box
                    key={"meteor" + idx}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: `${Math.floor(Math.random() * (400 - -400) + -400)}px`,
                        height: '2px',
                        width: '2px',
                        borderRadius: theme.radius.xl,
                        backgroundColor: theme.colors.dark[5],
                        boxShadow: `0 0 2px ${theme.colors.dark[3]}`,
                        transform: 'rotate(215deg)',
                        animationName: 'meteorMove',
                        animationTimingFunction: 'linear',
                        animationIterationCount: 'infinite',
                        animationDelay: `${Math.random() * (0.8 - 0.2) + 0.2}s`,
                        animationDuration: `${Math.floor(Math.random() * (10 - 2) + 2)}s`,
                    }}
                />
            ))}
        </Box>
    );
};
