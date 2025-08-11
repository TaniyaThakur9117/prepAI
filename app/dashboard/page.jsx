// import { auth } from '@clerk/nextjs/server'
// import { redirect } from 'next/navigation'

// export default function DashboardPage() {
//   const { userId } = auth()

//   if (!userId) {
//     redirect("/auth/SignIn")
//   }

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold">Welcome to your Dashboard👋</h1>
//     </div>
//   )
// }

// app/dashboard/page.jsx (server)
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function Dashboard() {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { data: attempts } = await supabaseAdmin
    .from("attempts")
    .select("*")
    .eq("clerk_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Your Dashboard</h1>
      <h2 className="mt-4 font-semibold">Recent Attempts</h2>
      <ul className="mt-2 space-y-2">
        {attempts?.map((a) => (
          <li key={a.id} className="p-3 border rounded">
            <div><strong>{a.round.toUpperCase()}</strong> — {a.score}/{a.total}</div>
            <div className="text-sm text-gray-600">{new Date(a.created_at).toLocaleString()}</div>
          </li>
        )) || <div>No attempts yet</div>}
      </ul>
    </div>
  );
}