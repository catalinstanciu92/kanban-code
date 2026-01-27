// Script to start the server on a different port to avoid conflicts
import { $ } from 'bun';

// Set different port numbers to avoid conflicts
process.env.PORT = '8080';
process.env.BROWSER_PUBLIC_VITE_API_URL = 'http://localhost:8080';

// Start the server
const server = Bun.serve({
  port: 8080,
  async fetch(req) {
    // Simple fallback to avoid errors
    return new Response("Server started on port 8080", { status: 200 });
  }
});

console.log(`Server running on http://localhost:${server.port}`);