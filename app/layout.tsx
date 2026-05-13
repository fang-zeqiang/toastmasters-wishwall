import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ScreenThemeProvider } from "@/components/screen-theme-provider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Toastmasters 三周年电子许愿墙",
  description: "提交页、管理页与大屏展示页本地前端原型",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ScreenThemeProvider>{children}</ScreenThemeProvider>
      </body>
    </html>
  );
}
