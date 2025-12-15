// import { NextResponse } from "next/server";

// // JavaScript execution in a safe sandboxed environment
// function executeJavaScript(code, stdin = '') {
//   try {
//     let output = '';
//     let errorOutput = '';
    
//     // Create a safe console object
//     const safeConsole = {
//       log: (...args) => {
//         output += args.map(arg => 
//           typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
//         ).join(' ') + '\n';
//       },
//       error: (...args) => {
//         errorOutput += args.map(arg => 
//           typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
//         ).join(' ') + '\n';
//       },
//       warn: (...args) => {
//         output += 'Warning: ' + args.map(arg => 
//           typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
//         ).join(' ') + '\n';
//       }
//     };

//     // Basic security checks
//     const dangerousPatterns = [
//       'require(',
//       'import ',
//       'process.',
//       'global.',
//       '__dirname',
//       '__filename',
//       'Buffer.',
//       'setTimeout',
//       'setInterval',
//       'fetch(',
//       'XMLHttpRequest',
//       'eval(',
//       'Function(',
//       'constructor'
//     ];

//     for (const pattern of dangerousPatterns) {
//       if (code.includes(pattern)) {
//         return {
//           stdout: '',
//           stderr: `Restricted operation detected: ${pattern}`,
//           compile_output: '',
//           status: { description: 'Security Error' }
//         };
//       }
//     }

//     // Create execution context with limited globals
//     const context = {
//       console: safeConsole,
//       Math,
//       Date,
//       JSON,
//       String,
//       Number,
//       Boolean,
//       Array,
//       Object,
//       parseInt,
//       parseFloat,
//       isNaN,
//       isFinite,
//       encodeURIComponent,
//       decodeURIComponent,
//       // Add stdin as input if provided
//       input: stdin
//     };

//     // Wrap code in a function and execute
//     const wrappedCode = `
//       (function() {
//         ${code}
//       })();
//     `;

//     // Create function with limited scope
//     const func = new Function(
//       ...Object.keys(context),
//       `"use strict"; ${wrappedCode}`
//     );

//     // Execute with timeout
//     const startTime = Date.now();
//     const result = func(...Object.values(context));
//     const executionTime = Date.now() - startTime;

//     // Add result to output if it exists and wasn't logged
//     if (result !== undefined && !output.includes(String(result))) {
//       output += String(result) + '\n';
//     }

//     return {
//       stdout: output.trim(),
//       stderr: errorOutput.trim(),
//       compile_output: '',
//       status: { description: 'Accepted' },
//       time: executionTime + ' ms',
//       memory: null
//     };

//   } catch (error) {
//     return {
//       stdout: '',
//       stderr: error.message,
//       compile_output: '',
//       status: { description: 'Runtime Error' }
//     };
//   }
// }

// // Python-like execution (very basic simulation)
// function executePython(code, stdin = '') {
//   try {
//     let output = '';
    
//     // Very basic Python print statement simulation
//     const lines = code.split('\n');
    
//     for (const line of lines) {
//       const trimmedLine = line.trim();
      
//       // Handle print statements
//       const printMatch = trimmedLine.match(/^print\s*\(\s*([^)]+)\s*\)$/);
//       if (printMatch) {
//         let content = printMatch[1];
        
//         // Remove quotes from strings
//         if ((content.startsWith('"') && content.endsWith('"')) ||
//             (content.startsWith("'") && content.endsWith("'"))) {
//           content = content.slice(1, -1);
//         }
        
//         // Basic variable substitution (very limited)
//         content = content.replace(/\s*\+\s*/g, '');
        
//         output += content + '\n';
//         continue;
//       }
      
//       // Handle simple variable assignments (for demo)
//       const assignMatch = trimmedLine.match(/^(\w+)\s*=\s*(.+)$/);
//       if (assignMatch) {
//         // Just acknowledge assignment
//         continue;
//       }
      
//       // Handle basic math operations
//       const mathMatch = trimmedLine.match(/^(\d+\s*[\+\-\*\/]\s*\d+)$/);
//       if (mathMatch) {
//         try {
//           const result = eval(mathMatch[1]);
//           output += result + '\n';
//         } catch (e) {
//           // Ignore math errors
//         }
//       }
//     }
    
