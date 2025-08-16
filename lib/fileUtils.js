// lib/fileUtils.js
import mammoth from 'mammoth';

export async function extractTextFromFile(fileUrl) {
  console.log('Extracting text from file:', fileUrl);
  
  try {
    // Add timeout to fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(fileUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'NextJS-App/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    console.log('File content type:', contentType);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = fileUrl.toLowerCase();
    
    console.log('File size:', buffer.length, 'bytes');
    
    if (fileName.endsWith('.txt')) {
      console.log('Processing TXT file');
      const text = buffer.toString('utf-8');
      console.log('Extracted text length:', text.length);
      return text;
    } 
    else if (fileName.endsWith('.docx')) {
      console.log('Processing DOCX file');
      try {
        const { value } = await mammoth.extractRawText({ buffer });
        console.log('Extracted text length:', value.length);
        return value;
      } catch (mammothError) {
        console.error('Mammoth extraction error:', mammothError);
        throw new Error(`Failed to extract text from DOCX: ${mammothError.message}`);
      }
    }
    else if (fileName.endsWith('.doc')) {
      console.log('Processing DOC file');
      // For older .doc files, mammoth can still try
      try {
        const { value } = await mammoth.extractRawText({ buffer });
        console.log('Extracted text length:', value.length);
        return value;
      } catch (mammothError) {
        console.error('Mammoth extraction error for DOC:', mammothError);
        return "Old DOC format detected. Please convert to DOCX or provide text in the text area for better evaluation.";
      }
    }
    else if (fileName.endsWith('.pdf')) {
      console.log('Processing PDF file - limited support');
      // For production, you would install pdf-parse:
      // npm install pdf-parse
      // Then uncomment below:
      
      /*
      try {
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(buffer);
        console.log('Extracted PDF text length:', data.text.length);
        return data.text;
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        return "PDF file uploaded but text extraction failed. Please also provide text summary in the text area for evaluation.";
      }
      */
      
      return "PDF file uploaded. Please also provide text summary in the text area for evaluation, as PDF parsing is not yet configured.";
    }
    else {
      throw new Error(`Unsupported file format. File: ${fileName}. Please use TXT, DOC, DOCX, or PDF files.`);
    }
    
  } catch (error) {
    console.error('File extraction error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      fileUrl: fileUrl
    });
    
    if (error.name === 'AbortError') {
      throw new Error('File download timeout. Please try with a smaller file or check your internet connection.');
    }
    
    if (error.message.includes('fetch')) {
      throw new Error(`Failed to download file: ${error.message}. Please check if the file URL is accessible.`);
    }
    
    throw new Error(`Failed to extract text from file: ${error.message}`);
  }
}