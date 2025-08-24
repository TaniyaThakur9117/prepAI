"use client";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function ProfileSync() {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      console.log("🔄 Syncing profile for:", user.id, user.primaryEmailAddress?.emailAddress);
      fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.primaryEmailAddress?.emailAddress,
        }),
      })
        .then((res) => res.json())
        .then((data) => console.log("✅ ProfileSync response:", data))
        .catch((err) => console.error("❌ ProfileSync fetch error:", err));
    }
  }, [user]);

  return null;
}
