// // app/chatbot/page.jsx
// import Chat from "@/components/Chat"; // adjust path if needed

// export const metadata = {
//   title: "Chatbot — PrepAI",
// };

// export default function Page() {
//   return (
//     <main style={{ padding: 24 }}>
//       <h1>PrepAI Chatbot</h1>
//       <div style={{ marginTop: 16 }}>
//         <Chat />
//       </div>
//     </main>
//   );
// }


// app/chatbot/page.jsx
import Chat from "@/components/Chat";

export const metadata = {
  title: "Chatbot — PrepAI",
};

export default function Page() {
  return (
    <main style={{ padding: 24, minHeight: '100vh' }}>
      <h1>PrepAI Chatbot</h1>
      <div style={{ marginTop: 16 }}>
        <Chat />
      </div>
    </main>
  );
}