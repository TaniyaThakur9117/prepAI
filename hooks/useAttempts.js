// hooks/useAttempts.js
"use client";
import { useAuth } from "@clerk/nextjs";
import { saveAttempt, saveFinalScore } from "@/lib/attempts";

export function useAttempts() {
  const { getToken } = useAuth();

  const wrappedSaveAttempt = async (data) => {
    const token = await getToken();
    return saveAttempt(data, token);
  };

  const wrappedSaveFinalScore = async (data) => {
    const token = await getToken();
    return saveFinalScore(data, token);
  };

  return {
    saveAttempt: wrappedSaveAttempt,
    saveFinalScore: wrappedSaveFinalScore,
  };
}
