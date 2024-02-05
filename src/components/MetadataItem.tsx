import React from 'react';
import { Text } from '@mantine/core';

export function MetadataItem({header, text}: {header:string,text:string})  {
    return (
        <div>
            <Text fw={700}>{header}</Text>
            <Text c="dimmed" size="sm">{text}</Text>
        </div>
    );
};

export default MetadataItem;
