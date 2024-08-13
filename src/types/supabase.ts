import { Database as DatabaseGenerated, Json } from './supabase-generated'

import { MergeDeep } from 'type-fest'
import { MicrosoftTokenResponse } from '../../app/api/v1/auth/callback/microsoft/route'
import { ScaledPosition } from '@/components/PdfViewer/types'

export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Tables: {
        profile: {
          Row: {
            send_email_tokens: MicrosoftTokenResponse | Json
          }
        },
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


