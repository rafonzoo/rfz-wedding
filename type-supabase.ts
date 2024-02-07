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
      wedding: {
        Row: {
          comments: Json
          couple: Json
          createdAt: string
          displayName: string
          events: Json
          galleries: Json
          guests: Json
          id: number
          loadout: Json
          music: Json | null
          name: string
          payment: Json
          status: Database["public"]["Enums"]["status"]
          stories: string
          surprise: string
          updatedAt: string
          userId: string
          wid: string
        }
        Insert: {
          comments?: Json
          couple?: Json
          createdAt?: string
          displayName?: string
          events?: Json
          galleries?: Json
          guests?: Json
          id?: number
          loadout?: Json
          music?: Json | null
          name?: string
          payment?: Json
          status?: Database["public"]["Enums"]["status"]
          stories?: string
          surprise?: string
          updatedAt?: string
          userId?: string
          wid?: string
        }
        Update: {
          comments?: Json
          couple?: Json
          createdAt?: string
          displayName?: string
          events?: Json
          galleries?: Json
          guests?: Json
          id?: number
          loadout?: Json
          music?: Json | null
          name?: string
          payment?: Json
          status?: Database["public"]["Enums"]["status"]
          stories?: string
          surprise?: string
          updatedAt?: string
          userId?: string
          wid?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      wedding_prod: {
        Row: {
          comments: Json
          couple: Json
          createdAt: string
          displayName: string
          events: Json
          galleries: Json
          guests: Json
          id: number
          loadout: Json
          music: Json | null
          name: string
          payment: Json
          status: Database["public"]["Enums"]["status"]
          stories: string
          surprise: string
          updatedAt: string
          userId: string
          wid: string
        }
        Insert: {
          comments?: Json
          couple?: Json
          createdAt?: string
          displayName?: string
          events?: Json
          galleries?: Json
          guests?: Json
          id?: number
          loadout?: Json
          music?: Json | null
          name?: string
          payment?: Json
          status?: Database["public"]["Enums"]["status"]
          stories?: string
          surprise?: string
          updatedAt?: string
          userId?: string
          wid?: string
        }
        Update: {
          comments?: Json
          couple?: Json
          createdAt?: string
          displayName?: string
          events?: Json
          galleries?: Json
          guests?: Json
          id?: number
          loadout?: Json
          music?: Json | null
          name?: string
          payment?: Json
          status?: Database["public"]["Enums"]["status"]
          stories?: string
          surprise?: string
          updatedAt?: string
          userId?: string
          wid?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_prod_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      wedding_stg: {
        Row: {
          comments: Json
          couple: Json
          createdAt: string
          displayName: string
          events: Json
          galleries: Json
          guests: Json
          id: number
          loadout: Json
          music: Json | null
          name: string
          payment: Json
          status: Database["public"]["Enums"]["status"]
          stories: string
          surprise: string
          updatedAt: string
          userId: string
          wid: string
        }
        Insert: {
          comments?: Json
          couple?: Json
          createdAt?: string
          displayName?: string
          events?: Json
          galleries?: Json
          guests?: Json
          id?: number
          loadout?: Json
          music?: Json | null
          name?: string
          payment?: Json
          status?: Database["public"]["Enums"]["status"]
          stories?: string
          surprise?: string
          updatedAt?: string
          userId?: string
          wid?: string
        }
        Update: {
          comments?: Json
          couple?: Json
          createdAt?: string
          displayName?: string
          events?: Json
          galleries?: Json
          guests?: Json
          id?: number
          loadout?: Json
          music?: Json | null
          name?: string
          payment?: Json
          status?: Database["public"]["Enums"]["status"]
          stories?: string
          surprise?: string
          updatedAt?: string
          userId?: string
          wid?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_stg_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      status: "live" | "draft"
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
