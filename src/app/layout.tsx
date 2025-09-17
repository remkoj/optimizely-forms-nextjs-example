import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Optimizely CMS 12 Headless Forms",
  description: "Optimizely CMS 12 Headless Forms example",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" >
        {children}
      </body>
    </html>
  );
}
