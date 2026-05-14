export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      compliance_calendar: {
        Row: {
          applicable_to: string | null
          category: string
          compliance: string
          created_at: string | null
          due_date: string
          due_date_sort: string | null
          form_name: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          penalty: string | null
          priority: string | null
          regulation: string | null
          updated_at: string | null
        }
        Insert: {
          applicable_to?: string | null
          category: string
          compliance: string
          created_at?: string | null
          due_date: string
          due_date_sort?: string | null
          form_name?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          penalty?: string | null
          priority?: string | null
          regulation?: string | null
          updated_at?: string | null
        }
        Update: {
          applicable_to?: string | null
          category?: string
          compliance?: string
          created_at?: string | null
          due_date?: string
          due_date_sort?: string | null
          form_name?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          penalty?: string | null
          priority?: string | null
          regulation?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      compliance_entries: {
        Row: {
          applicable_to: string
          compliance_title: string
          contributor_email: string | null
          contributor_name: string | null
          contributor_profession: string | null
          correction_count: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          display_order: number | null
          due_date: string
          form_name: string
          frequency: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          official_link: string | null
          penalty: string | null
          regulation_reference: string | null
          regulator: string
          updated_at: string | null
        }
        Insert: {
          applicable_to: string
          compliance_title: string
          contributor_email?: string | null
          contributor_name?: string | null
          contributor_profession?: string | null
          correction_count?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          due_date: string
          form_name: string
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          official_link?: string | null
          penalty?: string | null
          regulation_reference?: string | null
          regulator: string
          updated_at?: string | null
        }
        Update: {
          applicable_to?: string
          compliance_title?: string
          contributor_email?: string | null
          contributor_name?: string | null
          contributor_profession?: string | null
          correction_count?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          due_date?: string
          form_name?: string
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          official_link?: string | null
          penalty?: string | null
          regulation_reference?: string | null
          regulator?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      compliance_suggestions: {
        Row: {
          admin_note: string | null
          applicable_to: string | null
          compliance_entry_id: string | null
          compliance_title: string | null
          contribution_count: number | null
          created_at: string | null
          due_date: string | null
          error_description: string | null
          error_field: string | null
          form_name: string | null
          id: string
          penalty: string | null
          regulation_reference: string | null
          regulator: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          suggested_correction: string | null
          suggestion_type: string
          user_city: string | null
          user_email: string
          user_linkedin: string | null
          user_name: string | null
          user_profession: string | null
        }
        Insert: {
          admin_note?: string | null
          applicable_to?: string | null
          compliance_entry_id?: string | null
          compliance_title?: string | null
          contribution_count?: number | null
          created_at?: string | null
          due_date?: string | null
          error_description?: string | null
          error_field?: string | null
          form_name?: string | null
          id?: string
          penalty?: string | null
          regulation_reference?: string | null
          regulator?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          suggested_correction?: string | null
          suggestion_type: string
          user_city?: string | null
          user_email: string
          user_linkedin?: string | null
          user_name?: string | null
          user_profession?: string | null
        }
        Update: {
          admin_note?: string | null
          applicable_to?: string | null
          compliance_entry_id?: string | null
          compliance_title?: string | null
          contribution_count?: number | null
          created_at?: string | null
          due_date?: string | null
          error_description?: string | null
          error_field?: string | null
          form_name?: string | null
          id?: string
          penalty?: string | null
          regulation_reference?: string | null
          regulator?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          suggested_correction?: string | null
          suggestion_type?: string
          user_city?: string | null
          user_email?: string
          user_linkedin?: string | null
          user_name?: string | null
          user_profession?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_suggestions_compliance_entry_id_fkey"
            columns: ["compliance_entry_id"]
            isOneToOne: false
            referencedRelation: "compliance_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          attempts: number | null
          ip: string
          window_start: string | null
        }
        Insert: {
          attempts?: number | null
          ip: string
          window_start?: string | null
        }
        Update: {
          attempts?: number | null
          ip?: string
          window_start?: string | null
        }
        Relationships: []
      }
      newsletter_campaigns: {
        Row: {
          content: string
          content_type: string | null
          created_at: string | null
          failed_count: number | null
          id: string
          preview_text: string | null
          rendered_html: string | null
          sent_by: string | null
          sent_count: number | null
          subject: string
          total_recipients: number | null
        }
        Insert: {
          content: string
          content_type?: string | null
          created_at?: string | null
          failed_count?: number | null
          id?: string
          preview_text?: string | null
          rendered_html?: string | null
          sent_by?: string | null
          sent_count?: number | null
          subject: string
          total_recipients?: number | null
        }
        Update: {
          content?: string
          content_type?: string | null
          created_at?: string | null
          failed_count?: number | null
          id?: string
          preview_text?: string | null
          rendered_html?: string | null
          sent_by?: string | null
          sent_count?: number | null
          subject?: string
          total_recipients?: number | null
        }
        Relationships: []
      }
      newsletter_recipients: {
        Row: {
          campaign_id: string | null
          clicked_at: string | null
          email: string
          error_message: string | null
          id: string
          opened_at: string | null
          resend_email_id: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          campaign_id?: string | null
          clicked_at?: string | null
          email: string
          error_message?: string | null
          id?: string
          opened_at?: string | null
          resend_email_id?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          campaign_id?: string | null
          clicked_at?: string | null
          email?: string
          error_message?: string | null
          id?: string
          opened_at?: string | null
          resend_email_id?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "newsletter_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      repo_rate_history: {
        Row: {
          change_amount: string | null
          change_direction: string | null
          created_at: string | null
          id: string
          meeting_date: string
          meeting_name: string
          msf_rate: string | null
          notes: string | null
          repo_rate: string
          sdf_rate: string | null
          stance: string | null
        }
        Insert: {
          change_amount?: string | null
          change_direction?: string | null
          created_at?: string | null
          id?: string
          meeting_date: string
          meeting_name: string
          msf_rate?: string | null
          notes?: string | null
          repo_rate: string
          sdf_rate?: string | null
          stance?: string | null
        }
        Update: {
          change_amount?: string | null
          change_direction?: string | null
          created_at?: string | null
          id?: string
          meeting_date?: string
          meeting_name?: string
          msf_rate?: string | null
          notes?: string | null
          repo_rate?: string
          sdf_rate?: string | null
          stance?: string | null
        }
        Relationships: []
      }
      scheduled_newsletters: {
        Row: {
          body: string
          created_at: string | null
          id: string
          preview_text: string | null
          scheduled_at: string
          status: string | null
          subject: string
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          preview_text?: string | null
          scheduled_at: string
          status?: string | null
          subject: string
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          preview_text?: string | null
          scheduled_at?: string
          status?: string | null
          subject?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          description: string | null
          key: string
          label: string | null
          updated_at: string | null
          value: string | null
        }
        Insert: {
          description?: string | null
          key: string
          label?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          description?: string | null
          key?: string
          label?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean | null
          subscribed_at: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      updates: {
        Row: {
          category: string
          content: string | null
          created_at: string | null
          effective_date: string | null
          featured_image_url: string | null
          id: string
          impact_level: string | null
          is_featured: boolean | null
          key_change: string | null
          key_changes: Json | null
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          source_name: string | null
          source_url: string | null
          sources: Json | null
          summary: string
          tags: string[] | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          category: string
          content?: string | null
          created_at?: string | null
          effective_date?: string | null
          featured_image_url?: string | null
          id?: string
          impact_level?: string | null
          is_featured?: boolean | null
          key_change?: string | null
          key_changes?: Json | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          source_name?: string | null
          source_url?: string | null
          sources?: Json | null
          summary: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string | null
          effective_date?: string | null
          featured_image_url?: string | null
          id?: string
          impact_level?: string | null
          is_featured?: boolean | null
          key_change?: string | null
          key_changes?: Json | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          source_name?: string | null
          source_url?: string | null
          sources?: Json | null
          summary?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
