import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
