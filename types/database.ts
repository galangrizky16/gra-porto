// ================================================================
// DATABASE TYPES — Supabase (single source of truth)
// ================================================================

// ── Roles ─────────────────────────────────────────────────────────────────────
export type AdminRole = "superadmin" | "admin" | "user";
export type ChatRole  = "owner" | "user";
export type AuditAction = "login" | "logout" | "login_failed";

// ── Chat interfaces ───────────────────────────────────────────────────────────
export interface Profile {
  id:         string;
  email:      string;
  name:       string | null;
  avatar_url: string | null;
  role:       ChatRole;
  created_at: string;
}

// Tipe untuk baris messages di DB (tanpa join)
export interface MessageRow {
  id:         string;
  user_id:    string;
  content:    string;
  created_at: string;
}

// Tipe yang dipakai di UI (sudah di-join dengan profiles)
export interface ChatMessage extends MessageRow {
  profiles: Profile;
}

// ── Admin interfaces ──────────────────────────────────────────────────────────
export interface AdminProfile {
  id:         string;
  full_name:  string;
  role:       AdminRole;
  avatar_url: string | null;
  is_active:  boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminAuditLog {
  id:         string;
  admin_id:   string | null;
  action:     AuditAction;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// ── Database Schema ───────────────────────────────────────────────────────────
export type Database = {
  public: {
    Tables: {
      // ── Admin ──────────────────────────────────────────────────────────────
      admin_profiles: {
        Row:    AdminProfile;
        Insert: Omit<AdminProfile, "created_at" | "updated_at">;
        Update: Partial<Omit<AdminProfile, "id" | "created_at" | "updated_at">>;
      };
      admin_audit_logs: {
        Row:    AdminAuditLog;
        Insert: Omit<AdminAuditLog, "id" | "created_at">;
        Update: never;
      };

      // ── Chat ───────────────────────────────────────────────────────────────
      profiles: {
        Row:    Profile;
        Insert: {
          id:         string;
          email:      string;
          name?:      string | null;
          avatar_url?: string | null;
          role?:      ChatRole;
        };
        Update: {
          name?:      string | null;
          avatar_url?: string | null;
          role?:      ChatRole;
        };
      };
      messages: {
        // Row hanya kolom DB asli — BUKAN hasil join
        Row: MessageRow;
        Insert: {
          user_id: string;
          content: string;
        };
        Update: never;
      };
    };
  };
};