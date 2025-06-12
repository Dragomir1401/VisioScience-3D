param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("feed", "user", "cpp", "evaluation")]
    [string]$Service
)

# Map service parameter to actual service names and paths
$serviceMap = @{
    "feed" = @{
        "name" = "feed-data"
        "path" = "feed-data"
        "deployment" = "feed-data"
    }
    "user" = @{
        "name" = "user-data"
        "path" = "user-data"
        "deployment" = "user-data"
    }
    "cpp" = @{
        "name" = "cpp-compiler-service"
        "path" = "cpp-compiler-service"
        "deployment" = "cpp-compiler-service"
    }
    "evaluation" = @{
        "name" = "evaluation-service"
        "path" = "evaluation-service"
        "deployment" = "evaluation-service"
    }
}

# Get service details
$serviceDetails = $serviceMap[$Service]

# Store current directory
$currentDir = Get-Location

try {
    # Change to service directory
    Set-Location -Path ".\$($serviceDetails.path)"
    Write-Host "Changed directory to $($serviceDetails.path)"

    # Build Docker image
    Write-Host "Building Docker image for $($serviceDetails.name)..."
    docker build -t "dragomir1401/$($serviceDetails.name):latest" .
    if ($LASTEXITCODE -ne 0) {
        throw "Docker build failed"
    }

    # Push Docker image
    Write-Host "Pushing Docker image to registry..."
    docker push "dragomir1401/$($serviceDetails.name):latest"
    if ($LASTEXITCODE -ne 0) {
        throw "Docker push failed"
    }

    # Rollout restart deployment
    Write-Host "Rolling out new deployment..."
    kubectl rollout restart deployment $($serviceDetails.deployment)
    if ($LASTEXITCODE -ne 0) {
        throw "Kubectl rollout failed"
    }

    # Wait for rollout to complete
    Write-Host "Waiting for rollout to complete..."
    kubectl rollout status deployment/$($serviceDetails.deployment) --timeout=300s
    if ($LASTEXITCODE -ne 0) {
        throw "Rollout failed to complete in time"
    }

    Write-Host "Deployment completed successfully!"
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
} finally {
    # Return to original directory
    Set-Location $currentDir
} 