// //components\Chat.jsx
// "use client";

// import { useState, useRef, useEffect } from "react";
// import { Send, Bot, User, Sparkles } from "lucide-react";

// export default function Chat() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const messagesEndRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const userMessage = { role: "user", content: input };
//     setMessages((prev) => [...prev, userMessage]);
//     setInput("");
//     setLoading(true);

//     try {
//       const res = await fetch("/api/chat", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           messages: [userMessage],
//         }),
//       });

//       const data = await res.json();

//       const assistantMessage = {
//         role: "assistant",
//         content: data.reply,
//       };

//       setMessages((prev) => [...prev, assistantMessage]);
//     } catch (err) {
//       console.error("Chat error:", err);
//       setMessages((prev) => [
//         ...prev,
//         {
//           role: "assistant",
//           content: "Sorry, I encountered an error. Please try again.",
//         },
//       ]);
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="flex flex-col h-[600px] max-w-4xl mx-auto bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-2xl overflow-hidden border border-purple-100">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
//         <div className="flex items-center gap-3">
//           <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
//             <Sparkles className="w-6 h-6" />
//           </div>
//           <div>
//             <h2 className="text-2xl font-bold">PrepAI Assistant</h2>
//             <p className="text-purple-100 text-sm">Your intelligent study companion</p>
//           </div>
//         </div>
//       </div>

//       {/* Messages Container */}
//       <div className="flex-1 overflow-y-auto p-6 space-y-4">
//         {messages.length === 0 && (
//           <div className="flex flex-col items-center justify-center h-full text-center">
//             <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md">
//               <Sparkles className="w-16 h-16 mx-auto text-purple-500 mb-4" />
//               <h3 className="text-xl font-semibold text-gray-800 mb-2">
//                 Welcome to PrepAI!
//               </h3>
//               <p className="text-gray-600">
//                 Ask me anything about your studies. I'm here to help you learn and prepare.
//               </p>
//             </div>
//           </div>
//         )}

//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             className={`flex gap-3 ${
//               msg.role === "user" ? "flex-row-reverse" : "flex-row"
//             }`}
//           >
//             {/* Avatar */}
//             <div
//               className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
//                 msg.role === "user"
//                   ? "bg-gradient-to-br from-purple-500 to-purple-600"
//                   : "bg-gradient-to-br from-blue-500 to-blue-600"
//               }`}
//             >
//               {msg.role === "user" ? (
//                 <User className="w-5 h-5 text-white" />
//               ) : (
//                 <Bot className="w-5 h-5 text-white" />
//               )}
//             </div>

//             {/* Message Bubble */}
//             <div
//               className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-md ${
//                 msg.role === "user"
//                   ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white"
//                   : "bg-white text-gray-800 border border-gray-100"
//               }`}
//             >
//               <p className="text-sm leading-relaxed whitespace-pre-wrap">
//                 {msg.content}
//               </p>
//             </div>
//           </div>
//         ))}

//         {loading && (
//           <div className="flex gap-3">
//             <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
//               <Bot className="w-5 h-5 text-white" />
//             </div>
//             <div className="bg-white rounded-2xl px-5 py-3 shadow-md border border-gray-100">
//               <div className="flex gap-1">
//                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
//                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
//                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
//               </div>
//             </div>
//           </div>
//         )}

//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input Area */}
//       <div className="p-6 bg-white border-t border-gray-200">
//         <div className="flex gap-3">
//           <input
//             type="text"
//             className="flex-1 px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
//             placeholder="Ask me anything..."
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
//             disabled={loading}
//           />
//           <button
//             onClick={sendMessage}
//             disabled={loading || !input.trim()}
//             className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
//           >
//             <Send className="w-5 h-5" />
//             Send
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }






"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    // Scroll only the messages container, not the entire page
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Scroll chat messages to bottom when they change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [userMessage],
        }),
      });

      const data = await res.json();

      const assistantMessage = {
        role: "assistant",
        content: data.reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-2xl overflow-hidden border border-purple-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">PrepAI Assistant</h2>
            <p className="text-purple-100 text-sm">Your intelligent study companion</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md">
              <Sparkles className="w-16 h-16 mx-auto text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Welcome to PrepAI!
              </h3>
              <p className="text-gray-600">
                Ask me anything about your studies. I'm here to help you learn and prepare.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-purple-500 to-purple-600"
                  : "bg-gradient-to-br from-blue-500 to-blue-600"
              }`}
            >
              {msg.role === "user" ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-md ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white"
                  : "bg-white text-gray-800 border border-gray-100"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white rounded-2xl px-5 py-3 shadow-md border border-gray-100">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-gray-200">
        <div className="flex gap-3">
          <input
            type="text"
            className="flex-1 px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
          >
            <Send className="w-5 h-5" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}