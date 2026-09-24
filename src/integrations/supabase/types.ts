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
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          phone: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          phone?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          phone?: string | null
          subject?: string | null
          updated_at?: string
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
      email_ab_tests: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          id: string
          status: string | null
          test_name: string
          variant_a_click_count: number | null
          variant_a_open_count: number | null
          variant_a_sent_count: number | null
          variant_a_subject: string
          variant_b_click_count: number | null
          variant_b_open_count: number | null
          variant_b_sent_count: number | null
          variant_b_subject: string
          winning_variant: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          status?: string | null
          test_name: string
          variant_a_click_count?: number | null
          variant_a_open_count?: number | null
          variant_a_sent_count?: number | null
          variant_a_subject: string
          variant_b_click_count?: number | null
          variant_b_open_count?: number | null
          variant_b_sent_count?: number | null
          variant_b_subject: string
          winning_variant?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          status?: string | null
          test_name?: string
          variant_a_click_count?: number | null
          variant_a_open_count?: number | null
          variant_a_sent_count?: number | null
          variant_a_subject?: string
          variant_b_click_count?: number | null
          variant_b_open_count?: number | null
          variant_b_sent_count?: number | null
          variant_b_subject?: string
          winning_variant?: string | null
        }
        Relationships: []
      }
      email_analytics: {
        Row: {
          clicked_at: string | null
          clicked_links: Json | null
          created_at: string
          email_id: string
          id: string
          opened_at: string | null
          recipient_email: string
          sent_at: string
        }
        Insert: {
          clicked_at?: string | null
          clicked_links?: Json | null
          created_at?: string
          email_id: string
          id?: string
          opened_at?: string | null
          recipient_email: string
          sent_at?: string
        }
        Update: {
          clicked_at?: string | null
          clicked_links?: Json | null
          created_at?: string
          email_id?: string
          id?: string
          opened_at?: string | null
          recipient_email?: string
          sent_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_html: string
          created_at: string | null
          id: string
          is_active: boolean | null
          subject: string
          template_type: string
          updated_at: string | null
        }
        Insert: {
          body_html: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          subject: string
          template_type: string
          updated_at?: string | null
        }
        Update: {
          body_html?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          subject?: string
          template_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      footer_content: {
        Row: {
          address: string
          copyright_text: string
          created_at: string | null
          developer_name: string | null
          developer_url: string | null
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
          developer_name?: string | null
          developer_url?: string | null
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
          developer_name?: string | null
          developer_url?: string | null
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
          alt_text: string | null
          aspect_ratio: number | null
          category: string
          created_at: string | null
          display_order: number
          height: number | null
          id: string
          image_url: string
          is_active: boolean | null
          is_pinned: boolean | null
          title: string
          updated_at: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          aspect_ratio?: number | null
          category?: string
          created_at?: string | null
          display_order?: number
          height?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          is_pinned?: boolean | null
          title: string
          updated_at?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          aspect_ratio?: number | null
          category?: string
          created_at?: string | null
          display_order?: number
          height?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          is_pinned?: boolean | null
          title?: string
          updated_at?: string | null
          width?: number | null
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
      match_events: {
        Row: {
          ball_no: number
          batter: string | null
          bowler: string | null
          created_at: string
          extra_runs: number
          extra_type: string | null
          id: string
          innings_no: number
          is_wicket: boolean
          match_id: string
          note: string | null
          over_no: number
          runs: number
        }
        Insert: {
          ball_no?: number
          batter?: string | null
          bowler?: string | null
          created_at?: string
          extra_runs?: number
          extra_type?: string | null
          id?: string
          innings_no?: number
          is_wicket?: boolean
          match_id: string
          note?: string | null
          over_no?: number
          runs?: number
        }
        Update: {
          ball_no?: number
          batter?: string | null
          bowler?: string | null
          created_at?: string
          extra_runs?: number
          extra_type?: string | null
          id?: string
          innings_no?: number
          is_wicket?: boolean
          match_id?: string
          note?: string | null
          over_no?: number
          runs?: number
        }
        Relationships: []
      }
      match_innings: {
        Row: {
          batting_team_id: string | null
          bowling_team_id: string | null
          created_at: string
          extras: number
          id: string
          innings_no: number
          is_declared: boolean
          match_id: string
          overs: number
          runs: number
          updated_at: string
          wickets: number
        }
        Insert: {
          batting_team_id?: string | null
          bowling_team_id?: string | null
          created_at?: string
          extras?: number
          id?: string
          innings_no?: number
          is_declared?: boolean
          match_id: string
          overs?: number
          runs?: number
          updated_at?: string
          wickets?: number
        }
        Update: {
          batting_team_id?: string | null
          bowling_team_id?: string | null
          created_at?: string
          extras?: number
          id?: string
          innings_no?: number
          is_declared?: boolean
          match_id?: string
          overs?: number
          runs?: number
          updated_at?: string
          wickets?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_innings_batting_team_id_fkey"
            columns: ["batting_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_innings_bowling_team_id_fkey"
            columns: ["bowling_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_innings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          commentary_note: string | null
          created_at: string
          facebook_post_url: string | null
          highlights_url: string | null
          id: string
          is_featured: boolean
          is_live_stream: boolean
          match_no: number | null
          poster_url: string | null
          result_text: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["match_status"]
          team_a_id: string | null
          team_b_id: string | null
          toss_decision: string | null
          toss_winner_id: string | null
          tournament_id: string
          updated_at: string
          venue: string | null
          winner_id: string | null
          youtube_url: string | null
        }
        Insert: {
          commentary_note?: string | null
          created_at?: string
          facebook_post_url?: string | null
          highlights_url?: string | null
          id?: string
          is_featured?: boolean
          is_live_stream?: boolean
          match_no?: number | null
          poster_url?: string | null
          result_text?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          team_a_id?: string | null
          team_b_id?: string | null
          toss_decision?: string | null
          toss_winner_id?: string | null
          tournament_id: string
          updated_at?: string
          venue?: string | null
          winner_id?: string | null
          youtube_url?: string | null
        }
        Update: {
          commentary_note?: string | null
          created_at?: string
          facebook_post_url?: string | null
          highlights_url?: string | null
          id?: string
          is_featured?: boolean
          is_live_stream?: boolean
          match_no?: number | null
          poster_url?: string | null
          result_text?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          team_a_id?: string | null
          team_b_id?: string | null
          toss_decision?: string | null
          toss_winner_id?: string | null
          tournament_id?: string
          updated_at?: string
          venue?: string | null
          winner_id?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_team_a_id_fkey"
            columns: ["team_a_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team_b_id_fkey"
            columns: ["team_b_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_toss_winner_id_fkey"
            columns: ["toss_winner_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          engagement_score: number | null
          id: string
          interests: string[] | null
          is_active: boolean | null
          last_engagement_at: string | null
          name: string | null
          preferred_language: string | null
          segment: string | null
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          engagement_score?: number | null
          id?: string
          interests?: string[] | null
          is_active?: boolean | null
          last_engagement_at?: string | null
          name?: string | null
          preferred_language?: string | null
          segment?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          engagement_score?: number | null
          id?: string
          interests?: string[] | null
          is_active?: boolean | null
          last_engagement_at?: string | null
          name?: string | null
          preferred_language?: string | null
          segment?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          identifier: string
          otp: string
          type: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          identifier: string
          otp: string
          type?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          identifier?: string
          otp?: string
          type?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          batting_style: string | null
          bio: string | null
          bowling_style: string | null
          created_at: string
          display_order: number
          dob: string | null
          id: string
          is_active: boolean
          is_captain: boolean
          is_overseas: boolean
          jersey_number: number | null
          name: string
          photo_url: string | null
          role: string | null
          slug: string
          stats: Json
          team_id: string | null
          updated_at: string
        }
        Insert: {
          batting_style?: string | null
          bio?: string | null
          bowling_style?: string | null
          created_at?: string
          display_order?: number
          dob?: string | null
          id?: string
          is_active?: boolean
          is_captain?: boolean
          is_overseas?: boolean
          jersey_number?: number | null
          name: string
          photo_url?: string | null
          role?: string | null
          slug: string
          stats?: Json
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          batting_style?: string | null
          bio?: string | null
          bowling_style?: string | null
          created_at?: string
          display_order?: number
          dob?: string | null
          id?: string
          is_active?: boolean
          is_captain?: boolean
          is_overseas?: boolean
          jersey_number?: number | null
          name?: string
          photo_url?: string | null
          role?: string | null
          slug?: string
          stats?: Json
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
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
      points_overrides: {
        Row: {
          created_at: string
          id: string
          lost_offset: number
          no_result_offset: number
          note: string | null
          nrr_override: number | null
          pinned_rank: number | null
          played_offset: number
          points_offset: number
          team_id: string
          tournament_id: string
          updated_at: string
          won_offset: number
        }
        Insert: {
          created_at?: string
          id?: string
          lost_offset?: number
          no_result_offset?: number
          note?: string | null
          nrr_override?: number | null
          pinned_rank?: number | null
          played_offset?: number
          points_offset?: number
          team_id: string
          tournament_id: string
          updated_at?: string
          won_offset?: number
        }
        Update: {
          created_at?: string
          id?: string
          lost_offset?: number
          no_result_offset?: number
          note?: string | null
          nrr_override?: number | null
          pinned_rank?: number | null
          played_offset?: number
          points_offset?: number
          team_id?: string
          tournament_id?: string
          updated_at?: string
          won_offset?: number
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
      post_translations: {
        Row: {
          created_at: string
          id: string
          language: string
          post_id: string
          translated_content: string
          translated_excerpt: string | null
          translated_title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          language: string
          post_id: string
          translated_content: string
          translated_excerpt?: string | null
          translated_title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          post_id?: string
          translated_content?: string
          translated_excerpt?: string | null
          translated_title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_translations_post_id_fkey"
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
          display_order: number
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
          display_order?: number
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
          display_order?: number
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
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          location?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      push_notifications: {
        Row: {
          body: string
          created_at: string
          icon: string | null
          id: string
          post_id: string | null
          sent_at: string
          title: string
          url: string | null
        }
        Insert: {
          body: string
          created_at?: string
          icon?: string | null
          id?: string
          post_id?: string | null
          sent_at?: string
          title: string
          url?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          icon?: string | null
          id?: string
          post_id?: string | null
          sent_at?: string
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          keys: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          keys: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          keys?: Json
          updated_at?: string
        }
        Relationships: []
      }
      scheduled_emails: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          post_id: string | null
          recipients: Json
          scheduled_at: string
          sent_at: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          post_id?: string | null
          recipients?: Json
          scheduled_at: string
          sent_at?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          post_id?: string | null
          recipients?: Json
          scheduled_at?: string
          sent_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_emails_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      share_events: {
        Row: {
          action: string
          content_id: string | null
          content_type: string
          created_at: string
          device: string | null
          id: string
          page_path: string | null
          platform: string
          share_url: string | null
          user_id: string | null
        }
        Insert: {
          action?: string
          content_id?: string | null
          content_type?: string
          created_at?: string
          device?: string | null
          id?: string
          page_path?: string | null
          platform: string
          share_url?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          content_id?: string | null
          content_type?: string
          created_at?: string
          device?: string | null
          id?: string
          page_path?: string | null
          platform?: string
          share_url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      site_features: {
        Row: {
          enabled: boolean
          key: string
          updated_at: string
        }
        Insert: {
          enabled?: boolean
          key: string
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_posts_cache: {
        Row: {
          created_at: string
          external_id: string
          fetched_at: string
          id: string
          is_hidden: boolean
          media_urls: Json
          message: string | null
          permalink: string | null
          posted_at: string | null
          raw: Json | null
          source: Database["public"]["Enums"]["social_source"]
        }
        Insert: {
          created_at?: string
          external_id: string
          fetched_at?: string
          id?: string
          is_hidden?: boolean
          media_urls?: Json
          message?: string | null
          permalink?: string | null
          posted_at?: string | null
          raw?: Json | null
          source: Database["public"]["Enums"]["social_source"]
        }
        Update: {
          created_at?: string
          external_id?: string
          fetched_at?: string
          id?: string
          is_hidden?: boolean
          media_urls?: Json
          message?: string | null
          permalink?: string | null
          posted_at?: string | null
          raw?: Json | null
          source?: Database["public"]["Enums"]["social_source"]
        }
        Relationships: []
      }
      sports_media: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string
          display_order: number
          height: number | null
          id: string
          is_active: boolean
          is_pinned: boolean
          kind: Database["public"]["Enums"]["media_kind"]
          match_id: string | null
          source: Database["public"]["Enums"]["media_source"]
          team_id: string | null
          thumbnail_url: string | null
          tournament_id: string | null
          updated_at: string
          url: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          display_order?: number
          height?: number | null
          id?: string
          is_active?: boolean
          is_pinned?: boolean
          kind?: Database["public"]["Enums"]["media_kind"]
          match_id?: string | null
          source?: Database["public"]["Enums"]["media_source"]
          team_id?: string | null
          thumbnail_url?: string | null
          tournament_id?: string | null
          updated_at?: string
          url: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          display_order?: number
          height?: number | null
          id?: string
          is_active?: boolean
          is_pinned?: boolean
          kind?: Database["public"]["Enums"]["media_kind"]
          match_id?: string | null
          source?: Database["public"]["Enums"]["media_source"]
          team_id?: string | null
          thumbnail_url?: string | null
          tournament_id?: string | null
          updated_at?: string
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sports_media_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sports_media_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sports_media_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      sports_news: {
        Row: {
          author_id: string | null
          content: string
          cover_url: string | null
          created_at: string
          display_order: number
          excerpt: string | null
          id: string
          is_pinned: boolean
          match_id: string | null
          published_at: string | null
          scheduled_publish_at: string | null
          slug: string
          status: string
          tags: string[]
          title: string
          tournament_id: string | null
          updated_at: string
          views: number
        }
        Insert: {
          author_id?: string | null
          content: string
          cover_url?: string | null
          created_at?: string
          display_order?: number
          excerpt?: string | null
          id?: string
          is_pinned?: boolean
          match_id?: string | null
          published_at?: string | null
          scheduled_publish_at?: string | null
          slug: string
          status?: string
          tags?: string[]
          title: string
          tournament_id?: string | null
          updated_at?: string
          views?: number
        }
        Update: {
          author_id?: string | null
          content?: string
          cover_url?: string | null
          created_at?: string
          display_order?: number
          excerpt?: string | null
          id?: string
          is_pinned?: boolean
          match_id?: string | null
          published_at?: string | null
          scheduled_publish_at?: string | null
          slug?: string
          status?: string
          tags?: string[]
          title?: string
          tournament_id?: string | null
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "sports_news_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sports_news_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriber_preferences: {
        Row: {
          created_at: string
          email_frequency: string | null
          id: string
          preferred_time: string | null
          receive_breaking_news: boolean | null
          receive_event_notifications: boolean | null
          receive_promotional: boolean | null
          receive_weekly_digest: boolean | null
          subscriber_id: string
          unsubscribed_categories: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_frequency?: string | null
          id?: string
          preferred_time?: string | null
          receive_breaking_news?: boolean | null
          receive_event_notifications?: boolean | null
          receive_promotional?: boolean | null
          receive_weekly_digest?: boolean | null
          subscriber_id: string
          unsubscribed_categories?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_frequency?: string | null
          id?: string
          preferred_time?: string | null
          receive_breaking_news?: boolean | null
          receive_event_notifications?: boolean | null
          receive_promotional?: boolean | null
          receive_weekly_digest?: boolean | null
          subscriber_id?: string
          unsubscribed_categories?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriber_preferences_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: true
            referencedRelation: "newsletter_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriber_segments: {
        Row: {
          created_at: string
          criteria: Json | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criteria?: Json | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criteria?: Json | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_followers: {
        Row: {
          created_at: string
          id: string
          session_id: string | null
          team_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          session_id?: string | null
          team_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string | null
          team_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_followers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          color_primary: string | null
          color_secondary: string | null
          created_at: string
          description: string | null
          display_order: number
          founded_year: number | null
          home_ground: string | null
          id: string
          is_active: boolean
          jersey_url: string | null
          logo_url: string | null
          name: string
          short_name: string | null
          slug: string
          tournament_id: string | null
          updated_at: string
        }
        Insert: {
          color_primary?: string | null
          color_secondary?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          founded_year?: number | null
          home_ground?: string | null
          id?: string
          is_active?: boolean
          jersey_url?: string | null
          logo_url?: string | null
          name: string
          short_name?: string | null
          slug: string
          tournament_id?: string | null
          updated_at?: string
        }
        Update: {
          color_primary?: string | null
          color_secondary?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          founded_year?: number | null
          home_ground?: string | null
          id?: string
          is_active?: boolean
          jersey_url?: string | null
          logo_url?: string | null
          name?: string
          short_name?: string | null
          slug?: string
          tournament_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          banner_url: string | null
          created_at: string
          description: string | null
          display_order: number
          end_date: string | null
          facebook_page_url: string | null
          id: string
          intro_video_url: string | null
          is_active: boolean
          name: string
          season: string | null
          slug: string
          sponsor_logos: Json
          start_date: string | null
          status: string
          tagline: string | null
          updated_at: string
          venue: string | null
          youtube_channel_url: string | null
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          end_date?: string | null
          facebook_page_url?: string | null
          id?: string
          intro_video_url?: string | null
          is_active?: boolean
          name: string
          season?: string | null
          slug: string
          sponsor_logos?: Json
          start_date?: string | null
          status?: string
          tagline?: string | null
          updated_at?: string
          venue?: string | null
          youtube_channel_url?: string | null
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          end_date?: string | null
          facebook_page_url?: string | null
          id?: string
          intro_video_url?: string | null
          is_active?: boolean
          name?: string
          season?: string | null
          slug?: string
          sponsor_logos?: Json
          start_date?: string | null
          status?: string
          tagline?: string | null
          updated_at?: string
          venue?: string | null
          youtube_channel_url?: string | null
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
      cleanup_expired_otps: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_ab_test_counter: {
        Args: { column_name: string; test_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      match_status:
        | "scheduled"
        | "live"
        | "completed"
        | "abandoned"
        | "postponed"
      media_kind: "image" | "video" | "reel"
      media_source: "upload" | "youtube" | "facebook" | "instagram" | "external"
      social_source: "facebook" | "instagram"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      match_status: [
        "scheduled",
        "live",
        "completed",
        "abandoned",
        "postponed",
      ],
      media_kind: ["image", "video", "reel"],
      media_source: ["upload", "youtube", "facebook", "instagram", "external"],
      social_source: ["facebook", "instagram"],
    },
  },
} as const
