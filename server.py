import http.server
import socketserver
import webbrowser
import sys
import os
import csv
import json

PORT = 8000
CSV_FILE = 'crm_state.csv'
CSV_HEADER = ['UUID', 'workStarted', 'scheduleAcceptance', 'step3Outcome', 'notes']

def read_crm_states():
    states = {}
    if not os.path.exists(CSV_FILE):
        # Create CSV file with headers if it does not exist
        try:
            with open(CSV_FILE, 'w', encoding='utf-8', newline='') as f:
                writer = csv.writer(f, delimiter=';', quotechar='"', quoting=csv.QUOTE_MINIMAL)
                writer.writerow(CSV_HEADER)
        except Exception as e:
            print(f"Failed to initialize CSV file: {e}")
        return states
        
    try:
        with open(CSV_FILE, 'r', encoding='utf-8') as f:
            reader = csv.reader(f, delimiter=';', quotechar='"')
            header = next(reader, None) # Skip header row
            for row in reader:
                if len(row) >= 5:
                    uuid_val = row[0]
                    work_started = row[1] == 'true'
                    schedule_acceptance = row[2]
                    step3_outcome = row[3] if row[3] != 'undefined' and row[3] != '' else None
                    notes_val = row[4]
                    
                    states[uuid_val] = {
                        "workStarted": work_started,
                        "scheduleAcceptance": schedule_acceptance,
                        "step3Outcome": step3_outcome,
                        "notes": notes_val
                    }
    except Exception as e:
        print(f"Error reading crm_state.csv: {e}")
        
    return states

def update_crm_state(uuid, state):
    # Ensure file exists and read current states
    read_crm_states()
    
    rows = []
    updated = False
    
    try:
        # Read all existing rows
        with open(CSV_FILE, 'r', encoding='utf-8') as f:
            reader = csv.reader(f, delimiter=';', quotechar='"')
            header = next(reader, None)
            for row in reader:
                if len(row) >= 5:
                    if row[0] == uuid:
                        # Update existing row with new state data
                        work_started_str = 'true' if state.get('workStarted') else 'false'
                        schedule_acceptance_str = state.get('scheduleAcceptance', 'pending')
                        step3_outcome_str = state.get('step3Outcome')
                        if step3_outcome_str is None:
                            step3_outcome_str = 'undefined'
                        notes_str = state.get('notes', '')
                        
                        rows.append([uuid, work_started_str, schedule_acceptance_str, step3_outcome_str, notes_str])
                        updated = True
                    else:
                        rows.append(row)
                        
        if not updated:
            # Append new state row if UUID was not found
            work_started_str = 'true' if state.get('workStarted') else 'false'
            schedule_acceptance_str = state.get('scheduleAcceptance', 'pending')
            step3_outcome_str = state.get('step3Outcome')
            if step3_outcome_str is None:
                step3_outcome_str = 'undefined'
            notes_str = state.get('notes', '')
            rows.append([uuid, work_started_str, schedule_acceptance_str, step3_outcome_str, notes_str])
            
        # Atomic rewrite back to crm_state.csv
        with open(CSV_FILE, 'w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f, delimiter=';', quotechar='"', quoting=csv.QUOTE_MINIMAL)
            writer.writerow(CSV_HEADER)
            writer.writerows(rows)
            
    except Exception as e:
        print(f"Error updating crm_state.csv: {e}")

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
