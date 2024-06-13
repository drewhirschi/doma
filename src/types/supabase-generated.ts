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
          formatter_item_id: number | null
          formatter_key: string | null
          id: string
          is_user: boolean
          parslet_id: string | null
          position: Json
          tenant_id: string | null
          text: string
          zextractor_id: string | null
        }
        Insert: {
          contract_id: string
          created_at?: string
          formatter_item_id?: number | null
          formatter_key?: string | null
          id?: string
          is_user?: boolean
          parslet_id?: string | null
          position: Json
          tenant_id?: string | null
          text: string
          zextractor_id?: string | null
        }
        Update: {
          contract_id?: string
          created_at?: string
          formatter_item_id?: number | null
          formatter_key?: string | null
          id?: string
          is_user?: boolean
          parslet_id?: string | null
          position?: Json
          tenant_id?: string | null
          text?: string
          zextractor_id?: string | null
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
            foreignKeyName: "annotation_formatted_info_fkey"
            columns: ["contract_id", "formatter_key", "formatter_item_id"]
            isOneToOne: false
            referencedRelation: "formatted_info"
            referencedColumns: ["contract_id", "formatter_key", "id"]
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
          },
          {
            foreignKeyName: "public_annotation_zextractor_id_fkey"
            columns: ["zextractor_id"]
            isOneToOne: false
            referencedRelation: "zuva_extractors"
            referencedColumns: ["id"]
          },
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
          summary: string | null
          tag: string | null
          target: string | null
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
          summary?: string | null
          tag?: string | null
          target?: string | null
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
          summary?: string | null
          tag?: string | null
          target?: string | null
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
          },
        ]
      }
      contract_job_queue: {
        Row: {
          contract_id: string
          created_at: string
          id: number
          job_type: string
          payload: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          contract_id: string
          created_at?: string
          id?: number
          job_type: string
          payload?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          contract_id?: string
          created_at?: string
          id?: number
          job_type?: string
          payload?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_job_queue_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract"
            referencedColumns: ["id"]
          },
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
          y: number | null
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
          y?: number | null
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
          y?: number | null
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
          },
        ]
      }
      docreqs: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string | null
          path: string | null
          project_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string | null
          path?: string | null
          project_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string | null
          path?: string | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "docreqs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
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
          },
        ]
      }
      format_jobs: {
        Row: {
          contract_id: string
          formatter_key: string
          status: string
          updated_at: string
        }
        Insert: {
          contract_id?: string
          formatter_key: string
          status?: string
          updated_at: string
        }
        Update: {
          contract_id?: string
          formatter_key?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_format_jobs_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract"
            referencedColumns: ["id"]
          },
        ]
      }
      formatted_info: {
        Row: {
          contract_id: string
          created_at: string
          data: Json | null
          formatter_key: string
          id: number
        }
        Insert: {
          contract_id?: string
          created_at?: string
          data?: Json | null
          formatter_key?: string
          id?: number
        }
        Update: {
          contract_id?: string
          created_at?: string
          data?: Json | null
          formatter_key?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "public_formats_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract"
            referencedColumns: ["id"]
          },
        ]
      }
      formatter_dependencies: {
        Row: {
          extractor_id: string
          formatter_key: string
        }
        Insert: {
          extractor_id?: string
          formatter_key: string
        }
        Update: {
          extractor_id?: string
          formatter_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_formatter_dependencies_extractor_id_fkey"
            columns: ["extractor_id"]
            isOneToOne: false
            referencedRelation: "parslet"
            referencedColumns: ["id"]
          },
        ]
      }
      formatters: {
        Row: {
          display_name: string
          hitems: boolean
          key: string
          priority: number
        }
        Insert: {
          display_name: string
          hitems?: boolean
          key?: string
          priority?: number
        }
        Update: {
          display_name?: string
          hitems?: boolean
          key?: string
          priority?: number
        }
        Relationships: []
      }
      line_ref: {
        Row: {
          contract_id: string
          extractor_key: string | null
          formatter_key: string | null
          line_id: number
        }
        Insert: {
          contract_id: string
          extractor_key?: string | null
          formatter_key?: string | null
          line_id: number
        }
        Update: {
          contract_id?: string
          extractor_key?: string | null
          formatter_key?: string | null
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
        }
        Relationships: []
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
          },
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
          target: string
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
          target: string
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
          target?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
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
          },
        ]
      }
      project_formatters: {
        Row: {
          formatter_key: string
          project_id: string
        }
        Insert: {
          formatter_key: string
          project_id?: string
        }
        Update: {
          formatter_key?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_formatters_formatter_key_fkey"
            columns: ["formatter_key"]
            isOneToOne: false
            referencedRelation: "formatters"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "project_formatters_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
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
      zuva_dependencies: {
        Row: {
          formatter_key: string
          zextractor_key: string
        }
        Insert: {
          formatter_key: string
          zextractor_key?: string
        }
        Update: {
          formatter_key?: string
          zextractor_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_zuva_dependencies_zextractor_id_fkey"
            columns: ["zextractor_key"]
            isOneToOne: false
            referencedRelation: "zuva_extractors"
            referencedColumns: ["key"]
          },
        ]
      }
      zuva_extraction_job: {
        Row: {
          contract_id: string
          file_id: string
          request_id: string
          status: string
        }
        Insert: {
          contract_id: string
          file_id: string
          request_id: string
          status: string
        }
        Update: {
          contract_id?: string
          file_id?: string
          request_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_zuva_extraction_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "zuva_file"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_zuva_extraction_job_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract"
            referencedColumns: ["id"]
          },
        ]
      }
      zuva_extractors: {
        Row: {
          display_name: string
          id: string
          key: string
        }
        Insert: {
          display_name: string
          id?: string
          key: string
        }
        Update: {
          display_name?: string
          id?: string
          key?: string
        }
        Relationships: []
      }
      zuva_file: {
        Row: {
          contract_id: string
          expiration: string
          id: string
        }
        Insert: {
          contract_id?: string
          expiration?: string
          id: string
        }
        Update: {
          contract_id?: string
          expiration?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_zuva_file_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract"
            referencedColumns: ["id"]
          },
        ]
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
      user_tenant_owns_contract: {
        Args: {
          contract_id: string
        }
        Returns: boolean
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
