import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Way2Humanity — The Trust Layer',
  description: 'Growing Humanity Through Technology — An auditable community trust layer connecting Seekers, Helpers, Donors, and CSR organizations through verified evidence and proof of work.',
  keywords: ['Humanitarian', 'Trust Layer', 'Community Impact', 'AI Verification', 'Proof of Work', 'CSR Impact'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#F9F8F6] text-[#2C2B29] antialiased">
        {children}
      </body>
    </html>
  );
}
