import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: {
    default: "BioRoute Admin",
    template: "%s | BioRoute Admin",
  },
  description:
    "Panel admin BioRoute untuk verifikasi mitra, pengelolaan batch residu organik, dan laporan wilayah Banyumas.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}