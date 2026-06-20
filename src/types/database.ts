export type Plan = "free" | "starter" | "pro" | "scale";
export type VideoStatus = "pending" | "generating" | "ready" | "failed";

export interface Profile {
  id: string;
  created_at: string;
  plan: Plan;
  credits: number;
  whop_customer_id: string | null;
}

export interface Video {
  id: string;
  user_id: string;
  created_at: string;
  expires_at: string;
  product_url: string;
  product_title: string | null;
  product_image_url: string | null;
  status: VideoStatus;
  storage_path: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  higgsfield_job_id: string | null;
}
