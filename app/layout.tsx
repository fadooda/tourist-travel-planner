import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header"; // adjust path if different
import ChatWidget from "@/components/chat/ChatWidget";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SiteHeader />
          {children}
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
