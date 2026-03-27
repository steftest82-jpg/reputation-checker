import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rep500 — Executive Reputation Intelligence",
  description:
    "Comprehensive online reputation analysis. Understand how a person or company is perceived across Google, AI platforms, media, and social channels.",
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "Rep500 — Comprehensive Online Reputation Analysis",
    description:
      "Understand how a person or company is perceived across Google, AI platforms, media, and social channels.",
    url: "https://www.rep500.com",
    siteName: "Rep500",
    images: [
      {
        url: "https://www.rep500.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rep500 — Comprehensive Online Reputation Analysis",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rep500 — Comprehensive Online Reputation Analysis",
    description:
      "Understand how a person or company is perceived across Google, AI platforms, media, and social channels.",
    images: ["https://www.rep500.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-YVXHGSYFKJ"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-YVXHGSYFKJ');
        `}} />
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
        <link
          href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;600;700;800;900&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Manrope:wght@200..800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            /* Hide non-report elements */
            nav, footer, .no-print, button, [class*="sticky"] { display: none !important; }

            /* Reset background */
            body, html { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

            /* Page setup */
            @page { margin: 0.6in 0.5in; size: A4; }

            /* Show all tabs content for print */
            .report-section { display: block !important; }

            /* Remove shadows and borders for clean print */
            * { box-shadow: none !important; }

            /* Prevent page breaks inside cards */
            .report-section > div { break-inside: avoid; page-break-inside: avoid; }

            /* Ensure colors print */
            [class*="bg-"], [class*="text-"] { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

            /* Hide loading, homepage, packages */
            main > section:last-of-type, [class*="packages"] { display: none !important; }

            /* Ensure links show URLs */
            a[href]:after { content: ""; }

            /* Typography for print */
            body { font-size: 11pt; line-height: 1.4; }
            h1, h2, h3, h4 { break-after: avoid; page-break-after: avoid; }
          }
        `}} />
      </head>
      <body className="bg-[#f9faf5] text-[#1a1c1a] antialiased" style={{ fontFamily: "'Manrope', sans-serif" }}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
