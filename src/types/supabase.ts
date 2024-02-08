import { Database as DatabaseGenerated, Json } from './supabase-generated'

import { MergeDeep } from 'type-fest'
import { ScaledPosition } from '@/components/PdfViewer/types'

export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Tables: {
        annotation: {
          Row: {
            position: ScaledPosition | Json
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