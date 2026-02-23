export type AdminRole = "superadmin" | "admin";
export type AuditAction = "login" | "logout" | "login_failed";

export interface AdminProfile {
  id: string;
  full_name: string;
  role: AdminRole;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminAuditLog {
  id: string;
  admin_id: string | null;
  action: AuditAction;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      admin_profiles: {
        Row: AdminProfile;
        Insert: Omit<AdminProfile, "created_at" | "updated_at">;
        Update: Partial<Omit<AdminProfile, "id" | "created_at" | "updated_at">>;
      };
      admin_audit_logs: {
        Row: AdminAuditLog;
        Insert: Omit<AdminAuditLog, "id" | "created_at">;
        Update: never;
      };
    };
  };
};