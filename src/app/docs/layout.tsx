import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rep500 | How It Works — Documentation",
  description:
    "Everything you need to understand your Rep500 reputation report. Glossary, methodology, FAQ, and scan frequency guidance — explained without jargon.",
  openGraph: {
    title: "Rep500 | How It Works — Documentation",
    description:
      "Everything you need to understand your Rep500 reputation report. Glossary, methodology, FAQ, and scan frequency guidance.",
    url: "https://www.rep500.com/docs",
    siteName: "Rep500",
    type: "website",
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
