"use client";
import { useEffect } from "react";

export default function TestLayout({ children }) {
  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);

    // Detect tab switch (window blur)
    const handleBlur = () => {
      alert("⚠️ You cannot switch tabs during the test!");
      // Example: redirect to dashboard
      // window.location.href = "/dashboard";
    };
    window.addEventListener("blur", handleBlur);

    // Detect refresh/close
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave the test?";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-4xl p-6 bg-white shadow-lg rounded-lg">
        {children}
      </div>
    </div>
  );
}