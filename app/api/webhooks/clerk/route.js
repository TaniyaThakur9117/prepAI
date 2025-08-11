'use server'

import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { createClient } from '@supabase/supabase-js'

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key (NOT anon key)
)

export async function POST(req) {
  const payload = await req.text()
  const headerPayload = headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  const wh = new Webhook(webhookSecret)

  let evt
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature
    })
  } catch (err) {
    console.error("Webhook verification failed:", err)
    return new Response("Invalid webhook", { status: 400 })
  }

  const eventType = evt.type
  const data = evt.data

  if (eventType === "user.created" || eventType === "user.updated") {
    const userId = data.id
    const email = data.email_addresses?.[0]?.email_address || ""
    const fullName = `${data.first_name || ""} ${data.last_name || ""}`.trim()

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        email: email,
        full_name: fullName
      })

    if (error) {
      console.error("Supabase upsert error:", error)
      return new Response("Database error", { status: 500 })
    }
  }

  return new Response("Webhook received", { status: 200 })
}