// // app/admin/layout.jsx
// import { auth, currentUser } from "@clerk/nextjs/server";
// import { redirect } from "next/navigation";

// function isAdmin(email) {
//   const allowed = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim().toLowerCase()) || [];
//   return allowed.includes((email || "").toLowerCase());
// }

// export default async function AdminLayout({ children }) {
//   const { userId } = auth();
//   if (!userId) redirect("/auth/SignIn");

//   const user = await currentUser();
//   const email = user?.primaryEmailAddress?.emailAddress;

//   if (!isAdmin(email)) {
//     redirect("/"); // or render a 403 page
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="border-b bg-white">
//         <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
//           <h1 className="text-xl font-bold">Admin Panel</h1>
//           <nav className="space-x-4">
//             <a href="/admin" className="text-sm text-blue-600">Dashboard</a>
//             <a href="/admin/questions" className="text-sm text-blue-600">Manage Questions</a>
//             <a href="/admin/performance" className="text-sm text-blue-600">Performance</a>
//           </nav>
//         </div>
//       </div>
//       <main className="max-w-6xl mx-auto p-6">{children}</main>
//     </div>
//   );
// }


// //trying....
// 'use client';
// import { useUser } from "@clerk/nextjs";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// export default function AdminLayout({ children }) {
//   const { user } = useUser();
//   const [role, setRole] = useState(null);
//   const router = useRouter();

//   useEffect(() => {
//     async function fetchRole() {
//       if (!user) return;
//       const res = await fetch(`/api/profiles/${user.id}`);
//       const data = await res.json();
//       setRole(data.role);
//       if (data.role !== "admin") {
//         router.push("/"); // non-admins back to home
//       }
//     }
//     fetchRole();
//   }, [user]);

//   if (role !== "admin") return <p>Checking access...</p>;

//   return <>{children}</>;
// }


//claude
"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  // Get admin emails from environment variable
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").map(e => e.trim().toLowerCase()) || [];

  useEffect(() => {
    async function checkAdminAccess() {
      if (!isLoaded) return; // Wait for Clerk to load
      
      if (!user) {
        router.push("/auth/SignIn"); // Redirect to sign-in if not authenticated
        return;
      }

      const userEmail = user.primaryEmailAddress?.emailAddress?.toLowerCase();
      
      // Check if user email is in admin list
      if (userEmail && adminEmails.includes(userEmail)) {
        setIsAdmin(true);
      } else {
        // If using database role check instead of email list, uncomment below:
        /*
        try {
          const res = await fetch(`/api/profiles/${user.id}`);
          const data = await res.json();
          if (data.role === "admin") {
            setIsAdmin(true);
          } else {
            router.push("/"); // Redirect non-admins to home
          }
        } catch (error) {
          console.error("Error checking admin role:", error);
          router.push("/");
        }
        */
        router.push("/"); // Redirect non-admins to home
      }
      
      setIsChecking(false);
    }

    checkAdminAccess();
  }, [user, isLoaded, router]);

  // Show loading while Clerk is loading or while checking admin access
  if (!isLoaded || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Checking access...</p>
        </div>
      </div>
    );
  }

  // Show forbidden message if not admin (shouldn't reach here due to redirect, but safety check)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">🚫 Forbidden — Admins only</p>
        </div>
      </div>
    );
  }

  // Render admin layout
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <nav className="space-x-4">
            <a href="/admin" className="text-sm text-blue-600 hover:underline">Dashboard</a>
            <a href="/admin/questions" className="text-sm text-blue-600 hover:underline">Manage Questions</a>
            <a href="/admin/performance" className="text-sm text-blue-600 hover:underline">Performance</a>
          </nav>
        </div>
      </div>
      <main className="max-w-6xl mx-auto p-6">{children}</main>
    </div>
  );
}