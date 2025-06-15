🐳 Docker-on-WSL 2 “disk-cleanup” cheat-sheet
All commands run from an elevated PowerShell (unless otherwise noted). Change paths to suit your username.

0 · Check that the data distro is mounted
powershell
Copy
Edit
# See all WSL distros (docker-desktop & docker-desktop-data must be listed)
wsl --list --verbose --all
If docker-desktop-data is missing or shouty errors appear, restart the backend:

powershell
Copy
Edit
# Restart the Docker Desktop service stack
Stop-Process -Name "com.docker.backend" -Force -ErrorAction SilentlyContinue
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# or, when the GUI is open:
Restart-Service com.docker.service
1 · Gracefully stop everything
powershell
Copy
Edit
# Stop all running containers (safer than --force)
docker stop $(docker ps -q)

# Shut down the Docker WSL distros
wsl --shutdown
2 · Prune Docker objects (frees Linux blocks)
powershell
Copy
Edit
# Remove stopped ctrs, dangling images, networks, ⏫ etc.
docker system prune -a --volumes --force

# OPTIONAL – remove buildx cache layers
docker builder prune -a --force
Inside the distro (optional, but helps):

bash
Copy
Edit
# Enter the distro only if you need to clean package caches
wsl -d docker-desktop-data --user root
apt-get clean
exit
3 · Compact the VHDX (Windows host side)
Defrag the virtual disk so free blocks become contiguous:

powershell
Copy
Edit
defrag "C:\Users\<you>\AppData\Local\Docker\wsl\main\ext4.vhdx" /K /L
Optimize-VHD (shrinks the file on host):

powershell
Copy
Edit
# PowerShell **as Administrator**
Optimize-VHD `
  -Path "C:\Users\<you>\AppData\Local\Docker\wsl\main\ext4.vhdx" `
  -Mode Full
Do the same for docker_data.vhdx if it exists:

powershell
Copy
Edit
Optimize-VHD -Path "C:\Users\<you>\AppData\Local\Docker\wsl\disk\docker_data.vhdx" -Mode Full
4 · Restart & verify
powershell
Copy
Edit
wsl --version    # should start WSL service again
docker system df # make sure sizes look right
Quick-reference block (copy-paste)
powershell
Copy
Edit
## stop, prune, shutdown
docker stop $(docker ps -q)
docker system prune -a --volumes --force
wsl --shutdown

## defrag then compact
defrag "$env:USERPROFILE\AppData\Local\Docker\wsl\main\ext4.vhdx" /K /L
Optimize-VHD -Path "$env:USERPROFILE\AppData\Local\Docker\wsl\main\ext4.vhdx" -Mode Full

## (repeat for docker_data.vhdx if present)
defrag "$env:USERPROFILE\AppData\Local\Docker\wsl\disk\docker_data.vhdx" /K /L
Optimize-VHD -Path "$env:USERPROFILE\AppData\Local\Docker\wsl\disk\docker_data.vhdx" -Mode Full

## bring it all back up
wsl
docker system df