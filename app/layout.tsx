import './globals.css';

export const metadata = {
  title: 'Video to Audio Converter',
  description: 'Convert YouTube (&) videos to MP3',
};

export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <html lang="en">
        <body>
            {children}
        </body>
      </html>
    )
  }