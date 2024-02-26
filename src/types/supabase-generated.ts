export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      annotation: {
        Row: {
          contract_id: string
          created_at: string
          id: string
          parslet_id: string
          position: Json
          tenant_id: string
          text: string
        }
        Insert: {
          contract_id: string
          created_at?: string
          id?: string
          parslet_id: string
          position: Json
          tenant_id?: string
          text: string
        }
        Update: {
          contract_id?: string
          created_at?: string
          id?: string
          parslet_id?: string
          position?: Json
          tenant_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "annotation_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annotation_parslet_id_fkey"
            columns: ["parslet_id"]
            isOneToOne: false
            referencedRelation: "parslet"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annotation_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          }
        ]
      }
      contract: {
        Row: {
          assigned_to: string | null
          completed: boolean
          created_at: string
          description: string | null
          display_name: string | null
          id: string
          in_scope: boolean
          linified: boolean
          name: string
          npages: number
          path_tokens: string[]
          project_id: string
          tag: string | null
          tenant_id: string
        }
        Insert: {
          assigned_to?: string | null
          completed?: boolean
          created_at?: string
          description?: string | null
          display_name?: string | null
          id?: string
          in_scope?: boolean
          linified?: boolean
          name: string
          npages?: number
          path_tokens?: string[]
          project_id: string
          tag?: string | null
          tenant_id: string
        }
        Update: {
          assigned_to?: string | null
          completed?: boolean
          created_at?: string
          description?: string | null
          display_name?: string | null
          id?: string
          in_scope?: boolean
          linified?: boolean
          name?: string
          npages?: number
          path_tokens?: string[]
          project_id?: string
          tag?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          }
        ]
      }
      contract_line: {
        Row: {
          contract_id: string
          id: number
          ntokens: number
          page: number
          page_height: number
          page_width: number
          text: string
          x_scale: number
          x1: number
          x2: number
          y1: number
          y2: number
        }
        Insert: {
          contract_id: string
          id: number
          ntokens?: number
          page?: number
          page_height?: number
          page_width?: number
          text?: string
          x_scale?: number
          x1?: number
          x2?: number
          y1?: number
          y2?: number
        }
        Update: {
          contract_id?: string
          id?: number
          ntokens?: number
          page?: number
          page_height?: number
          page_width?: number
          text?: string
          x_scale?: number
          x1?: number
          x2?: number
          y1?: number
          y2?: number
        }
        Relationships: [
          {
            foreignKeyName: "contract_line_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract"
            referencedColumns: ["id"]
          }
        ]
      }
      contract_note: {
        Row: {
          content: string
          contract_id: string
          created_at: string
          parslet_id: string
        }
        Insert: {
          content?: string
          contract_id: string
          created_at?: string
          parslet_id: string
        }
        Update: {
          content?: string
          contract_id?: string
          created_at?: string
          parslet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_note_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_note_parslet_id_fkey"
            columns: ["parslet_id"]
            isOneToOne: false
            referencedRelation: "parslet"
            referencedColumns: ["id"]
          }
        ]
      }
      extract_jobs: {
        Row: {
          contract_id: string
          parslet_id: string
          status: string
          updated_at: string
        }
        Insert: {
          contract_id?: string
          parslet_id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          contract_id?: string
          parslet_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_extract_jobs_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_extract_jobs_extractor_id_fkey"
            columns: ["parslet_id"]
            isOneToOne: false
            referencedRelation: "parslet"
            referencedColumns: ["id"]
          }
        ]
      }
      extracted_information: {
        Row: {
          contract_id: string
          created_at: string
          data: Json
          id: string
          parslet_id: string
        }
        Insert: {
          contract_id: string
          created_at?: string
          data: Json
          id?: string
          parslet_id: string
        }
        Update: {
          contract_id?: string
          created_at?: string
          data?: Json
          id?: string
          parslet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "extracted_information_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extracted_information_parslet_id_fkey"
            columns: ["parslet_id"]
            isOneToOne: false
            referencedRelation: "parslet"
            referencedColumns: ["id"]
          }
        ]
      }
      formatted_info: {
        Row: {
          contract_id: string
          created_at: string
          data: Json | null
          id: string
          type: string
        }
        Insert: {
          contract_id?: string
          created_at?: string
          data?: Json | null
          id?: string
          type?: string
        }
        Update: {
          contract_id?: string
          created_at?: string
          data?: Json | null
          id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_formats_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_formats_type_fkey"
            columns: ["type"]
            isOneToOne: false
            referencedRelation: "formatters"
            referencedColumns: ["key"]
          }
        ]
      }
      formatters: {
        Row: {
          display_name: string
          key: string
        }
        Insert: {
          display_name: string
          key?: string
        }
        Update: {
          display_name?: string
          key?: string
        }
        Relationships: []
      }
      line_ref: {
        Row: {
          contract_id: string
          extracted_info_id: string
          line_id: number
        }
        Insert: {
          contract_id: string
          extracted_info_id: string
          line_id: number
        }
        Update: {
          contract_id?: string
          extracted_info_id?: string
          line_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "line_ref_contract_line_fkey"
            columns: ["contract_id", "line_id"]
            isOneToOne: false
            referencedRelation: "contract_line"
            referencedColumns: ["contract_id", "id"]
          },
          {
            foreignKeyName: "line_ref_extracted_info_id_fkey"
            columns: ["extracted_info_id"]
            isOneToOne: false
            referencedRelation: "extracted_information"
            referencedColumns: ["id"]
          }
        ]
      }
      parslet: {
        Row: {
          created_at: string
          display_name: string
          examples: string[]
          id: string
          instruction: string
          key: string
          order: number
          schema: string | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string
          examples?: string[]
          id?: string
          instruction?: string
          key?: string
          order?: number
          schema?: string | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          examples?: string[]
          id?: string
          instruction?: string
          key?: string
          order?: number
          schema?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parslet_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          }
        ]
      }
      profile: {
        Row: {
          avatar_url: string | null
          color: string
          created_at: string
          display_name: string | null
          email: string
          email_confirmed_at: string | null
          id: string
          invited_at: string | null
          tenant_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          color?: string
          created_at?: string
          display_name?: string | null
          email: string
          email_confirmed_at?: string | null
          id: string
          invited_at?: string | null
          tenant_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          color?: string
          created_at?: string
          display_name?: string | null
          email?: string
          email_confirmed_at?: string | null
          id?: string
          invited_at?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          }
        ]
      }
      project: {
        Row: {
          client: string
          counterparty: string
          created_at: string
          deal_structure: string
          display_name: string | null
          id: string
          is_active: boolean
          phase_deadline: string
          target: string[]
          tenant_id: string
        }
        Insert: {
          client: string
          counterparty: string
          created_at?: string
          deal_structure: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          phase_deadline: string
          target: string[]
          tenant_id: string
        }
        Update: {
          client?: string
          counterparty?: string
          created_at?: string
          deal_structure?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          phase_deadline?: string
          target?: string[]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          }
        ]
      }
      project_assignment: {
        Row: {
          profile_id: string
          project_id: string
        }
        Insert: {
          profile_id: string
          project_id: string
        }
        Update: {
          profile_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_assignment_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_assignment_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          }
        ]
      }
      tenant: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_profile_project_ids: {
        Args: Record<PropertyKey, never>
        Returns: {
          project_id: string
        }[]
      }
      current_user_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_random_key: {
        Args: {
          prefix: string
          key_length: number
        }
        Returns: string
      }
      get_user_tenant_id: {
        Args: {
          profile_id: string
        }
        Returns: string
      }
      get_users_in_project: {
        Args: {
          project_id_param: string
        }
        Returns: {
          profile_id: string
        }[]
      }
      is_user_assigned_to_project: {
        Args: {
          project_id_param: string
        }
        Returns: boolean
      }
      random_color: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
