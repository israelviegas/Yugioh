import './globals.css'
import Navbar from '@/components/Navbar'
import { LanguageProvider } from '@/context/LanguageContext'

export const metadata = {
  title: 'Yu-Gi-Oh! Trading Platform',
  description: 'Trade, buy, sell cards and share strategies',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <Navbar />
          <main>{children}</main>
        </LanguageProvider>
      </body>
    </html>
  )
}
