export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar: string;
}
