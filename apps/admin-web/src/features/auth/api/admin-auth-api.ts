import { adminApiRequest } from "../../../shared/api/client";

export interface AdminProfile {
  id: string;
  role: "admin";
  displayName: string | null;
}

interface ProfileResponse {
  profile: AdminProfile;
}

export function loginAdmin(identifier: string, password: string): Promise<AdminProfile> {
  return adminApiRequest<ProfileResponse>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  }).then((result) => result.profile);
}

export function restoreAdminSession(): Promise<AdminProfile> {
  return adminApiRequest<ProfileResponse>("/v1/admin/me").then((result) => result.profile);
}

export async function logoutAdmin(): Promise<void> {
  await adminApiRequest<void>("/v1/auth/logout", { method: "POST" });
}
