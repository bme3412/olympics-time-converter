import './globals.css'

export const metadata = {
  title: 'Olympics Schedule App',
  description: 'Schedule for Olympic events',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}