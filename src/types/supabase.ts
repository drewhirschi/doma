import { Database as DatabaseGenerated, Json } from './supabase-generated'

import { MergeDeep } from 'type-fest'
import { ScaledPosition } from 'react-pdf-highlighter'

export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Tables: {
        annotation: {
          Row: {
            position: ScaledPosition | Json
          }
        }
      }
    }
  }
>