#!/usr/bin/env python3
"""
Simple local HTTP server for PWA testing.

Run this script to serve the PWA locally on http://localhost:8000
"""

import http.server
import socketserver
import os
from pathlib import Path

PORT = 8000

class PWAHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        # Add PWA headers
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()
    
    def handle_one_request(self):
        """Override to handle TLS handshake attempts and provide helpful error."""
        try:
            return super().handle_one_request()
        except (UnicodeDecodeError, ValueError) as e:
            # These often occur with TLS handshake attempts
            # Check if it's likely a TLS attempt by looking at error content
            error_str = str(e)
            if 'Bad request' in error_str or 'Bad HTTP' in error_str:
                # Send a helpful response for HTTPS attempts
                self.send_error_response("HTTPS_NOT_SUPPORTED")
                return
            # Check if the error involves binary data (TLS handshakes)
            if '\\x16' in error_str or '0x16' in error_str:
                self.send_error_response("HTTPS_NOT_SUPPORTED")
                return
            raise  # Re-raise other errors
        except Exception as e:
            # Silently ignore TLS/SSL handshake errors
            error_str = str(e)
            if 'Bad request' in error_str or 'Bad HTTP' in error_str or 'Bad request syntax' in error_str:
                self.send_error_response("HTTPS_NOT_SUPPORTED")
                return
            raise  # Re-raise other errors
    
    def send_error_response(self, error_type):
        """Send a helpful error response for common issues."""
        if error_type == "HTTPS_NOT_SUPPORTED":
            try:
                self.send_response(400)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.end_headers()
                message = """
                <html>
                <head><title>Use HTTP, not HTTPS</title></head>
                <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
                    <h1>⚠️ HTTPS Not Supported</h1>
                    <p>This local server only supports <strong>HTTP</strong>, not HTTPS.</p>
                    <p>Please use: <a href="http://localhost:8000" style="color: #0066cc;">http://localhost:8000</a></p>
                    <p><small>Make sure you're using <code>http://</code> not <code>https://</code></small></p>
                </body>
                </html>
                """
                self.wfile.write(message.encode('utf-8'))
            except:
                pass
    
    def log_message(self, format, *args):
        # Suppress harmless errors and only log actual HTTP requests
        # Build the full message to check its content
        try:
            full_message = format % args
        except:
            full_message = str(format) + ' ' + ' '.join(str(a) for a in args)
        
        # Suppress HTTPS/TLS upgrade attempts (browser trying to negotiate HTTPS)
        # These appear as binary data starting with \x16\x03\x01 (TLS handshake)
        if 'Bad request version' in full_message or 'Bad HTTP' in full_message or 'Bad request syntax' in full_message:
            return
        
        # Also check if the request contains TLS handshake data (binary data starting with 0x16)
        # Check all args for TLS handshake indicators
        for arg in args:
            arg_str = str(arg)
            # TLS handshake starts with \x16\x03\x01 or contains binary data
            if '\\x16\\x03\\x01' in arg_str or '\x16\x03\x01' in arg_str or '\\x16' in arg_str:
                return
        
        # Suppress successful/not-modified requests (too verbose)
        if ' 200 ' in full_message or ' 304 ' in full_message:
            return
        
        # Log everything else (actual errors like 404, 500, etc.)
        super().log_message(format, *args)
    
    def do_GET(self):
        # Handle favicon.ico requests by serving the icon
        if self.path == '/favicon.ico':
            icon_path = Path(__file__).parent / 'static' / 'icons' / 'icon.png'
            if icon_path.exists():
                self.path = '/static/icons/icon.png'
        
        return super().do_GET()

if __name__ == "__main__":
    # Change to script directory
    os.chdir(Path(__file__).parent)
    
    with socketserver.TCPServer(("", PORT), PWAHTTPRequestHandler) as httpd:
        print(f"\n🚀 PWA Local Server")
        print(f"📱 Serving at: http://localhost:{PORT}")
        print(f"📱 Or try: http://127.0.0.1:{PORT}")
        print(f"\nPress Ctrl+C to stop\n")
        httpd.serve_forever()
