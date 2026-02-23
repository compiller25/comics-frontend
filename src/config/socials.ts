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
  { key: "instagram", label: "Instagram", url: "https://instagram.com/sean_.gram", handle: "@", show: true },
  { key: "tiktok", label: "TikTok", url: "https://www.tiktok.com/@indigo._kid?_r=1&_t=ZS-94AGWczbgQu", handle: "@Sean_Tz", show: true },
  { key: "youtube", label: "YouTube", url: "https://youtube.com/@compiller25", handle: "@compiller25", show: true },
  { key: "facebook", label: "Facebook", url: "https://www.facebook.com/stevo.deemma", show: true },
  { key: "x", label: "X", url: "https://x.com/YOUR_HANDLE", handle: "@YOUR_HANDLE", show: false },
  { key: "linkedin", label: "LinkedIn", url: "https://tz.linkedin.com/in/mwakasala-steven-259b063aa", show: true },
  { key: "github", label: "GitHub", url: "https://github.com/YOUR_HANDLE", show: true },

  // Direct contact (high conversion)
  { key: "whatsapp", label: "WhatsApp", url: "https://wa.me/255757808854", show: true },
  { key: "email", label: "Email", url: "mailto:thelilsean@gmail.com", show: true },
  { key: "website", label: "Website", url: "https://compiller25.github.io/myportfolio/", show: true },
];

export const visibleSocials = () => SOCIALS.filter(s => s.show && s.url);