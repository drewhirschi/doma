
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
      blog_article: {
        Row: {
          author: string | null
          cover_img: string | null
          created_at: string
          id: number
          md: string | null
          title: string
        }
        Insert: {
          author?: string | null
          cover_img?: string | null
          created_at?: string
          id?: number
          md?: string | null
          title: string
        }
        Update: {
          author?: string | null
          cover_img?: string | null
          created_at?: string
          id?: number
          md?: string | null
          title?: string
        }
        Relationships: []
      }
      cmp_logos: {
        Row: {
          alt: string | null
          cmp_id: number
          created_at: string
          path: string
          url: string
        }
        Insert: {
          alt?: string | null
          cmp_id: number
          created_at?: string
          path: string
          url: string
        }
        Update: {
          alt?: string | null
          cmp_id?: number
          created_at?: string
          path?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "cmp_logos_cmp_id_fkey"
            columns: ["cmp_id"]
            isOneToOne: false
            referencedRelation: "company_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      comp_pages: {
        Row: {
          cmp_info: string | null
          company_id: number
          created_at: string
          emb: string | null
          title: string | null
          url: string
        }
        Insert: {
          cmp_info?: string | null
          company_id: number
          created_at?: string
          emb?: string | null
          title?: string | null
          url: string
        }
        Update: {
          cmp_info?: string | null
          company_id?: number
          created_at?: string
          emb?: string | null
          title?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "comp_pages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      company_profile: {
        Row: {
          created_at: string
          description: string | null
          emb_v2: string | null
          favicon: string | null
          hq_geo: unknown | null
          hq_lat: number | null
          hq_lon: number | null
          id: number
          name: string | null
          origin: string | null
          updated_at: string
          web_summary: string | null
          web_summary_emb: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          emb_v2?: string | null
          favicon?: string | null
          hq_geo?: unknown | null
          hq_lat?: number | null
          hq_lon?: number | null
          id?: number
          name?: string | null
          origin?: string | null
          updated_at?: string
          web_summary?: string | null
          web_summary_emb?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          emb_v2?: string | null
          favicon?: string | null
          hq_geo?: unknown | null
          hq_lat?: number | null
          hq_lon?: number | null
          id?: number
          name?: string | null
          origin?: string | null
          updated_at?: string
          web_summary?: string | null
          web_summary_emb?: string | null
        }
        Relationships: []
      }
      deal_comps: {
        Row: {
          cmp_id: number
          project_id: number
        }
        Insert: {
          cmp_id: number
          project_id: number
        }
        Update: {
          cmp_id?: number
          project_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "deal_comps_cmp_id_fkey"
            columns: ["cmp_id"]
            isOneToOne: false
            referencedRelation: "company_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_comps_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ib_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ib_projects: {
        Row: {
          created_at: string
          id: number
          industry: string | null
          model_cmp: number | null
          tenant_id: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          industry?: string | null
          model_cmp?: number | null
          tenant_id?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          industry?: string | null
          model_cmp?: number | null
          tenant_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ib_projects_model_cmp_fkey"
            columns: ["model_cmp"]
            isOneToOne: false
            referencedRelation: "company_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ib_projects_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
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
          send_email_provider: string | null
          send_email_token_exp: number | null
          send_email_tokens: Json | null
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
          send_email_provider?: string | null
          send_email_token_exp?: number | null
          send_email_tokens?: Json | null
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
          send_email_provider?: string | null
          send_email_token_exp?: number | null
          send_email_tokens?: Json | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      report_sections: {
        Row: {
          content: string | null
          created_at: string
          id: number
          instruction: string | null
          is_generated: boolean
          report_id: number
          title: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: number
          instruction?: string | null
          is_generated?: boolean
          report_id: number
          title?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: number
          instruction?: string | null
          is_generated?: boolean
          report_id?: number
          title?: string | null
        }
        Relationships: []
      }
      report_template_sections: {
        Row: {
          created_at: string
          id: number
          instruction: string | null
          template_id: number | null
          title: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          instruction?: string | null
          template_id?: number | null
          title?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          instruction?: string | null
          template_id?: number | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_template_sections_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      report_templates: {
        Row: {
          created_at: string
          display_name: string | null
          id: number
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: number
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: number
        }
        Relationships: []
      }
      report_views: {
        Row: {
          created_at: string
          duration: number | null
          id: number
          parsluid: string
          report_id: number
        }
        Insert: {
          created_at?: string
          duration?: number | null
          id?: number
          parsluid: string
          report_id: number
        }
        Update: {
          created_at?: string
          duration?: number | null
          id?: number
          parsluid?: string
          report_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "report_views_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports_pdf"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          display_name: string | null
          file_path: string | null
          has_outline: boolean
          id: number
          image_queries: string[] | null
          published: boolean
          slug: string | null
          tenant_id: string | null
          topic: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          file_path?: string | null
          has_outline?: boolean
          id?: number
          image_queries?: string[] | null
          published?: boolean
          slug?: string | null
          tenant_id?: string | null
          topic?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          file_path?: string | null
          has_outline?: boolean
          id?: number
          image_queries?: string[] | null
          published?: boolean
          slug?: string | null
          tenant_id?: string | null
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      reports_pdf: {
        Row: {
          created_at: string
          display_name: string | null
          file_path: string
          id: number
          published: boolean
          slug: string | null
          tenant_id: string | null
          topic: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          file_path: string
          id?: number
          published?: boolean
          slug?: string | null
          tenant_id?: string | null
          topic?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          file_path?: string
          id?: number
          published?: boolean
          slug?: string | null
          tenant_id?: string | null
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_pdf_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      search_result: {
        Row: {
          author: string | null
          exa_id: string
          id: number
          publish_date: string | null
          report_id: number
          section_id: number | null
          summary: string | null
          text: string | null
          title: string | null
          url: string | null
        }
        Insert: {
          author?: string | null
          exa_id: string
          id?: number
          publish_date?: string | null
          report_id: number
          section_id?: number | null
          summary?: string | null
          text?: string | null
          title?: string | null
          url?: string | null
        }
        Update: {
          author?: string | null
          exa_id?: string
          id?: number
          publish_date?: string | null
          report_id?: number
          section_id?: number | null
          summary?: string | null
          text?: string | null
          title?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_result_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "report_sections"
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
      transaction_participant: {
        Row: {
          cmp_id: number
          role: string | null
          trans_id: number
        }
        Insert: {
          cmp_id: number
          role?: string | null
          trans_id: number
        }
        Update: {
          cmp_id?: number
          role?: string | null
          trans_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "transaction_participant_cmp_id_fkey"
            columns: ["cmp_id"]
            isOneToOne: false
            referencedRelation: "company_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_participant_trans_id_fkey"
            columns: ["trans_id"]
            isOneToOne: false
            referencedRelation: "transaction_search_res"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_search_res: {
        Row: {
          article_date: string | null
          buyer_name: string | null
          created_at: string
          date: string | null
          description: string | null
          emb: string | null
          full_query: string | null
          id: number
          linked: boolean
          others: Json | null
          query: string | null
          query_emb: string | null
          reason: string | null
          seller_details: string | null
          seller_name: string | null
          snippet: string | null
          title: string | null
          url: string
        }
        Insert: {
          article_date?: string | null
          buyer_name?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          emb?: string | null
          full_query?: string | null
          id?: number
          linked?: boolean
          others?: Json | null
          query?: string | null
          query_emb?: string | null
          reason?: string | null
          seller_details?: string | null
          seller_name?: string | null
          snippet?: string | null
          title?: string | null
          url: string
        }
        Update: {
          article_date?: string | null
          buyer_name?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          emb?: string | null
          full_query?: string | null
          id?: number
          linked?: boolean
          others?: Json | null
          query?: string | null
          query_emb?: string | null
          reason?: string | null
          seller_details?: string | null
          seller_name?: string | null
          snippet?: string | null
          title?: string | null
          url?: string
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
      extract_origin: {
        Args: {
          url: string
        }
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
      match_and_nearby_cmp: {
        Args: {
          query_embedding: string
          lat: number
          long: number
          distance: number
          match_count: number
          apply_distance_filter: boolean
        }
        Returns: {
          id: number
          name: string
          origin: string
          similarity: number
          geo_distance: number
        }[]
      }
      match_cmp_adaptive: {
        Args: {
          query_embedding: string
          match_count: number
        }
        Returns: {
          created_at: string
          description: string | null
          emb_v2: string | null
          favicon: string | null
          hq_geo: unknown | null
          hq_lat: number | null
          hq_lon: number | null
          id: number
          name: string | null
          origin: string | null
          updated_at: string
          web_summary: string | null
          web_summary_emb: string | null
        }[]
      }
      match_cmp_pages: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
          company_id: number
        }
        Returns: {
          url: string
          similarity: number
        }[]
      }
      match_cmp_summaries:
      | {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: number
          name: string
          website: string
          similarity: number
        }[]
      }
      | {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
          company_id: number
        }
        Returns: {
          id: number
          name: string
          website: string
          similarity: number
        }[]
      }
      match_documents: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          content: string
          similarity: number
        }[]
      }
      match_transactions_seller: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
        }
        Returns: {
          transaction_id: number
          seller_name: string
          transaction_title: string
          similarity: number
        }[]
      }
      nearby_relevant_cmp:
      | {
        Args: {
          lat: number
          long: number
        }
        Returns: {
          id: number
          name: string
          lat: number
          long: number
          dist_meters: number
        }[]
      }
      | {
        Args: {
          lat: number
          long: number
          distance: number
          relevant_company_ids: number[]
        }
        Returns: {
          id: number
          name: string
          lat: number
          long: number
          dist_meters: number
        }[]
      }
      | {
        Args: {
          lat: number
          long: number
          relevant_company_ids: number[]
        }
        Returns: {
          id: number
          name: string
          lat: number
          long: number
          dist_meters: number
        }[]
      }
      random_color: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      sub_vector: {
        Args: {
          v: string
          dimensions: number
        }
        Returns: string
      }
      truncate_vector: {
        Args: {
          vector_column: string
          new_dim: number
        }
        Returns: string
      }
      user_tenant_owns_contract: {
        Args: {
          contract_id: string
        }
        Returns: boolean
      }
      user_tenant_owns_report: {
        Args: {
          report_id: number
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
