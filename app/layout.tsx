import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FloatingAiAssistant } from "@/components/ui/glowing-ai-chat-assistant";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CineMatch — AI-Powered Movie Recommendations",
  description:
    "Discover your next favorite film with CineMatch. AI-powered movie recommendations, curated collections, and a cinematic browsing experience.",
  keywords: ["movies", "recommendations", "AI", "cinema", "film", "streaming"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <TooltipProvider delay={300}>
              {children}
              <FloatingAiAssistant />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}



