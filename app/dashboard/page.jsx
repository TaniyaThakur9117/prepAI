import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default function DashboardPage() {
  const { userId } = auth()

  if (!userId) {
    redirect("/auth/SignIn")
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome to your Dashboard👋</h1>
    </div>
  )
}