//     return {
//       stdout: output.trim() || 'Python code executed (basic simulation)',
//       stderr: '',
//       compile_output: 'Using Python simulation mode',
//       status: { description: 'Accepted' }
//     };
    
//   } catch (error) {
//     return {
//       stdout: '',
//       stderr: error.message,
//       compile_output: '',
//       status: { description: 'Runtime Error' }
//     };
//   }
// }

// // Generic code validator for other languages
// function validateCode(language_id, code) {
//   const languages = {
//     54: 'C++',
//     50: 'C',
//     62: 'Java',
//     67: 'Pascal',
//     78: 'Kotlin'
//   };
  
//   const languageName = languages[language_id] || 'Unknown';
  
//   // Basic syntax validation
//   let isValid = true;
//   let message = '';
  
//   // Check for basic syntax patterns
//   if (language_id === 54 || language_id === 50) { // C/C++
//     if (!code.includes('main') || !code.includes('{') || !code.includes('}')) {
//       isValid = false;
//       message = 'Missing main function or proper syntax';
//     }
//   } else if (language_id === 62) { // Java
//     if (!code.includes('class') || !code.includes('main')) {
//       isValid = false;
//       message = 'Missing class declaration or main method';
//     }
//   }
  
//   return {
//     stdout: isValid ? `${languageName} code syntax appears valid!` : '',
//     stderr: !isValid ? message : '',
//     compile_output: `${languageName} validation complete`,
//     status: { description: isValid ? 'Accepted' : 'Compile Error' }
//   };
// }

// export async function POST(req) {
//   try {
//     const { language_id, source_code, stdin } = await req.json();

//     // Validate required fields
//     if (!language_id || !source_code) {
//       return NextResponse.json(
//         { error: "Missing required fields: language_id and source_code" },
//         { status: 400 }
//       );
//     }

//     let result;

//     // Handle different programming languages
//     switch (language_id) {
//       case 63: // JavaScript (Node.js)
//         result = executeJavaScript(source_code, stdin);
//         break;
        
//       case 71: // Python
//         result = executePython(source_code, stdin);
//         break;
        
//       case 54: // C++
//       case 50: // C
//       case 62: // Java
//       case 67: // Pascal
//       case 78: // Kotlin
//         result = validateCode(language_id, source_code);
//         break;
        
//       default:
//         result = {
//           stdout: 'Language not supported in local environment',
//           stderr: `Language ID ${language_id} is not supported`,
//           compile_output: '',
//           status: { description: 'Language Error' }
//         };
//     }

//     return NextResponse.json(result);

//   } catch (error) {
//     console.error("Error in local code runner:", error);
    
//     return NextResponse.json(
//       { 
//         error: "Internal server error",
//         stdout: "",
//         stderr: "An error occurred while executing code locally",
//         compile_output: "",
//         status: { description: "Error" }
//       },
//       { status: 500 }
//     );
//   }
// }

// // GET method to return supported languages
// export async function GET() {
//   return NextResponse.json({
//     supported_languages: [
//       { 
//         id: 63, 
//         name: "JavaScript (Node.js)",
//         execution: "full",
//         description: "Full JavaScript execution with sandboxing"
//       },
//       { 
//         id: 71, 
//         name: "Python",
//         execution: "basic",
//         description: "Basic Python simulation (print statements, simple operations)"
//       },
//       { 
//         id: 62, 
//         name: "Java",
//         execution: "validation",
//         description: "Syntax validation only"
//       },
//       { 
//         id: 54, 
//         name: "C++",
//         execution: "validation",
//         description: "Syntax validation only"
//       },
//       { 
//         id: 50, 
//         name: "C",
//         execution: "validation",
//         description: "Syntax validation only"
//       }
//     ],
//     environment: "local",
//     security: "sandboxed",
//     api_key_required: false
//   });
// }







//working but not taking input
// app/api/code-runner/route.js
// import { NextResponse } from "next/server";

// // Judge0 API configuration - Try multiple endpoints
// const JUDGE0_ENDPOINTS = [
//   "https://judge0-ce.p.rapidapi.com",
//   "https://judge0.p.rapidapi.com",
//   "https://ce.judge0.com"
// ];

