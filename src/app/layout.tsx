import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Freya — Hermes for iPhone",
  description:
    "The AI assistant your phone deserved. Freya understands context, takes real action, and stays under your control.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
