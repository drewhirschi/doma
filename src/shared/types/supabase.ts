import { Database as DatabaseGenerated, Json } from './supabase-generated'

import { MergeDeep } from 'type-fest'

export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Tables: {
       
      }
    }
  }
>


