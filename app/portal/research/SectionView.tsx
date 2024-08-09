'use client';

import { Divider, Title } from '@mantine/core';
import React, { useState } from 'react';

import { ISection } from './types';
import Markdown from 'react-markdown';

interface ISectionViewProps {
    section: ISection
}

export  function SectionView({section}: ISectionViewProps) {
   const [state, setState] = useState();
   return (
       <div>
           <Title>{section.name}</Title>
           <Markdown>{section.md}</Markdown>
           <Divider mb={"md"}/>
       </div>
   );
}