import localFont from "next/font/local";
import "./globals.css";

import React from "react";
import { PageLayout } from "@/components/page-layout";
import { siteMetadata } from "@/components/page-head";
import { PreloadResources } from "@/app/preload-resources";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { ThemeProvider } from "@/providers/theme-provider";
import { ThemeSync } from "@/components/theme-sync";
import { getStoredTheme } from "@/actions/preferences.actions";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = siteMetadata;

// App autenticado: as páginas dependem da sessão Auth0/estado de runtime,
// então não devem ser pré-renderizadas estaticamente no build.
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Tema persistido por-utilizador (null em páginas públicas/sem sessão).
  const storedTheme = await getStoredTheme();

  return (
    <html lang="pt" suppressHydrationWarning>
      <PreloadResources />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme={storedTheme ?? "system"}
          enableSystem
          disableTransitionOnChange
        >
          <ThemeSync serverTheme={storedTheme} />
          <UserProvider>
            <PageLayout>{children}</PageLayout>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
