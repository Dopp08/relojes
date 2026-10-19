export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type WatchRow = {
  id: string;
  brand: string;
  model: string;
  reference: string;
  year: number | null;
  price: number | null;
  category: string;
  case_info: string;
  movement: string;
  condition: string;
  extras: string;
  description: string;
  featured: boolean;
  status: "available" | "sold";
  sold_at: string | null;
  created_at: string;
  updated_at: string;
};

export type WatchPhotoRow = {
  id: string;
  watch_id: string;
  path: string;
  position: number;
  created_at: string;
};

type WatchInsert = Partial<WatchRow> & Pick<WatchRow, "brand" | "model">;

export type Database = {
  public: {
    Tables: {
      watches: {
        Row: WatchRow;
        Insert: WatchInsert;
        Update: Partial<WatchRow>;
        Relationships: [];
      };
      watch_photos: {
        Row: WatchPhotoRow;
        Insert: Partial<WatchPhotoRow> & Pick<WatchPhotoRow, "watch_id" | "path">;
        Update: Partial<WatchPhotoRow>;
        Relationships: [
          {
            foreignKeyName: "watch_photos_watch_id_fkey";
            columns: ["watch_id"];
            isOneToOne: false;
            referencedRelation: "watches";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_messages: {
        Row: { id: string; name: string; email: string; message: string; topic: string; read: boolean; created_at: string };
        Insert: { name: string; email: string; message: string; topic?: string };
        Update: Partial<{ read: boolean }>;
        Relationships: [];
      };
      user_roles: {
        Row: { id: string; user_id: string; role: "admin"; created_at: string };
        Insert: { user_id: string; role: "admin" };
        Update: Partial<{ user_id: string; role: "admin" }>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      has_role: { Args: { _user_id: string; _role: "admin" }; Returns: boolean };
    };
    Enums: { app_role: "admin" };
    CompositeTypes: { [_ in never]: never };
  };
};
