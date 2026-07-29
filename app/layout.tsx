import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GitPulse - GitHub 项目热度监控',
  description: '实时追踪 GitHub 项目的 Star、下载量等数据',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  )
}
