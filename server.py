import http.server
import socketserver
import webbrowser
import sys
import os
import csv
import json

PORT = 8080
import urllib.request

SUPABASE_URL = "https://ecgeikpxjjcgqpkwglhf.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZ2Vpa3B4ampjZ3Fwa3dnbGhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDM0MDM1MiwiZXhwIjoyMDk1OTE2MzUyfQ.ZoURTsbPD21MPNFRSr-n5C0rK4eYGPNkdDBqg6kDEM0"

def read_crm_states():
    states = {}
    url = f"{SUPABASE_URL}/rest/v1/crm_states"
    req = urllib.request.Request(url, headers={
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    })
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            for row in data:
                uuid_val = row.get('uuid')
                work_started = row.get('work_started', False)
                schedule_acceptance = row.get('schedule_acceptance', 'pending')
                step3_outcome = row.get('step3_outcome')
                if step3_outcome == 'undefined' or step3_outcome == '':
                    step3_outcome = None
                notes_val = row.get('notes', '')
                
                states[uuid_val] = {
                    "workStarted": work_started,
                    "scheduleAcceptance": schedule_acceptance,
                    "step3Outcome": step3_outcome,
                    "notes": notes_val
                }
    except Exception as e:
        print(f"Error fetching states from Supabase: {e}")
    return states

def update_crm_state(uuid, state):
    # Check if row exists in Supabase
    url = f"{SUPABASE_URL}/rest/v1/crm_states?uuid=eq.{uuid}"
    req = urllib.request.Request(url, headers={
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    })
    
    row_exists = False
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            if len(data) > 0:
                row_exists = True
    except Exception as e:
        print(f"Error checking row existence in Supabase: {e}")
        row_exists = False

    work_started = state.get('workStarted', False)
    schedule_acceptance = state.get('scheduleAcceptance', 'pending')
    step3_outcome = state.get('step3Outcome')
    if step3_outcome is None:
        step3_outcome = 'undefined'
    notes_val = state.get('notes', '')

    payload = {
        "uuid": uuid,
        "work_started": work_started,
        "schedule_acceptance": schedule_acceptance,
        "step3_outcome": step3_outcome,
        "notes": notes_val
    }
    
    payload_data = json.dumps(payload).encode('utf-8')
    
    if row_exists:
        # Perform PATCH request (update)
        patch_url = f"{SUPABASE_URL}/rest/v1/crm_states?uuid=eq.{uuid}"
        write_req = urllib.request.Request(
            patch_url,
            data=payload_data,
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            },
            method="PATCH"
        )
    else:
        # Perform POST request (insert)
        post_url = f"{SUPABASE_URL}/rest/v1/crm_states"
        write_req = urllib.request.Request(
            post_url,
            data=payload_data,
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            },
            method="POST"
        )
        
    try:
        with urllib.request.urlopen(write_req) as response:
            pass
    except Exception as e:
        print(f"Error saving to Supabase: {e}")

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Prevent caching for live application data
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/crm-state':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
            self.end_headers()
            
            states = read_crm_states()
            self.wfile.write(json.dumps(states).encode('utf-8'))
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/crm-state':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length).decode('utf-8')
            
            try:
                payload = json.loads(post_data)
                uuid = payload.get('uuid')
                state = payload.get('state')
                
                if uuid and state:
                    update_crm_state(uuid, state)
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
                else:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Missing uuid or state"}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

def run_server():
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
            print(f"Dashboard development server started successfully!")
            print(f"=================================================")
            print(f"Serving files locally at: http://localhost:{PORT}")
            print(f"Press Ctrl+C in your terminal to shut down.")
            print(f"=================================================")
            
            try:
                webbrowser.open(f"http://localhost:{PORT}")
            except Exception as e:
                print(f"Could not automatically open browser: {e}")
                
            sys.stdout.flush()
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nDevelopment server shut down gracefully.")
    except Exception as e:
        print(f"Server error: {e}")

if __name__ == "__main__":
    run_server()
