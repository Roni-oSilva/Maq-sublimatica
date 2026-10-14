import type { Metadata, Viewport } from "next";
import { Anton, Poppins, Yellowtail } from "next/font/google";
import { Toaster } from "sonner";
import { getSettings } from "@/lib/data";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

const sans = Poppins({ subsets: ["latin"], variable: "--font-sans", display: "swap", weight: ["400", "500", "600", "700", "800"] });
const display = Anton({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: "400" });
const script = Yellowtail({ subsets: ["latin"], variable: "--font-script", display: "swap", weight: "400" });

export const viewport: Viewport = { themeColor: "#171717", width: "device-width", initialScale: 1 };

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings().catch(() => null);
  const name = s?.store_name ?? "Maq Sublimática";
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: `${name} — Sublimação e personalização`, template: `%s | ${name}` },
    description: `${name}: equipamentos, insumos, artes prontas e serviços de sublimação e personalização. Peça pelo WhatsApp.`,
    openGraph: { type: "website", locale: "pt_BR", siteName: name },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${display.variable} ${script.variable}`}>
      <body className="min-h-screen font-sans">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