// const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || process.env.RAPIDAPI_KEY;
// let JUDGE0_API_URL = JUDGE0_ENDPOINTS[0]; // Start with first endpoint

// // Log configuration on startup
// console.log('🔧 Code Runner Configuration:');
// console.log('  API URL:', JUDGE0_API_URL);
// console.log('  API Key Found:', !!JUDGE0_API_KEY);
// console.log('  API Key Length:', JUDGE0_API_KEY?.length || 0);

// // Fallback: Local execution for JavaScript only
// function executeJavaScriptLocally(code, stdin = '') {
//   try {
//     let output = '';
//     let errorOutput = '';
    
//     const safeConsole = {
//       log: (...args) => {
//         output += args.map(arg => 
//           typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
//         ).join(' ') + '\n';
//       },
//       error: (...args) => {
//         errorOutput += args.map(arg => 
//           typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
//         ).join(' ') + '\n';
//       },
//       warn: (...args) => {
//         output += 'Warning: ' + args.map(arg => 
//           typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
//         ).join(' ') + '\n';
//       }
//     };

//     const dangerousPatterns = [
//       'require(',
//       'import ',
//       'process.',
//       'global.',
//       '__dirname',
//       '__filename',
//       'Buffer.',
//       'setTimeout',
//       'setInterval',
//       'fetch(',
//       'XMLHttpRequest',
//       'eval(',
//       'Function(',
//       'constructor'
//     ];

//     for (const pattern of dangerousPatterns) {
//       if (code.includes(pattern)) {
//         return {
//           stdout: '',
//           stderr: `Restricted operation detected: ${pattern}`,
//           compile_output: '',
//           status: { description: 'Security Error' },
//           time: null,
//           memory: null
//         };
//       }
//     }

//     const context = {
//       console: safeConsole,
//       Math,
//       Date,
//       JSON,
//       String,
//       Number,
//       Boolean,
//       Array,
//       Object,
//       parseInt,
//       parseFloat,
//       isNaN,
//       isFinite,
//       encodeURIComponent,
//       decodeURIComponent,
//       input: stdin
//     };

//     const wrappedCode = `
//       (function() {
//         ${code}
//       })();
//     `;

//     const func = new Function(
//       ...Object.keys(context),
//       `"use strict"; ${wrappedCode}`
//     );

//     const startTime = Date.now();
//     const result = func(...Object.values(context));
//     const executionTime = (Date.now() - startTime) / 1000;

//     if (result !== undefined && !output.includes(String(result))) {
//       output += String(result) + '\n';
//     }

//     return {
//       stdout: output.trim(),
//       stderr: errorOutput.trim(),
//       compile_output: '',
//       status: { description: 'Accepted' },
//       time: executionTime.toFixed(3) + 's',
//       memory: null
//     };

//   } catch (error) {
//     return {
//       stdout: '',
//       stderr: error.message,
//       compile_output: '',
//       status: { description: 'Runtime Error' },
//       time: null,
//       memory: null
//     };
//   }
// }

// // Submit code to Judge0 API with multiple endpoint fallback
// async function submitToJudge0(languageId, sourceCode, stdin = '') {
//   let lastError = null;
  
//   // Try each endpoint until one works
//   for (const endpoint of JUDGE0_ENDPOINTS) {
//     try {
//       console.log(`🚀 Trying Judge0 endpoint: ${endpoint}`);
      
//       const isRapidAPI = endpoint.includes('rapidapi');
//       const headers = {
//         'Content-Type': 'application/json',
//       };
      
//       // Add RapidAPI headers if using RapidAPI endpoint
//       if (isRapidAPI) {
//         headers['X-RapidAPI-Key'] = JUDGE0_API_KEY;
//         headers['X-RapidAPI-Host'] = endpoint.replace('https://', '');
//       }
      
//       // Submit with wait=true for immediate results
//       const submitResponse = await fetch(
//         `${endpoint}/submissions?base64_encoded=false&wait=true&fields=*`,
//         {
//           method: 'POST',
//           headers: headers,
//           body: JSON.stringify({
//             language_id: languageId,
//             source_code: sourceCode,
//             stdin: stdin || '',
//             cpu_time_limit: 5,
//             memory_limit: 128000,
//           }),
//         }
//       );

//       console.log('📡 Judge0 Response Status:', submitResponse.status);

