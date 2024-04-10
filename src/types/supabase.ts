import { Database as DatabaseGenerated, Json as GeneratedJson } from './supabase-generated'

import { MergeDeep } from 'type-fest'
import { ScaledPosition } from '@/components/PdfViewer/types'

export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Tables: {
        annotation: {
          Row: {
            position: ScaledPosition
          }
        },
        project: {
          Row: {
            profile: Profile_SB[]
          }
        }
      }
    }
  }
>


