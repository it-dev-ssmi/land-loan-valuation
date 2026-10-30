import type { Metadata } from 'next';
import { Inter, Noto_Sans_Lao } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-latin' });
const lao = Noto_Sans_Lao({ subsets: ['lao'], variable: '--font-lao' });

export const metadata: Metadata = {
  title: 'ປະເມີນທີ່ດິນ · ວົງເງິນປ່ອຍກູ້',
  description: 'ລະບົບຄຳນວນມູນຄ່າທີ່ດິນ ແລະ ສິ່ງປຸກສ້າງ ເພື່ອປະເມີນວົງເງິນປ່ອຍກູ້',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lo" className={cn('font-sans antialiased', inter.variable, lao.variable)}>
      <body className="min-h-svh bg-muted/40">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
