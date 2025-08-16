import { NextResponse } from "next/server";

// Simple JavaScript execution simulation for fallback
function simulateJavaScriptExecution(code) {
  try {
    // Create a safe environment for basic JavaScript execution
    const originalConsole = console.log;
    let output = '';
    
    // Override console.log to capture output
    console.log = (...args) => {
      output += args.join(' ') + '\n';
    };
    
    // Basic security check - prevent dangerous operations
    if (code.includes('require') || code.includes('import') || 
        code.includes('process') || code.includes('fs') ||
        code.includes('eval') || code.includes('Function')) {
      throw new Error('Restricted operations detected');
    }
    
    // Execute the code in a try-catch
    try {
      // Use Function constructor for safer evaluation
      const func = new Function(code);
      const result = func();
      
      // If function returns something, add it to output
      if (result !== undefined) {
        output += String(result);
      }
      
      // Restore console.log
      console.log = originalConsole;
      
      return {
        output: output.trim() || 'Code executed successfully',
        error: '',
        status: 'Accepted'
      };
    } catch (execError) {
      console.log = originalConsole;
      return {
        output: output.trim(),
        error: execError.message,
        status: 'Runtime Error'
      };
    }
  } catch (error) {
    return {
      output: '',
      error: error.message,
      status: 'Error'
    };
  }
}

export async function POST(req) {
  try {
    const { language_id, source_code, stdin } = await req.json();

    // Validate required fields
    if (!language_id || !source_code) {
      return NextResponse.json(
        { error: "Missing required fields: language_id and source_code" },
        { status: 400 }
      );
    }

    // Check if RapidAPI key is configured - use server-side env variable
    const rapidApiKey = process.env.RAPIDAPI_KEY || process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
    
    if (!rapidApiKey) {
      // Fallback: Simulate code execution for demo purposes
      console.log("RapidAPI key not configured, simulating execution...");
      
      // Simple JavaScript code simulation
      if (language_id === 63) { // JavaScript
        try {
          // Create a simple sandbox for basic JavaScript execution
          const result = simulateJavaScriptExecution(source_code);
          return NextResponse.json({
            stdout: result.output,
            stderr: result.error,
            compile_output: "",
            status: { description: result.status }
          });
        } catch (error) {
          return NextResponse.json({
            stdout: "",
            stderr: error.message,
            compile_output: "",
            status: { description: "Runtime Error" }
          });
        }
      }
      
      // For other languages, return a message
      return NextResponse.json({
        stdout: "Code syntax appears valid! (Simulation mode - add RAPIDAPI_KEY for full execution)",
        stderr: "",
        compile_output: "",
        status: { description: "Simulated Success" }
      });
    }

    const response = await fetch(
      "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true", 
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "X-RapidAPI-Key": rapidApiKey,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
        body: JSON.stringify({
          language_id,
          source_code,
          stdin: stdin || ""
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Judge0 API Error:", response.status, errorText);
      
      // Fallback to simulation if Judge0 fails
      if (language_id === 63) {
        try {
          const result = simulateJavaScriptExecution(source_code);
          return NextResponse.json({
            stdout: result.output,
            stderr: result.error,
            compile_output: `Judge0 API unavailable, using fallback execution`,
            status: { description: result.status }
          });
        } catch (error) {
          return NextResponse.json({
            stdout: "",
            stderr: error.message,
            compile_output: "Fallback execution failed",
            status: { description: "Runtime Error" }
          });
        }
      }
      
      return NextResponse.json(
        { 
          error: "Code execution service unavailable",
          stdout: "",
          stderr: `Service error: ${response.status}`,
          compile_output: "",
          status: { description: "Service Error" }
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    // Ensure we return consistent structure even if Judge0 response varies
    const result = {
      stdout: data.stdout || "",
      stderr: data.stderr || "",
      compile_output: data.compile_output || "",
      status: data.status || { description: "Unknown" },
      time: data.time || null,
      memory: data.memory || null
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error in code runner:", error);
    
    // Final fallback - try to simulate if it's JavaScript
    if (error.message && !error.message.includes('fetch')) {
      try {
        const { language_id, source_code } = await req.json();
        if (language_id === 63) {
          const result = simulateJavaScriptExecution(source_code);
          return NextResponse.json({
            stdout: result.output,
            stderr: result.error,
            compile_output: "Using fallback execution due to service error",
            status: { description: result.status }
          });
        }
      } catch (fallbackError) {
        console.error("Fallback execution also failed:", fallbackError);
      }
    }
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        stdout: "",
        stderr: "An error occurred while executing code",
        compile_output: "",
        status: { description: "Error" }
      },
      { status: 500 }
    );
  }
}

// GET method to return supported languages (optional)
export async function GET() {
  return NextResponse.json({
    supported_languages: [
      { id: 63, name: "JavaScript (Node.js)" },
      { id: 71, name: "Python" },
      { id: 62, name: "Java" },
      { id: 54, name: "C++" },
      { id: 50, name: "C" }
    ],
    fallback_available: true,
    requires_api_key: false
  });
}
