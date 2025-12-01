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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      about_content: {
        Row: {
          achievements_json: Json
          bio_content: string
          bio_image_url: string | null
          bio_title: string
          created_at: string | null
          hero_description: string
          hero_title_line1: string
          hero_title_line2: string
          id: string
          updated_at: string | null
          values_json: Json
        }
        Insert: {
          achievements_json?: Json
          bio_content?: string
          bio_image_url?: string | null
          bio_title?: string
          created_at?: string | null
          hero_description?: string
          hero_title_line1?: string
          hero_title_line2?: string
          id?: string
          updated_at?: string | null
          values_json?: Json
        }
        Update: {
          achievements_json?: Json
          bio_content?: string
          bio_image_url?: string | null
          bio_title?: string
          created_at?: string | null
          hero_description?: string
          hero_title_line1?: string
          hero_title_line2?: string
          id?: string
          updated_at?: string | null
          values_json?: Json
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          admin_email: string
          created_at: string
          id: string
          notify_on_new_user: boolean | null
        }
        Insert: {
          admin_email: string
          created_at?: string
          id?: string
          notify_on_new_user?: boolean | null
        }
        Update: {
          admin_email?: string
          created_at?: string
          id?: string
          notify_on_new_user?: boolean | null
        }
        Relationships: []
      }
      contact_content: {
        Row: {
          created_at: string | null
          email_addresses: string
          hero_description: string
          hero_title_line1: string
          hero_title_line2: string
          id: string
          office_address: string
          office_hours: string
          phone_numbers: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email_addresses?: string
          hero_description?: string
          hero_title_line1?: string
          hero_title_line2?: string
          id?: string
          office_address?: string
          office_hours?: string
          phone_numbers?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email_addresses?: string
          hero_description?: string
          hero_title_line1?: string
          hero_title_line2?: string
          id?: string
          office_address?: string
          office_hours?: string
          phone_numbers?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      development_areas: {
        Row: {
          created_at: string | null
          description: string
          display_order: number
          icon_name: string
          id: string
          is_active: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          display_order?: number
          icon_name: string
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          display_order?: number
          icon_name?: string
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      footer_content: {
        Row: {
          address: string
          copyright_text: string
          created_at: string | null
          email: string
          facebook_url: string | null
          id: string
          instagram_url: string | null
          phone: string
          site_description: string
          site_name: string
          tagline: string
          twitter_url: string | null
          updated_at: string | null
          youtube_url: string | null
        }
        Insert: {
          address?: string
          copyright_text?: string
          created_at?: string | null
          email?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          phone?: string
          site_description?: string
          site_name?: string
          tagline?: string
          twitter_url?: string | null
          updated_at?: string | null
          youtube_url?: string | null
        }
        Update: {
          address?: string
          copyright_text?: string
          created_at?: string | null
          email?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          phone?: string
          site_description?: string
          site_name?: string
          tagline?: string
          twitter_url?: string | null
          updated_at?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          category: string
          created_at: string | null
          display_order: number
          id: string
          image_url: string
          is_active: boolean | null
          is_pinned: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean | null
          is_pinned?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean | null
          is_pinned?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hero_content: {
        Row: {
          button1_link: string
          button1_text: string
          button2_link: string
          button2_text: string
          created_at: string | null
          description: string
          hero_image_url: string | null
          id: string
          stat1_label: string
          stat1_number: string
          stat2_label: string
          stat2_number: string
          title_line1: string
          title_line2: string
          title_line3: string
          updated_at: string | null
        }
        Insert: {
          button1_link?: string
          button1_text?: string
          button2_link?: string
          button2_text?: string
          created_at?: string | null
          description?: string
          hero_image_url?: string | null
          id?: string
          stat1_label?: string
          stat1_number?: string
          stat2_label?: string
          stat2_number?: string
          title_line1?: string
          title_line2?: string
          title_line3?: string
          updated_at?: string | null
        }
        Update: {
          button1_link?: string
          button1_text?: string
          button2_link?: string
          button2_text?: string
          created_at?: string | null
          description?: string
          hero_image_url?: string | null
          id?: string
          stat1_label?: string
          stat1_number?: string
          stat2_label?: string
          stat2_number?: string
          title_line1?: string
          title_line2?: string
          title_line3?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      podcasts: {
        Row: {
          audio_url: string
          cover_image_url: string | null
          created_at: string
          description: string | null
          display_order: number | null
          duration: string | null
          id: string
          is_active: boolean | null
          is_pinned: boolean | null
          media_type: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          audio_url: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration?: string | null
          id?: string
          is_active?: boolean | null
          is_pinned?: boolean | null
          media_type?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          audio_url?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration?: string | null
          id?: string
          is_active?: boolean | null
          is_pinned?: boolean | null
          media_type?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          author_name: string
          content: string
          created_at: string
          id: string
          is_approved: boolean | null
          is_visible: boolean | null
          post_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_visible?: boolean | null
          post_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_visible?: boolean | null
          post_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          category: string | null
          content: string
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          is_pinned: boolean | null
          likes_count: number | null
          scheduled_publish_at: string | null
          status: string | null
          title: string
          updated_at: string
          video_url: string | null
          views: number | null
        }
        Insert: {
          author_id: string
          category?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          likes_count?: number | null
          scheduled_publish_at?: string | null
          status?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
          views?: number | null
        }
        Update: {
          author_id?: string
          category?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          likes_count?: number | null
          scheduled_publish_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
          views?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vision_content: {
        Row: {
          created_at: string | null
          description: string
          id: string
          stat1_label: string
          stat1_number: string
          stat2_label: string
          stat2_number: string
          stat3_label: string
          stat3_number: string
          title_line1: string
          title_line2: string
          title_line3: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string
          id?: string
          stat1_label?: string
          stat1_number?: string
          stat2_label?: string
          stat2_number?: string
          stat3_label?: string
          stat3_number?: string
          title_line1?: string
          title_line2?: string
          title_line3?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          stat1_label?: string
          stat1_number?: string
          stat2_label?: string
          stat2_number?: string
          stat3_label?: string
          stat3_number?: string
          title_line1?: string
          title_line2?: string
          title_line3?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_publish_scheduled_posts: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
