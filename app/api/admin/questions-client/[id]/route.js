// //app\api\admin\questions-client\[id]\route.js
// import { createClient } from "@supabase/supabase-js";
// import { NextResponse } from "next/server";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// function isAdmin(email) {
//   const adminEmails = process.env.ADMIN_EMAILS;
//   if (!adminEmails) return false;
//   return adminEmails
//     .split(",")
//     .map((e) => e.trim().toLowerCase())
//     .includes(email?.toLowerCase());
// }

// export async function DELETE(request, { params }) {
//   const { id } = params;
//   const userEmail = request.headers.get("x-user-email");

//   if (!isAdmin(userEmail)) {
//     return NextResponse.json({ error: "Not authorized" }, { status: 403 });
//   }

//   try {
//     // Check hr table first
//     const { data: hrRow, error: hrError } = await supabase
//       .from("hr_questions")
//       .select("id")
//       .eq("id", id)
//       .single();

//     if (hrError && hrError.code !== "PGRST116") { // PGRST116 = no row found
//       return NextResponse.json({ error: hrError.message }, { status: 500 });
//     }

//     if (hrRow) {
//       const { error } = await supabase.from("hr_questions").delete().eq("id", id);
//       if (error) return NextResponse.json({ error: error.message }, { status: 500 });
//       return NextResponse.json({ success: true });
//     }

//     // Otherwise delete from questions
//     const { error } = await supabase.from("questions").delete().eq("id", id);
//     if (error) return NextResponse.json({ error: error.message }, { status: 500 });

//     return NextResponse.json({ success: true });
//   } catch (err) {
//     console.error("DELETE /questions-client/[id] error:", err);
//     return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
//   }
// }



import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function isAdmin(email) {
  const adminEmails = process.env.ADMIN_EMAILS;
  if (!adminEmails) return false;

  return adminEmails
    .split(",")
    .map(e => e.trim().toLowerCase())
    .includes(email?.toLowerCase());
}

export async function DELETE(request, context) {
  try {
    const { id } = await context.params;

    const userEmail = request.headers.get("x-user-email");
    const userId = request.headers.get("x-user-id");

    if (!userEmail || !userId) {
      return NextResponse.json({ error: "Missing user info" }, { status: 401 });
    }

    if (!isAdmin(userEmail)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing question ID" }, { status: 400 });
    }

    /* ===============================
       1️⃣ HR DELETE (UUID BASED)
    =============================== */
    const { data: hrDeleted } = await supabase
      .from("hr_questions")
      .delete()
      .eq("id", id)
      .select();

    if (hrDeleted?.length > 0) {
      return NextResponse.json({
        success: true,
        table: "hr_questions"
      });
    }

    /* ===============================
       2️⃣ FETCH MAIN QUESTION
    =============================== */
    const { data: question, error: fetchError } = await supabase
      .from("questions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const { type, question: questionText } = question;

    /* ===============================
       3️⃣ DELETE FROM TYPE TABLE
       (TEXT MATCH – SCHEMA LIMITATION)
    =============================== */
    const typeTableMap = {
      aptitude: "aptitude_questions",
      iq: "iq_questions",
      technical: "technical_mcq",
      eq: "eq_questions",
      interview: "interview_questions"
    };

    const typeTable = typeTableMap[type];

    if (typeTable) {
      await supabase
        .from(typeTable)
        .delete()
        .eq("question", questionText); // ⚠ schema limitation
    }

    /* ===============================
       4️⃣ DELETE FROM MAIN TABLE
    =============================== */
    await supabase
      .from("questions")
      .delete()
      .eq("id", id);

    return NextResponse.json({
      success: true,
      deletedFrom: ["questions", typeTable].filter(Boolean)
    });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}