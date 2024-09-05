'use client';

import React, { useState } from 'react';

import { Table } from '@mantine/core';

interface IViewershipStatsProps {
    views: ReportView_SB[]
}

export function ViewershipStats(props: IViewershipStatsProps) {

   const viewsGrouped = props.views.filter(v => v.duration != null)
       .reduce((acc, curr) => {
           const key = curr.parsluid;
           if (!acc.has(key)) {
               acc.set(key,0);
            }
            acc.set(key, (acc.get(key) ?? 0) + (curr.duration ?? 0));
           return acc;
       }, new Map<string, number>());

    const rows = Array.from(viewsGrouped.entries()).map(([key, seconds]) => (
        <Table.Tr key={key}>
            <Table.Td>{key}</Table.Td>
            <Table.Td>{secondsToHHMMSS(seconds)}</Table.Td>
            
        </Table.Tr>
    ));


       return (
       <div>
           <Table>
               <Table.Thead>
                   <Table.Tr>
                       <Table.Th>Id</Table.Th>
                       <Table.Th>Time viewed</Table.Th>
                      
                   </Table.Tr>
               </Table.Thead>
               <Table.Tbody>{rows}</Table.Tbody>
           </Table>
       </div>
   );
}


function secondsToHHMMSS(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}:${minutes}:${remainingSeconds}`;
  }