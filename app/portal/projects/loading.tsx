import { Container } from '@mantine/core';
import React from 'react';
import TableSkeleton from '@/components/TableSkeleton';

export default function Loading() {
   return (
       <Container>
          <TableSkeleton numColumns={4} numRows={5}/>
      </Container>
   );
}