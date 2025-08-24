// Create this file at: app/api/debug/auth/route.js
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = auth();
    const user = await currentUser();
    
    const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim().toLowerCase()) || [];
    
    return NextResponse.json({
      userId,
      userEmail: user?.primaryEmailAddress?.emailAddress,
      adminEmails, // Be careful with this in production
      isUserAdmin: adminEmails.includes((user?.primaryEmailAddress?.emailAddress || "").toLowerCase()),
      userObject: {
        id: user?.id,
        firstName: user?.firstName,
        lastName: user?.lastName,
        emailAddresses: user?.emailAddresses?.map(e => e.emailAddress)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}