import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shining Overseas — BAIRA Licensed Overseas Recruitment Agency",
  description: "BAIRA-licensed overseas recruitment agency placing skilled Bangladeshi workers across the Gulf and Southeast Asia since 2009. Reg. No. RL-2716.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
