import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Arqvertic 3D | Villa Horizonte — Passeio Virtual Arquitetônico',
  description:
    'Experiência interativa WebGL de visualização arquitetônica em tempo real com Three.js, React Three Fiber, Zustand e GSAP.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.variable} font-sans bg-[#07080a] text-zinc-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}

