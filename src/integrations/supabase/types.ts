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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_created_professionals: {
        Row: {
          admin_notes: string | null
          bio: string | null
          created_at: string
          created_by_admin: boolean | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          license_type: string
          location: string | null
          phone: string | null
          professional_license: string
          specializations: string[] | null
          updated_at: string
          verified: boolean | null
        }
        Insert: {
          admin_notes?: string | null
          bio?: string | null
          created_at?: string
          created_by_admin?: boolean | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          license_type: string
          location?: string | null
          phone?: string | null
          professional_license: string
          specializations?: string[] | null
          updated_at?: string
          verified?: boolean | null
        }
        Update: {
          admin_notes?: string | null
          bio?: string | null
          created_at?: string
          created_by_admin?: boolean | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          license_type?: string
          location?: string | null
          phone?: string | null
          professional_license?: string
          specializations?: string[] | null
          updated_at?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      admin_logs: {
        Row: {
          action: string
          affected_record_id: string | null
          affected_table: string | null
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          session_id: string | null
        }
        Insert: {
          action: string
          affected_record_id?: string | null
          affected_table?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          session_id?: string | null
        }
        Update: {
          action?: string
          affected_record_id?: string | null
          affected_table?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "admin_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          last_activity: string
          session_token: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          last_activity?: string
          session_token: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          last_activity?: string
          session_token?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          service_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          appointment_date: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          service_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          service_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      community_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_id: string
          comments_count: number | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_approved: boolean | null
          is_moderated: boolean | null
          likes_count: number | null
          title: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_approved?: boolean | null
          is_moderated?: boolean | null
          likes_count?: number | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_approved?: boolean | null
          is_moderated?: boolean | null
          likes_count?: number | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      content_moderation: {
        Row: {
          action: string
          content_id: string
          content_type: string
          created_at: string
          details: Json | null
          id: string
          moderator_session_id: string | null
          reason: string | null
        }
        Insert: {
          action: string
          content_id: string
          content_type: string
          created_at?: string
          details?: Json | null
          id?: string
          moderator_session_id?: string | null
          reason?: string | null
        }
        Update: {
          action?: string
          content_id?: string
          content_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          moderator_session_id?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_moderation_moderator_session_id_fkey"
            columns: ["moderator_session_id"]
            isOneToOne: false
            referencedRelation: "admin_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_verifications: {
        Row: {
          created_at: string
          documents_url: string[] | null
          expiry_date: string | null
          id: string
          license_type: string
          professional_license: string
          rejection_reason: string | null
          specializations: string[] | null
          updated_at: string
          user_id: string
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          documents_url?: string[] | null
          expiry_date?: string | null
          id?: string
          license_type: string
          professional_license: string
          rejection_reason?: string | null
          specializations?: string[] | null
          updated_at?: string
          user_id: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          documents_url?: string[] | null
          expiry_date?: string | null
          id?: string
          license_type?: string
          professional_license?: string
          rejection_reason?: string | null
          specializations?: string[] | null
          updated_at?: string
          user_id?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string
          id: string
          is_professional: boolean | null
          location: string | null
          phone: string | null
          professional_status: string | null
          settings: Json | null
          subscription_plan: Database["public"]["Enums"]["subscription_plan"]
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
          verified: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name: string
          id?: string
          is_professional?: boolean | null
          location?: string | null
          phone?: string | null
          professional_status?: string | null
          settings?: Json | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
          verified?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_professional?: boolean | null
          location?: string | null
          phone?: string | null
          professional_status?: string | null
          settings?: Json | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
          verified?: boolean | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string
          content_type: string
          created_at: string
          created_by: string | null
          description: string | null
          downloads_count: number | null
          file_path: string | null
          id: string
          is_premium: boolean | null
          is_published: boolean | null
          likes_count: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          category: string
          content_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          downloads_count?: number | null
          file_path?: string | null
          id?: string
          is_premium?: boolean | null
          is_published?: boolean | null
          likes_count?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          category?: string
          content_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          downloads_count?: number | null
          file_path?: string | null
          id?: string
          is_premium?: boolean | null
          is_published?: boolean | null
          likes_count?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      routines: {
        Row: {
          created_at: string
          days_of_week: number[] | null
          description: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          time_slots: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_of_week?: number[] | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          time_slots?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_of_week?: number[] | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          time_slots?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          address: string | null
          category: string
          created_at: string
          description: string | null
          email: string | null
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          name: string
          phone: string | null
          provider_id: string | null
          rating: number | null
          total_reviews: number | null
          updated_at: string
          verified: boolean | null
          website: string | null
        }
        Insert: {
          address?: string | null
          category: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name: string
          phone?: string | null
          provider_id?: string | null
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string
          phone?: string | null
          provider_id?: string | null
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          email: string
          id: string
          message: string
          name: string
          priority: string
          resolved_at: string | null
          response: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          priority?: string
          resolved_at?: string | null
          response?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          priority?: string
          resolved_at?: string | null
          response?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_data: Json | null
          achievement_type: string
          earned_at: string
          id: string
          is_viewed: boolean | null
          user_id: string
        }
        Insert: {
          achievement_data?: Json | null
          achievement_type: string
          earned_at?: string
          id?: string
          is_viewed?: boolean | null
          user_id: string
        }
        Update: {
          achievement_data?: Json | null
          achievement_type?: string
          earned_at?: string
          id?: string
          is_viewed?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          audio_feedback: boolean | null
          celebration_style: string | null
          color_scheme: string | null
          created_at: string
          focus_mode: boolean | null
          font_size: string | null
          haptic_feedback: boolean | null
          id: string
          pictogram_mode: boolean | null
          reduce_animations: boolean | null
          theme_preference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_feedback?: boolean | null
          celebration_style?: string | null
          color_scheme?: string | null
          created_at?: string
          focus_mode?: boolean | null
          font_size?: string | null
          haptic_feedback?: boolean | null
          id?: string
          pictogram_mode?: boolean | null
          reduce_animations?: boolean | null
          theme_preference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_feedback?: boolean | null
          celebration_style?: string | null
          color_scheme?: string | null
          created_at?: string
          focus_mode?: boolean | null
          font_size?: string | null
          haptic_feedback?: boolean | null
          id?: string
          pictogram_mode?: boolean | null
          reduce_animations?: boolean | null
          theme_preference?: string | null
          updated_at?: string
          user_id?: string
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
      subscription_plan: "free" | "premium" | "professional"
      user_type: "autistic" | "caregiver" | "professional"
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
    Enums: {
      subscription_plan: ["free", "premium", "professional"],
      user_type: ["autistic", "caregiver", "professional"],
    },
  },
} as const
