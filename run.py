import http.server
import socketserver
import webbrowser
import threading
import os
import sys

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class PortfolioHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = '/index.html'
        return super().do_GET()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def open_browser():
    webbrowser.open(f"http://localhost:{PORT}")

if __name__ == "__main__":
    # Ensure working directory is the script's directory
    os.chdir(DIRECTORY)
    
    # Start thread to open web browser in 1 second
    threading.Timer(1.0, open_browser).start()
    
    # Prevent socket address already in use errors
    socketserver.TCPServer.allow_reuse_address = True
    
    try:
        with socketserver.TCPServer(("", PORT), PortfolioHandler) as httpd:
            print(f"† PORTFOLIO RUNNING AT: http://localhost:{PORT} †")
            print("Press Ctrl+C to terminate the server.")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        sys.exit(0)
    except Exception as e:
        print(f"Error starting server: {e}")
        input("Press Enter to exit...")
