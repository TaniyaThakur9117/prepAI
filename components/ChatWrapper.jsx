//components\ChatWrapper.jsx
"use client";

import { useState } from "react";
import ChatWidgetButton from "@/components/ChatWidgetButton";
import ChatPopup from "@/components/ChatPopup";

export default function ChatWrapper() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ChatPopup isOpen={open} closeChat={() => setOpen(false)} />
      <ChatWidgetButton openChat={() => setOpen(true)} />
    </>
  );
}