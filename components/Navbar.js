// "use client";

// import { UserButton, useUser } from "@clerk/nextjs";

// export default function Navbar() {
//   const { user } = useUser();

//   return (
//     <nav className="p-4 bg-white shadow flex justify-between items-center">
//       <h1 className="font-bold text-xl">PrepAI</h1>
//       <div>
//         {user ? <UserButton afterSignOutUrl="/" /> : null}
//       </div>
//     </nav>
//   );
// }


"use client";
import { UserButton, useUser } from "@clerk/nextjs";

export default function Navbar() {
  const { user } = useUser();

  return (
    <nav className="p-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 shadow flex justify-between items-center">
      <h1 className="font-bold text-xl text-white">PrepAI</h1>
      <div>
        {user ? <UserButton afterSignOutUrl="/" /> : null}
      </div>
    </nav>
  );
}