//       if (!submitResponse.ok) {
//         const errorText = await submitResponse.text();
//         console.error(`❌ Judge0 Error from ${endpoint}:`, errorText);
        
//         let errorMessage = errorText;
//         try {
//           const errorJson = JSON.parse(errorText);
//           errorMessage = errorJson.message || errorJson.error || errorText;
//         } catch (e) {
//           // Keep original error text
//         }
        
//         throw new Error(`Judge0 API Error (${submitResponse.status}): ${errorMessage}`);
//       }

//       const result = await submitResponse.json();
//       console.log('✅ Judge0 Result:', {
//         status: result.status?.description,
//         hasOutput: !!result.stdout,
//         hasError: !!result.stderr,
//         endpoint: endpoint
//       });

//       // Success! Update the working endpoint
//       JUDGE0_API_URL = endpoint;
//       return formatJudge0Result(result);
      
//     } catch (error) {
//       console.error(`❌ Failed with ${endpoint}:`, error.message);
//       lastError = error;
//       // Continue to next endpoint
//     }
//   }
  
//   // All endpoints failed
//   console.error('❌ All Judge0 endpoints failed');
//   throw lastError || new Error('All Judge0 endpoints unavailable');
// }

// // Format Judge0 result to match our expected format
// function formatJudge0Result(result) {
//   return {
//     stdout: result.stdout || '',
//     stderr: result.stderr || result.message || '',
//     compile_output: result.compile_output || '',
//     status: result.status || { description: 'Unknown' },
//     time: result.time ? result.time + 's' : null,
//     memory: result.memory ? Math.round(result.memory) : null
//   };
// }

// // Get language name helper
// function getLanguageName(languageId) {
//   const languages = {
//     63: "JavaScript",
//     71: "Python 3",
//     62: "Java",
//     54: "C++",
//     50: "C",
//     51: "C#",
//     78: "Kotlin",
//     68: "PHP",
//     72: "Ruby",
//     73: "Rust",
//     74: "TypeScript"
//   };
//   return languages[languageId] || `Language ${languageId}`;
// }

// export async function POST(req) {
//   try {
//     const { language_id, source_code, stdin } = await req.json();

//     console.log('\n🎯 Code Execution Request:', {
//       language: getLanguageName(language_id),
//       language_id,
//       code_length: source_code?.length || 0,
//       has_stdin: !!stdin
//     });

//     if (!language_id || !source_code) {
//       return NextResponse.json(
//         { error: "Missing required fields: language_id and source_code" },
//         { status: 400 }
//       );
//     }

//     // Check if Judge0 API key is available
//     if (!JUDGE0_API_KEY) {
//       console.warn('⚠️ No Judge0 API key found');
      
//       if (language_id === 63) {
//         console.log('📝 Falling back to local JavaScript execution');
//         const result = executeJavaScriptLocally(source_code, stdin);
//         return NextResponse.json(result);
//       }
      
//       return NextResponse.json({
//         error: "API key required",
//         stdout: "",
//         stderr: `Judge0 API key not configured. JavaScript runs locally, but ${getLanguageName(language_id)} requires Judge0 API.`,
//         compile_output: "",
//         status: { description: "Configuration Required" },
//         time: null,
//         memory: null
//       }, { status: 503 });
//     }

//     // Try Judge0 API
//     try {
//       const result = await submitToJudge0(language_id, source_code, stdin || '');
//       console.log('✅ Execution successful\n');
//       return NextResponse.json(result);
      
//     } catch (judge0Error) {
//       console.error('⚠️ Judge0 API failed:', judge0Error.message);
      
//       // Fallback to local execution for JavaScript only
//       if (language_id === 63) {
//         console.log('📝 Falling back to local JavaScript execution');
//         const result = executeJavaScriptLocally(source_code, stdin);
//         return NextResponse.json(result);
//       }
      
//       // For other languages, return the error
//       return NextResponse.json({
//         error: "Judge0 API Error",
//         stdout: "",
//         stderr: `Failed to execute ${getLanguageName(language_id)} code: ${judge0Error.message}`,
//         compile_output: "",
//         status: { description: "Service Error" },
//         time: null,
//         memory: null
//       }, { status: 503 });
//     }

