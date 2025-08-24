"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";
import {
  Home,
  ClipboardList,
  Brain,
  Smile,
  FileText,
  MessageSquare,
  Cpu,
  Settings,
  LogOut,
  Target,
  Menu,
  X,
} from "lucide-react";

// Define all dashboard navigation items with purple/blue theme gradients
const navItems = [
  { 
    name: "Overview", 
    href: "/dashboard", 
    icon: Home, 
    gradient: "from-purple-500 to-blue-600",
    color: "text-purple-600"
  },
  { 
    name: "Aptitude", 
    href: "/dashboard/aptitude", 
    icon: ClipboardList, 
    gradient: "from-blue-500 to-blue-600",
    color: "text-blue-600"
  },
  { 
    name: "IQ Questions", 
    href: "/dashboard/iq", 
    icon: Brain, 
    gradient: "from-purple-500 to-purple-600",
    color: "text-purple-600"
  },
  { 
    name: "EQ Questions", 
    href: "/dashboard/eq", 
    icon: Smile, 
    gradient: "from-pink-500 to-pink-600",
    color: "text-pink-600"
  },
  { 
    name: "Case Studies", 
    href: "/dashboard/case-studies", 
    icon: FileText, 
    gradient: "from-green-500 to-green-600",
    color: "text-green-600"
  },
  { 
    name: "Interview Questions", 
    href: "/dashboard/interview", 
    icon: MessageSquare, 
    gradient: "from-orange-500 to-orange-600",
    color: "text-orange-600"
  },
  { 
    name: "Technical Round", 
    href: "/dashboard/technical-round", 
    icon: Cpu, 
    gradient: "from-indigo-500 to-indigo-600",
    color: "text-indigo-600"
  },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <aside className={`${
        isSidebarOpen ? 'w-72' : 'w-20'
      } transition-all duration-300 ease-in-out bg-gradient-to-b from-purple-100/60 to-blue-100/60 backdrop-blur-xl border-r border-purple-200/50 shadow-2xl flex flex-col overflow-hidden`}>
        
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-center border-b border-purple-100/50 px-4">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  PrepAI
                </h1>
                <p className="text-xs text-gray-500">Smart Preparation</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {isSidebarOpen && (
            <div className="mb-6">
              <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-3">
                Main Menu
              </p>
            </div>
          )}
          
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-purple-200/50` 
                    : "text-gray-600 hover:bg-purple-50/50 hover:text-gray-900"
                } ${!isSidebarOpen ? 'justify-center' : ''}`}
                title={!isSidebarOpen ? item.name : ''}
              >
                {/* Active Indicator */}
                {isActive && isSidebarOpen && (
                  <div className="absolute left-0 w-1 h-8 bg-white rounded-r-full" />
                )}
                
                {/* Icon Container */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
                  isActive 
                    ? "bg-white/20" 
                    : `group-hover:bg-gradient-to-r group-hover:${item.gradient} group-hover:text-white`
                } ${!isSidebarOpen ? 'w-10 h-10' : ''}`}>
                  <Icon size={isSidebarOpen ? 18 : 20} />
                </div>
                
                {isSidebarOpen && (
                  <>
                    <span className="truncate">{item.name}</span>
                    
                    {/* Hover Arrow */}
                    {!isActive && (
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className={`${isSidebarOpen ? 'p-6' : 'p-4'} border-t border-purple-100/50 space-y-4`}>
          {/* Settings Button */}
          <Link 
            href="/dashboard/settings"
            className={`flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-purple-50/50 rounded-lg transition-colors text-sm ${
              !isSidebarOpen ? 'justify-center' : ''
            }`}
            title={!isSidebarOpen ? 'Settings' : ''}
          >
            <Settings size={16} />
            {isSidebarOpen && <span>Settings</span>}
          </Link>
          
          {/* User Info */}
          <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'} p-3 bg-gradient-to-r from-purple-50/50 to-blue-50/50 rounded-xl border border-purple-100/30`}>
            <div className="flex items-center gap-3">
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Logged in
                  </p>
                  <p className="text-xs text-gray-500">
                    Ready to practice
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white/80 backdrop-blur-xl shadow-sm border-b border-white/20 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-purple-50 transition-colors duration-200 text-gray-600 hover:text-purple-600"
              aria-label="Toggle Sidebar"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {navItems.find((item) => pathname.startsWith(item.href))?.name || "Dashboard"}
            </h1>
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}