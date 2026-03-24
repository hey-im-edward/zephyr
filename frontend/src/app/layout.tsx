import type { Metadata } from "next";
import { Be_Vietnam_Pro, Cormorant_Garamond } from "next/font/google";

import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { CartProvider } from "@/components/cart-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AppToaster } from "@/components/ui/sonner";

const bodyFont = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ZEPHYR | Luxury Shoe Atelier",
  description: "Bộ sưu tập giày cao cấp với trải nghiệm mua sắm hiện đại, quản trị rõ ràng và giao diện tiếng Việt.",
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
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <AuthProvider>
          <CartProvider>
            <div className="ambient-shell flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
            <AppToaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
