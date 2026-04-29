import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}