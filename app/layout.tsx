import type { Metadata } from "next";
import { connection } from "next/server";
import { Inter, Space_Grotesk } from "next/font/google";
import { AppShell } from "@/components/app/app-shell";
import { StudioProvider } from "@/components/studio/app-context";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

// Self-hosted; the font families match --np-font-sans / --np-font-display.
const inter = Inter({ subsets: ["latin", "cyrillic"], weight: ["400", "500", "600"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: "Studio",
  description: "Local media-generation studio on the Kie.ai API",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Cloud: render per request so the proxy.ts CSP nonce can reach Next's scripts (cacheComponents is off there).
  if (process.env.NEXT_PUBLIC_STUDIO_MODE === "cloud") await connection();
  return (
    // The font variables register the @font-face rules; tokens pick the families by name.
    <html lang="en" className={`dark ${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-dvh antialiased">
        <TooltipProvider>
          <StudioProvider>
            <AppShell>{children}</AppShell>
            <Toaster position="bottom-right" />
          </StudioProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
