import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";

import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { ChatbotWidget } from "@/components/chatbot-widget";
import { CartProvider } from "@/components/cart-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AppToaster } from "@/components/ui/sonner";

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

const displayFont = Sora({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ZEPHYR | Transparent Glass Storefront",
  description:
    "ZEPHYR là storefront giày với transparent glass overlays, editorial lifestyle backdrops và decision zones rõ ràng cho hành vi mua.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      className={`${bodyFont.variable} ${displayFont.variable} antialiased`}
    >
      <body className="overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]">
        <AuthProvider>
          <CartProvider>
            <div className="ambient-shell flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
            <ChatbotWidget />
            <AppToaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
