@echo off
echo Building Docker image...
docker build -t dragomir1401/user-data:latest .

echo Pushing image to Docker Hub...
docker push dragomir1401/user-data:latest

echo Restarting Kubernetes deployment...
kubectl rollout restart deployment user-data

echo Deployment completed successfully!
pause 