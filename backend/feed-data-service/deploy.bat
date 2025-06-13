@echo off
echo Building Docker image...
docker build -t dragomir1401/feed-data:latest .

echo Pushing image to Docker Hub...
docker push dragomir1401/feed-data:latest

echo Restarting Kubernetes deployment...
kubectl rollout restart deployment feed-data

echo Deployment completed successfully!
pause 