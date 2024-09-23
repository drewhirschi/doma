import { Database as DatabaseGenerated, Json } from './supabase-generated'

import { MergeDeep } from 'type-fest'
import { MicrosoftTokenResponse } from '@/backend/oauth/microsoft'

export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Tables: {
       
      }
    }
  }
>


