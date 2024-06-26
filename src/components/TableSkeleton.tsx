// components/TableSkeleton.tsx

import { Skeleton, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';

import React from 'react';

interface TableSkeletonProps {
    numColumns: number;
    numRows: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ numColumns, numRows }) => {
    const columns = Array.from({ length: numColumns }, (_, index) => (
        <TableTh key={index}>
            <Skeleton height={20} width="70%" radius="md" />
        </TableTh>
    ));

    const rows = Array.from({ length: numRows }, (_, rowIndex) => (
        <TableTr key={rowIndex}>
            {/* {Array.from({ length: numColumns }, (_, colIndex) => ( */}
                <TableTd colSpan={numColumns} >
                    <Skeleton h={40} width="100%" radius="md" />
                </TableTd>
            {/* ))} */}
        </TableTr>
    ));

    return (
        <Table mt={"xl"}>
            <TableThead>
                <TableTr>
                    {columns}
                </TableTr>
            </TableThead>
            <TableTbody>
                {rows}
            </TableTbody>
        </Table>
    );
};

export default TableSkeleton;
