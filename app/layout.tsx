import type { Metadata } from 'next';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-500-italic.css';
import '@fontsource/libre-baskerville/latin-400.css';
import '@fontsource/libre-baskerville/latin-400-italic.css';
import './globals.css';
import './checkout.css';
export const metadata: Metadata = { title: 'Known — Send a real rose', description: 'Roses belong in real life. So does dating. Send someone a real rose in 14 cities.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
