// //components\ChatPopup.jsx
// "use client";

// import { useState } from "react";

// export default function ChatPopup({ isOpen, closeChat }) {
//   const [messages, setMessages] = useState([
//     { sender: "bot", text: "Hi! How can I help you today?" }
//   ]);

//   const [input, setInput] = useState("");
//   const [typing, setTyping] = useState(false);

//   const sendMessage = () => {
//     if (!input.trim()) return;

//     const newMessage = { sender: "user", text: input };
//     setMessages([...messages, newMessage]);
//     setInput("");

//     // simulate typing animation
//     setTyping(true);
//     setTimeout(() => {
//       setMessages(prev => [...prev, { sender: "bot", text: "Got it! 😊" }]);
//       setTyping(false);
//     }, 1200);
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed bottom-20 right-6 w-80 bg-white shadow-xl rounded-xl p-4 border">
//       {/* Header */}
//       <div className="flex justify-between items-center border-b pb-2 mb-3">
//         <h2 className="font-bold text-lg">PrepAI Chat</h2>
//         <button onClick={closeChat}>✖</button>
//       </div>

//       {/* Messages */}
//       <div className="h-60 overflow-y-auto space-y-2 mb-3">
//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             className={`p-2 rounded-lg text-sm w-fit max-w-[70%] ${
//               msg.sender === "user"
//                 ? "bg-blue-600 text-white ml-auto"
//                 : "bg-gray-200"
//             }`}
//           >
//             {msg.text}
//           </div>
//         ))}

//         {/* Typing animation */}
//         {typing && (
//           <div className="bg-gray-300 p-2 rounded-lg w-fit">
//             <div className="flex space-x-1">
//               <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
//               <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
//               <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Input */}
//       <div className="flex gap-2">
//         <input
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Type here..."
//           className="flex-1 border rounded-lg p-2"
//         />
//         <button
//           onClick={sendMessage}
//           className="bg-blue-600 text-white px-3 rounded-lg"
//         >
//           ➤
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";

export default function ChatPopup({ isOpen, closeChat }) {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! How can I help you today?" }
  ]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);

    const userInput = input;
    setInput("");

    setTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "user", content: userInput }
          ],
        }),
      });

      const data = await res.json();

      const botReply = data.reply || "Sorry, I couldn't understand.";

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: botReply }
      ]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Oops! Something went wrong." }
      ]);
    }

    setTyping(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-6 w-80 bg-white shadow-xl rounded-xl p-4 border">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-2 mb-3">
        <h2 className="font-bold text-lg">PrepAI Chat</h2>
        <button onClick={closeChat}>✖</button>
      </div>

      {/* Messages */}
      <div className="h-60 overflow-y-auto space-y-2 mb-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg text-sm w-fit max-w-[70%] ${
              msg.sender === "user"
                ? "bg-blue-600 text-white ml-auto"
                : "bg-gray-200"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {typing && (
          <div className="bg-gray-300 p-2 rounded-lg w-fit">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input field */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type here..."
          className="flex-1 border rounded-lg p-2"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-3 rounded-lg"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