//   } catch (error) {
//     console.error("❌ Code Runner Error:", error);
    
//     return NextResponse.json(
//       { 
//         error: "Internal server error",
//         stdout: "",
//         stderr: `An error occurred: ${error.message}`,
//         compile_output: "",
//         status: { description: "Error" },
//         time: null,
//         memory: null
//       },
//       { status: 500 }
//     );
//   }
// }

// // GET method to check configuration and supported languages
// export async function GET() {
//   const isJudge0Configured = !!JUDGE0_API_KEY;
  
//   // Test all Judge0 endpoints if configured
//   let judge0Status = 'not_configured';
//   let errorMessage = null;
//   let workingEndpoint = null;
  
//   if (isJudge0Configured) {
//     for (const endpoint of JUDGE0_ENDPOINTS) {
//       try {
//         console.log(`🧪 Testing endpoint: ${endpoint}`);
        
//         const isRapidAPI = endpoint.includes('rapidapi');
//         const headers = {};
        
//         if (isRapidAPI) {
//           headers['X-RapidAPI-Key'] = JUDGE0_API_KEY;
//           headers['X-RapidAPI-Host'] = endpoint.replace('https://', '');
//         }
        
//         const testResponse = await fetch(`${endpoint}/languages`, {
//           method: 'GET',
//           headers: headers,
//         });
        
//         if (testResponse.ok) {
//           judge0Status = 'working';
//           workingEndpoint = endpoint;
//           JUDGE0_API_URL = endpoint;
//           console.log(`✅ Judge0 API is working at: ${endpoint}`);
//           break; // Stop testing once we find a working endpoint
//         } else {
//           const errorText = await testResponse.text();
//           console.log(`⚠️ Endpoint ${endpoint} returned ${testResponse.status}`);
//         }
//       } catch (error) {
//         console.log(`⚠️ Endpoint ${endpoint} failed:`, error.message);
//       }
//     }
    
//     if (judge0Status !== 'working') {
//       judge0Status = 'error';
//       errorMessage = 'All Judge0 endpoints failed. Check your API key and internet connection.';
//       console.error('❌ All Judge0 endpoints failed');
//     }
//   }
  
//   return NextResponse.json({
//     judge0_configured: isJudge0Configured,
//     judge0_status: judge0Status,
//     api_endpoint: workingEndpoint || JUDGE0_ENDPOINTS[0],
//     tested_endpoints: JUDGE0_ENDPOINTS,
//     error_message: errorMessage,
//     supported_languages: [
//       { id: 63, name: "JavaScript (Node.js)", execution: isJudge0Configured ? "judge0" : "local" },
//       { id: 71, name: "Python 3", execution: judge0Status === 'working' ? "judge0" : "unavailable" },
//       { id: 62, name: "Java", execution: judge0Status === 'working' ? "judge0" : "unavailable" },
//       { id: 54, name: "C++ (GCC 9.2.0)", execution: judge0Status === 'working' ? "judge0" : "unavailable" },
//       { id: 50, name: "C (GCC 9.2.0)", execution: judge0Status === 'working' ? "judge0" : "unavailable" },
//       { id: 51, name: "C# (Mono 6.6.0.161)", execution: judge0Status === 'working' ? "judge0" : "unavailable" },
//       { id: 78, name: "Kotlin", execution: judge0Status === 'working' ? "judge0" : "unavailable" },
//       { id: 68, name: "PHP", execution: judge0Status === 'working' ? "judge0" : "unavailable" },
//       { id: 72, name: "Ruby", execution: judge0Status === 'working' ? "judge0" : "unavailable" },
//       { id: 73, name: "Rust", execution: judge0Status === 'working' ? "judge0" : "unavailable" },
//       { id: 74, name: "TypeScript", execution: judge0Status === 'working' ? "judge0" : "unavailable" },
//     ],
//     setup_instructions: judge0Status !== 'working' ? {
//       message: judge0Status === 'not_configured' 
//         ? "Judge0 API key not found"
//         : "Judge0 API configured but not working",
//       documentation: "https://rapidapi.com/judge0-official/api/judge0-ce",
//       current_error: errorMessage,
//       troubleshooting: [
//         "1. Verify your API key is correct in .env.local",
//         "2. Check if you're subscribed to Judge0 on RapidAPI",
//         "3. Make sure your firewall/antivirus allows API requests",
//         "4. Try using a VPN if your network blocks external APIs",
//         "5. Check RapidAPI dashboard for rate limits or billing issues"
//       ]
//     } : null
//   });
// }




