import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GeoShield AI // Landslide Susceptibility & Risk Command",
  description: "Enterprise spatial decision-support platform for slope stability analysis across Western Ghats (Wayanad Sector).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex items-center justify-center p-4 md:p-6 lg:p-8">
        {children}
      </body>
    </html>
  );
}
