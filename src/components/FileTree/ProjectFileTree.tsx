import { Box } from "@mantine/core";
import { browserClient } from "@/supabase/BrowerClients";
import { useState } from "react";

interface Props {
  projectId: string;
  files: File[];
  filesSegment: number;
  setFilesSegment: (segment: number) => void;
  debouncedHandleSearch: () => void;
  updatePage: () => void;
  searchParams: URLSearchParams;
  pathname: string;
  replace: (path: string) => void;
}

interface File {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

// Rest of the code...


export default function ProjectFileTree({ projectId, files, filesSegment, setFilesSegment, debouncedHandleSearch, updatePage, searchParams, pathname, replace }: Props) {


    const supabase = browserClient()

    const [viewState, setViewState] = useState<'loading' | "success"> ('loading');

    return ( 
        <Box>

            
        </Box>
    )
}