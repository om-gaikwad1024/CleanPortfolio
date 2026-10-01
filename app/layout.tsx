import type { Metadata } from "next";
import { Allison } from "next/font/google";
import Loader from "@/components/Loader/Loader";
import SmoothScroll from "@/components/SmoothScroll/SmoothScroll";
import "./globals.css";

// Script face for the hero signature, exposed as --font-allison.
const allison = Allison({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-allison",
});

export const metadata: Metadata = {
  title: "OMMM - Liquid Orb",
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
