export type SocialKey =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "x"
  | "facebook"
  | "linkedin"
  | "github"
  | "whatsapp"
  | "email"
  | "website";

export type SocialLink = {
  key: SocialKey;
  label: string;
  url: string;
  handle?: string;
  show?: boolean; // toggle visibility
};

export const SOCIALS: SocialLink[] = [
  { key: "instagram", label: "Instagram", url: "https://instagram.com/YOUR_HANDLE", handle: "@YOUR_HANDLE", show: true },
  { key: "tiktok", label: "TikTok", url: "https://tiktok.com/@YOUR_HANDLE", handle: "@YOUR_HANDLE", show: true },
  { key: "youtube", label: "YouTube", url: "https://youtube.com/@YOUR_HANDLE", handle: "@YOUR_HANDLE", show: true },
  { key: "facebook", label: "Facebook", url: "https://facebook.com/YOUR_PAGE_OR_PROFILE", show: true },
  { key: "x", label: "X", url: "https://x.com/YOUR_HANDLE", handle: "@YOUR_HANDLE", show: false },
  { key: "linkedin", label: "LinkedIn", url: "https://linkedin.com/in/YOUR_HANDLE", show: false },
  { key: "github", label: "GitHub", url: "https://github.com/YOUR_HANDLE", show: false },

  // Direct contact (high conversion)
  { key: "whatsapp", label: "WhatsApp", url: "https://wa.me/2557XXXXXXXX", show: true },
  { key: "email", label: "Email", url: "mailto:you@example.com", show: true },
  { key: "website", label: "Website", url: "https://yourdomain.com", show: false },
];

export const visibleSocials = () => SOCIALS.filter(s => s.show && s.url);