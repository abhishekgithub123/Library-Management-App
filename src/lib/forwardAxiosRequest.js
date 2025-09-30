import { URL } from 'url';

export async function forwardAxiosRequest(
  method,
  baseUrl,
  request,
  data = null
) {
  const headers = {};

  // Copy headers from the incoming request, excluding problematic ones
  const excludedHeaders = new Set([
    'host',
    'connection',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'te',
    'trailers',
    'transfer-encoding',
    'upgrade',
    'content-length', // Let fetch calculate this automatically
    'content-encoding' // Let fetch handle encoding
  ]);

  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (!excludedHeaders.has(lowerKey)) {
      headers[key] = value;
    }
  });

  // Extract query params
  const reqUrl = new URL(request.url, `http://localhost`); // Provide base for relative URLs
  const queryString = reqUrl.search;
  const fullUrl = `${process.env.NEXT_PUBLIC_BASE_API_URL}${baseUrl}${queryString}`;

  const fetchOptions = {
    method: method.toUpperCase(),
    headers: new Headers(headers),
  };

  // Handle body for methods that support it
  const methodsWithBody = ['POST', 'PUT', 'PATCH', 'DELETE'];
  const upperMethod = method.toUpperCase();

  if (methodsWithBody.includes(upperMethod)) {
    // Priority 1: Use provided data parameter
    if (data !== null && data !== undefined) {
      if (data instanceof FormData) {
        // Let browser set content-type boundary for FormData
        fetchOptions.body = data;
        fetchOptions.headers.delete('content-type');
      } else if (data instanceof URLSearchParams) {
        fetchOptions.body = data.toString();
        fetchOptions.headers.set('Content-Type', 'application/x-www-form-urlencoded');
      } else if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
        fetchOptions.body = data;
        if (!fetchOptions.headers.get('content-type')) {
          fetchOptions.headers.set('Content-Type', 'application/octet-stream');
        }
      } else if (data instanceof Blob) {
        fetchOptions.body = data;
        if (!fetchOptions.headers.get('content-type')) {
          fetchOptions.headers.set('Content-Type', data.type || 'application/octet-stream');
        }
      } else if (data instanceof ReadableStream) {
        fetchOptions.body = data;
      } else if (typeof data === 'string') {
        fetchOptions.body = data;
        // Only set content-type if not already set
        if (!fetchOptions.headers.get('content-type')) {
          // Try to detect if it's JSON
          try {
            JSON.parse(data);
            fetchOptions.headers.set('Content-Type', 'application/json');
          } catch {
            fetchOptions.headers.set('Content-Type', 'text/plain');
          }
        }
      } else {
        // Assume it's an object/array - serialize to JSON
        fetchOptions.body = JSON.stringify(data);
        fetchOptions.headers.set('Content-Type', 'application/json');
      }
    } 
    // Priority 2: Try to read from request body if no data provided
    else if (request.body) {
      try {
        // For requests with body, we need to be careful about content-length
        const contentLength = request.headers.get('content-length');
        
        // Read the body as stream to avoid double-processing
        const reader = request.body.getReader();
        const chunks = [];
        let totalLength = 0;
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          totalLength += value.length;
        }
        
        // Combine chunks into single buffer
        const bodyBuffer = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          bodyBuffer.set(chunk, offset);
          offset += chunk.length;
        }
        
        // Set the body and let fetch calculate content-length
        fetchOptions.body = bodyBuffer;
        
        // Preserve original content-type if it exists
        const originalContentType = request.headers.get('content-type');
        if (originalContentType && !fetchOptions.headers.get('content-type')) {
          fetchOptions.headers.set('Content-Type', originalContentType);
        }
        
      } catch (error) {
        console.warn('Failed to read request body:', error);
        // Continue without body
      }
    }
  }

  try {
    const response = await fetch(fullUrl, fetchOptions);

    // Handle response headers
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      
      // Handle multiple set-cookie headers properly
      if (lowerKey === 'set-cookie') {
        responseHeaders.append('set-cookie', value);
      } else {
        responseHeaders.set(key, value);
      }
    });

    // Handle 304 Not Modified
    if (response.status === 304) {
      return new Response(null, {
        status: 304,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    }

    // Handle different response types based on content-type
    const contentType = response.headers.get('content-type') || '';
    let responseData;
    let processedData;

    if (contentType.includes('application/json')) {
      responseData = await response.json();
      processedData = JSON.stringify(responseData);
    } else if (contentType.includes('text/') || contentType.includes('application/xml')) {
      processedData = await response.text();
    } else if (contentType.includes('application/octet-stream') || 
               contentType.includes('image/') || 
               contentType.includes('video/') || 
               contentType.includes('audio/')) {
      // Return binary data as-is
      processedData = await response.arrayBuffer();
    } else {
      // Default to text for unknown types
      processedData = await response.text();
    }

    return new Response(processedData, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

  } catch (error) {    
    const errorResponse = {
      error: true,
      message: error.message || 'Request forwarding failed',
      status: error.name === 'TypeError' ? 503 : 500, // Network errors are usually service unavailable
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(errorResponse), {
      status: errorResponse.status,
      statusText: error.name === 'TypeError' ? 'Service Unavailable' : 'Internal Server Error',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
    });
  }
}