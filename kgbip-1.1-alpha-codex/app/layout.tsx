import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KGBip | Central de atendimento",
  description: "Atendimento clínico no WhatsApp com colaboração, controle e IA assistida.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
