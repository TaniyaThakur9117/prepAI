//components\ChatWidgetButton.jsx
"use client";

export default function ChatWidgetButton({ openChat }) {
  return (
    <button
      onClick={openChat}
      className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
    >
      💬
    </button>
  );
}