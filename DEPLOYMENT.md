# CRM Dashboard Deployment Guide (Google Cloud & Docker)

This guide walks you through pushing your project to GitHub and deploying it live on your Google Cloud VM using Docker.

---

## Part 1: Push to GitHub

### 1. Create a Repository on GitHub
1. Log into [GitHub](https://github.com/).
2. Click **New** (or the `+` icon in the top-right and select **New repository**).
3. Name your repository (e.g., `oprisa-crm-dashboard`).
4. Keep the repository settings **Public** or **Private** (based on your preference).
5. **CRITICAL**: Do **NOT** check "Add a README file", "Add .gitignore", or "Choose a license". Keep it completely empty!
6. Click **Create repository**.

### 2. Link Local Git and Push
Open your terminal (PowerShell or Command Prompt) on your local computer, navigate to your project directory (`c:\Users\user\Desktop\dashboard`), and execute the following commands to link and push your code:

```bash
# 1. Rename default branch to main (if not done)
git branch -M main

# 2. Add your GitHub repository as the remote origin
# (Replace <YOUR_GITHUB_URL> with the SSH or HTTPS link from your new GitHub repo)
git remote add origin <YOUR_GITHUB_URL>

# 3. Push the codebase to GitHub
git push -u origin main
```

---

## Part 2: Deploy Live on Google Cloud VM ("Qualify")

Since you already have a Google Cloud VM and want to run it live via Docker, follow these steps to deploy:

### 1. Open the Firewall Port in Google Cloud
You need to allow external web traffic to access port `8085` where the dashboard is served.
1. Go to the **Google Cloud Console**.
2. Navigate to **VPC Network** > **Firewall**.
3. Click **Create Firewall Rule**.
4. Configure it with:
   - **Name**: `allow-crm-dashboard`
   - **Targets**: `All instances in the network` (or apply a specific network tag if you use tags)
   - **Source IPv4 ranges**: `0.0.0.0/0` (allows access from anywhere)
   - **Protocols and ports**: Under **Specified protocols and ports**, check **TCP** and enter `8085`.
5. Click **Create**.

### 2. Deploy on your VM
SSH into your Google Cloud VM and run the following commands:

```bash
# 1. Install Docker and Docker Compose (if not already installed)
# For Debian/Ubuntu based systems:
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin

# 2. Clone your repository from GitHub
git clone <YOUR_GITHUB_URL>
cd dashboard

# 3. Create the database CSV file on the host if it doesn't exist
# (This ensures Docker compose mounts a file, not a directory)
touch crm_state.csv
echo "UUID;workStarted;scheduleAcceptance;step3Outcome;notes" > crm_state.csv

# 4. Start the application in the background (detached mode)
sudo docker compose up --build -d
```

### 3. Verification & Live Access
Once the docker container starts:
1. Verify the container is running:
   ```bash
   sudo docker ps
   ```
2. Your dashboard is now **LIVE** and accessible at:
   ```text
   http://<YOUR_VM_EXTERNAL_IP>:8085/
   ```

---

## Key Docker Commands for Maintenance
- **Stop the server**: `sudo docker compose down`
- **Restart the server**: `sudo docker compose restart`
- **View live server request logs**: `sudo docker compose logs -f`
- **Pull code updates from GitHub and rebuild**:
  ```bash
  git pull origin main
  sudo docker compose up --build -d
  ```
