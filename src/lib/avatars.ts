export interface PresetAvatar {
  id: string;
  label: string;
  url: string;
}

export const PRESET_AVATARS: PresetAvatar[] = [
  { id: "av-1", label: "Aguacate Eco", url: "/avatars/av-1.svg" },
  { id: "av-2", label: "Zorro Andino", url: "/avatars/av-2.svg" },
  { id: "av-3", label: "Chef Rescatista", url: "/avatars/av-3.svg" },
  { id: "av-4", label: "Panda Verde", url: "/avatars/av-4.svg" },
  { id: "av-5", label: "Pizza Hero", url: "/avatars/av-5.svg" },
  { id: "av-6", label: "Fresa Fresca", url: "/avatars/av-6.svg" },
  { id: "av-7", label: "León Guardián", url: "/avatars/av-7.svg" },
  { id: "av-8", label: "Brote Verde", url: "/avatars/av-8.svg" },
];

export const DEFAULT_AVATAR = "/avatars/av-1.svg";

export function getCleanAvatar(url?: string | null): string {
  if (!url || typeof url !== "string" || url.includes("dicebear")) {
    return DEFAULT_AVATAR;
  }
  return url;
}
