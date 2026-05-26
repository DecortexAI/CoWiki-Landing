import './globals.css';

export const metadata = {
  title: 'CoWiki — 团队知识，自己生长',
  description: '人与 AI 共建的下一代团队 Wiki。LLM 编译管线 + Git 版本控制，让知识自动沉淀、自动整理。',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@500;700;900&family=Noto+Sans+SC:wght@300;400;500;700&family=Inter:ital,wght@0,400;0,500;0,600;1,500&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
