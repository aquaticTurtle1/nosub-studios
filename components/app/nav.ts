import { AudioLines, Clapperboard, Compass, Image as ImageIcon, LayoutGrid, Wrench } from "lucide-react";

export const NAV = [
  { href: "/", label: "Explore", icon: Compass },
  { href: "/image", label: "Image", icon: ImageIcon },
  { href: "/video", label: "Video", icon: Clapperboard },
  { href: "/audio", label: "Audio", icon: AudioLines },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/library", label: "Library", icon: LayoutGrid },
] as const;

/** The app's name (placeholder until the owner picks one). */
export const APP_NAME = "Studio";
