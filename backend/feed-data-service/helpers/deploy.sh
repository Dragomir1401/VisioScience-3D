docker build -t dragomir1401/feed-data:latest .
docker push dragomir1401/feed-data:latest
kubectl rollout restart deployment feed-data