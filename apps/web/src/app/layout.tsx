import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "snip — URL Shortener",
  description: "Turn long URLs into short, shareable links in seconds.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