// app/api/code-runner/route.js
import { NextResponse } from "next/server";

// Judge0 API configuration - Try multiple endpoints
const JUDGE0_ENDPOINTS = [
  "https://judge0-ce.p.rapidapi.com",
  "https://judge0.p.rapidapi.com",
  "https://ce.judge0.com"
];

const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || process.env.RAPIDAPI_KEY;
let JUDGE0_API_URL = JUDGE0_ENDPOINTS[0]; // Start with first endpoint

// Log configuration on startup
console.log('🔧 Code Runner Configuration:');
console.log('  API URL:', JUDGE0_API_URL);
console.log('  API Key Found:', !!JUDGE0_API_KEY);
console.log('  API Key Length:', JUDGE0_API_KEY?.length || 0);

// Fallback: Local execution for JavaScript only
function executeJavaScriptLocally(code, stdin = '') {
  try {
    let output = '';
    let errorOutput = '';
    
    // Split stdin into lines for easier access
    const inputLines = stdin ? stdin.trim().split('\n') : [];
    let inputIndex = 0;
    
    // Helper function to read input
    const readline = () => {
      if (inputIndex < inputLines.length) {
        return inputLines[inputIndex++];
      }
      return '';
    };
    
    const safeConsole = {
      log: (...args) => {
        output += args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ') + '\n';
      },
      error: (...args) => {
        errorOutput += args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ') + '\n';
      },
      warn: (...args) => {
        output += 'Warning: ' + args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ') + '\n';
      }
    };

    const dangerousPatterns = [
      'require(',
      'import ',
      'process.',
      'global.',
      '__dirname',
      '__filename',
      'Buffer.',
      'setTimeout',
      'setInterval',
      'fetch(',
      'XMLHttpRequest',
      'eval(',
      'Function(',
      'constructor'
    ];

    for (const pattern of dangerousPatterns) {
      if (code.includes(pattern)) {
        return {
          stdout: '',
          stderr: `Restricted operation detected: ${pattern}`,
          compile_output: '',
          status: { description: 'Security Error' },
          time: null,
          memory: null
        };
      }
    }

    const context = {
      console: safeConsole,
      Math,
      Date,
      JSON,
      String,
      Number,
      Boolean,
      Array,
      Object,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      encodeURIComponent,
      decodeURIComponent,
      // Provide input access methods
      input: stdin,
      inputLines: inputLines,
      readline: readline,
      // Node.js-like prompt (reads next line)
      prompt: (msg) => {
        if (msg) output += msg;
        return readline();
      }
    };

    const wrappedCode = `
      (function() {
        ${code}
      })();
    `;

    const func = new Function(
      ...Object.keys(context),
      `"use strict"; ${wrappedCode}`
    );

    const startTime = Date.now();
    const result = func(...Object.values(context));
    const executionTime = (Date.now() - startTime) / 1000;

    if (result !== undefined && !output.includes(String(result))) {
      output += String(result) + '\n';
    }

    return {
      stdout: output.trim(),
      stderr: errorOutput.trim(),
      compile_output: '',
      status: { description: 'Accepted' },
      time: executionTime.toFixed(3) + 's',
      memory: null
    };

  } catch (error) {
    return {
      stdout: '',
      stderr: error.message,
      compile_output: '',
      status: { description: 'Runtime Error' },
      time: null,
      memory: null
    };
  }
}

