@echo off
echo Building Docker image...
docker build -t dragomir1401/evaluation-service:latest .

echo Pushing image to Docker Hub...
docker push dragomir1401/evaluation-service:latest

echo Restarting Kubernetes deployment...
kubectl rollout restart deployment evaluation-service

echo Deployment completed successfully!
pause 