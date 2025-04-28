import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Fashion History Game | The MET Collection",
  description: "Test your knowledge of historical fashion around the world with artifacts from the Metropolitan Museum of Art.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-oid="5t7p.io">
      <body className={`${inter.variable} font-sans`} data-oid="9uv59.0">
        {children}
      </body>
    </html>
  );
}
