#!/bin/bash

# Build the Docker image
echo "Building Docker image..."
docker build -t dragomir1401/feed-data:latest .

# Push the image to Docker Hub
echo "Pushing image to Docker Hub..."
docker push dragomir1401/feed-data:latest

# Restart the Kubernetes deployment
echo "Restarting Kubernetes deployment..."
kubectl rollout restart deployment feed-data

echo "Deployment completed successfully!" 