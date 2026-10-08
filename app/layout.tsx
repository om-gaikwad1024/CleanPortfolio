import type { Metadata } from "next";
import { Allison } from "next/font/google";
import Loader from "@/components/Loader/Loader";
import SmoothScroll from "@/components/SmoothScroll/SmoothScroll";
import { site } from "@/content/site";
import "./globals.css";

// Script face for the hero signature, exposed as --font-allison.
const allison = Allison({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-allison",
});

const title = `${site.name} | ${site.role}`;

export const metadata: Metadata = {
  title,
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  openGraph: {
    type: "website",
    title,
    description: site.description,
    siteName: site.name,
    locale: "en_US",
  },
  twitter: {
    // Big image card; the image itself is app/opengraph-image.png (see CLAUDE.md).
    card: "summary_large_image",
    title,
    description: site.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={allison.variable}>
      <body>
        <SmoothScroll>
          <Loader />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
