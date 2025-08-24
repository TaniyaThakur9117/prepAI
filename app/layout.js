import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar"; // or your navigation component
import ProfileSync from "@/components/ProfileSync";


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
           <ProfileSync /> 
          {children}
          <footer className="bg-blue-50 py-12">
            <div className="container mx-auto px-4 text-center text-grey-600">
              <p>© 2025 The Rebels. All rights reserved. </p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}

