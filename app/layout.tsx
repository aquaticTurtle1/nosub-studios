import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StudioProvider } from "@/components/studio/app-context";
import { Sidebar } from "@/components/studio/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kie.ai Studio",
  description: "Local media-generation studio on the Kie.ai API",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col md:flex-row">
        <TooltipProvider>
          <StudioProvider>
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">{children}</div>
          </StudioProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
