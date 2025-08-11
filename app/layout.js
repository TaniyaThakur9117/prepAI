import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar"; // or your navigation component

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PrepAI",
  description: "AI-powered placement training platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`min-h-screen bg-gray-100 text-gray-900 ${inter.className}`}>
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