// Submit code to Judge0 API with multiple endpoint fallback
async function submitToJudge0(languageId, sourceCode, stdin = '') {
  let lastError = null;
  
  // Try each endpoint until one works
  for (const endpoint of JUDGE0_ENDPOINTS) {
    try {
      console.log(`🚀 Trying Judge0 endpoint: ${endpoint}`);
      
      const isRapidAPI = endpoint.includes('rapidapi');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add RapidAPI headers if using RapidAPI endpoint
      if (isRapidAPI) {
        headers['X-RapidAPI-Key'] = JUDGE0_API_KEY;
        headers['X-RapidAPI-Host'] = endpoint.replace('https://', '');
      }
      
      // Submit with wait=true for immediate results
      const submitResponse = await fetch(
        `${endpoint}/submissions?base64_encoded=false&wait=true&fields=*`,
        {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            language_id: languageId,
            source_code: sourceCode,
            stdin: stdin || '',
            cpu_time_limit: 5,
            memory_limit: 128000,
          }),
        }
      );

      console.log('📡 Judge0 Response Status:', submitResponse.status);

      if (!submitResponse.ok) {
        const errorText = await submitResponse.text();
        console.error(`❌ Judge0 Error from ${endpoint}:`, errorText);
        
        let errorMessage = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorText;
        } catch (e) {
          // Keep original error text
        }
        
        throw new Error(`Judge0 API Error (${submitResponse.status}): ${errorMessage}`);
      }

      const result = await submitResponse.json();
      console.log('✅ Judge0 Result:', {
        status: result.status?.description,
        hasOutput: !!result.stdout,
        hasError: !!result.stderr,
        endpoint: endpoint
      });

      // Success! Update the working endpoint
      JUDGE0_API_URL = endpoint;
      return formatJudge0Result(result);
      
    } catch (error) {
      console.error(`❌ Failed with ${endpoint}:`, error.message);
      lastError = error;
      // Continue to next endpoint
    }
  }
  
  // All endpoints failed
  console.error('❌ All Judge0 endpoints failed');
  throw lastError || new Error('All Judge0 endpoints unavailable');
}

// Format Judge0 result to match our expected format
function formatJudge0Result(result) {
  return {
    stdout: result.stdout || '',
    stderr: result.stderr || result.message || '',
    compile_output: result.compile_output || '',
    status: result.status || { description: 'Unknown' },
    time: result.time ? result.time + 's' : null,
    memory: result.memory ? Math.round(result.memory) : null
  };
}

// Get language name helper
function getLanguageName(languageId) {
  const languages = {
    63: "JavaScript",
    71: "Python 3",
    62: "Java",
    54: "C++",
    50: "C",
    51: "C#",
    78: "Kotlin",
    68: "PHP",
    72: "Ruby",
    73: "Rust",
    74: "TypeScript"
  };
  return languages[languageId] || `Language ${languageId}`;
}

export async function POST(req) {
  try {
    const { language_id, source_code, stdin } = await req.json();

    console.log('\n🎯 Code Execution Request:', {
      language: getLanguageName(language_id),
      language_id,
      code_length: source_code?.length || 0,
      has_stdin: !!stdin
    });

    if (!language_id || !source_code) {
      return NextResponse.json(
        { error: "Missing required fields: language_id and source_code" },
        { status: 400 }
      );
    }

    // Check if Judge0 API key is available
    if (!JUDGE0_API_KEY) {
      console.warn('⚠️ No Judge0 API key found');
      
      if (language_id === 63) {
        console.log('📝 Falling back to local JavaScript execution');
        const result = executeJavaScriptLocally(source_code, stdin);
        return NextResponse.json(result);
      }
      
      return NextResponse.json({
        error: "API key required",
        stdout: "",
        stderr: `Judge0 API key not configured. JavaScript runs locally, but ${getLanguageName(language_id)} requires Judge0 API.`,
        compile_output: "",
        status: { description: "Configuration Required" },
        time: null,
        memory: null
      }, { status: 503 });
    }

    // Try Judge0 API
    try {
      const result = await submitToJudge0(language_id, source_code, stdin || '');
      console.log('✅ Execution successful\n');
      return NextResponse.json(result);
      
    } catch (judge0Error) {
      console.error('⚠️ Judge0 API failed:', judge0Error.message);
      
      // Fallback to local execution for JavaScript only
      if (language_id === 63) {
        console.log('📝 Falling back to local JavaScript execution');
        const result = executeJavaScriptLocally(source_code, stdin);
        return NextResponse.json(result);
      }
      
      // For other languages, return the error
      return NextResponse.json({
        error: "Judge0 API Error",
        stdout: "",
        stderr: `Failed to execute ${getLanguageName(language_id)} code: ${judge0Error.message}`,
        compile_output: "",
        status: { description: "Service Error" },
        time: null,
        memory: null
      }, { status: 503 });
    }

  } catch (error) {
    console.error("❌ Code Runner Error:", error);
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        stdout: "",
        stderr: `An error occurred: ${error.message}`,
        compile_output: "",
        status: { description: "Error" },
        time: null,
        memory: null
      },
      { status: 500 }
    );
  }
}

