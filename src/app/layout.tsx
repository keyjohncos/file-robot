import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import "./globals.css";
import ClientBody from "./ClientBody";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import MainLayout from "@/components/MainLayout";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "File Matcher Pro - Advanced File Matching and ZIP Download",
  description: "Professional tool for matching files by product codes with drag-and-drop support, real file processing, and ZIP download. Perfect for organizing and extracting specific files from large collections.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ClientBody>
              <MainLayout>
                {children}
              </MainLayout>
            </ClientBody>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
