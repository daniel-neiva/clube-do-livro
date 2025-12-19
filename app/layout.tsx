import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });



export const metadata: Metadata = {
  title: "Clube do Livro Doutrinária",
  description: "Sistema de Acompanhamento do Clube do Livro Doutrinária",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "Clube do Livro Doutrinária",
    description: "Sistema de Acompanhamento do Clube do Livro Doutrinária",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <Script src="https://apps.abacus.ai/chatllm/appllm-lib.js" strategy="afterInteractive" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
