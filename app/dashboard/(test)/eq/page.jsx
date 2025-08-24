// import EQClient from "./EQClient";

// export default function EQPage() {
//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <EQClient />
//     </div>
//   );
// } 

import EQClient from "./EQClient";

export const metadata = {
  title: "EQ Assessment - Emotional Intelligence Test",
  description: "Take our comprehensive emotional intelligence assessment to understand your EQ strengths and areas for growth.",
};

export default function EQPage() {
  return (
    <div className="min-h-screen">
      <EQClient />
    </div>
  );
}