// GET method to check configuration and supported languages
export async function GET() {
  const isJudge0Configured = !!JUDGE0_API_KEY;
  
  // Test all Judge0 endpoints if configured
  let judge0Status = 'not_configured';
  let errorMessage = null;
  let workingEndpoint = null;
  
  if (isJudge0Configured) {
    for (const endpoint of JUDGE0_ENDPOINTS) {
      try {
        console.log(`🧪 Testing endpoint: ${endpoint}`);
        
        const isRapidAPI = endpoint.includes('rapidapi');
        const headers = {};
        
        if (isRapidAPI) {
          headers['X-RapidAPI-Key'] = JUDGE0_API_KEY;
          headers['X-RapidAPI-Host'] = endpoint.replace('https://', '');
        }
        
        const testResponse = await fetch(`${endpoint}/languages`, {
          method: 'GET',
          headers: headers,
        });
        
        if (testResponse.ok) {
          judge0Status = 'working';
          workingEndpoint = endpoint;
          JUDGE0_API_URL = endpoint;
          console.log(`✅ Judge0 API is working at: ${endpoint}`);
          break; // Stop testing once we find a working endpoint
        } else {
          const errorText = await testResponse.text();
          console.log(`⚠️ Endpoint ${endpoint} returned ${testResponse.status}`);
        }
      } catch (error) {
        console.log(`⚠️ Endpoint ${endpoint} failed:`, error.message);
      }
    }
    
    if (judge0Status !== 'working') {
      judge0Status = 'error';
      errorMessage = 'All Judge0 endpoints failed. Check your API key and internet connection.';
      console.error('❌ All Judge0 endpoints failed');
    }
  }
  
  return NextResponse.json({
    judge0_configured: isJudge0Configured,
    judge0_status: judge0Status,
    api_endpoint: workingEndpoint || JUDGE0_ENDPOINTS[0],
    tested_endpoints: JUDGE0_ENDPOINTS,
    error_message: errorMessage,
    supported_languages: [
      { id: 63, name: "JavaScript (Node.js)", execution: isJudge0Configured ? "judge0" : "local" },
      { id: 71, name: "Python 3", execution: judge0Status === 'working' ? "judge0" : "unavailable" },
      { id: 62, name: "Java", execution: judge0Status === 'working' ? "judge0" : "unavailable" },
      { id: 54, name: "C++ (GCC 9.2.0)", execution: judge0Status === 'working' ? "judge0" : "unavailable" },
      { id: 50, name: "C (GCC 9.2.0)", execution: judge0Status === 'working' ? "judge0" : "unavailable" },
      { id: 51, name: "C# (Mono 6.6.0.161)", execution: judge0Status === 'working' ? "judge0" : "unavailable" },
      { id: 78, name: "Kotlin", execution: judge0Status === 'working' ? "judge0" : "unavailable" },
      { id: 68, name: "PHP", execution: judge0Status === 'working' ? "judge0" : "unavailable" },
      { id: 72, name: "Ruby", execution: judge0Status === 'working' ? "judge0" : "unavailable" },
      { id: 73, name: "Rust", execution: judge0Status === 'working' ? "judge0" : "unavailable" },
      { id: 74, name: "TypeScript", execution: judge0Status === 'working' ? "judge0" : "unavailable" },
    ],
    setup_instructions: judge0Status !== 'working' ? {
      message: judge0Status === 'not_configured' 
        ? "Judge0 API key not found"
        : "Judge0 API configured but not working",
      documentation: "https://rapidapi.com/judge0-official/api/judge0-ce",
      current_error: errorMessage,
      troubleshooting: [
        "1. Verify your API key is correct in .env.local",
        "2. Check if you're subscribed to Judge0 on RapidAPI",
        "3. Make sure your firewall/antivirus allows API requests",
        "4. Try using a VPN if your network blocks external APIs",
        "5. Check RapidAPI dashboard for rate limits or billing issues"
      ]
    } : null
  });
}
