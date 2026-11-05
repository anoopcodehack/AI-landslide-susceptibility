import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GeoShield // Enterprise Spatial Hazard Infrastructure",
  description: "Production decision-support platform for slope stability analysis across Western Ghats (Wayanad Sector).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-white text-[#09090b] flex flex-col justify-between">
        {/* Main Application Container */}
        <div className="w-full flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
