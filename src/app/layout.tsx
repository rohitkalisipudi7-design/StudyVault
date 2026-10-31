import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NoteVault / EduFind AI | Verified B.Tech Syllabus Notes & Past Papers',
  description: 'Intelligent academic resource discovery and verified B.Tech syllabus notes for engineering students and educators.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Source+Sans+3:wght@400;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased min-h-screen bg-background">
        {children}
      </body>
    </html>
  );
}
