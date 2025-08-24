"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitAttempts } from "@/lib/attempts";

export default function TestLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        await submitAttempts();
        alert("❌ Test ended because you switched tabs!");
        router.push("/test-ended");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);

  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
