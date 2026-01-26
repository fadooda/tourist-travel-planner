//app/layout.tsx
import "./globals.css";
import { Providers } from "@/components/providers";
import PublicHeaderGate from "@/components/public-header-gate"; // adjust path if different
import ChatWidget from "@/components/chat/ChatWidget";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <PublicHeaderGate />
          {children}
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
