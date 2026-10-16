# Bus Booking App

This is a static web app served by an unprivileged NGINX container. The Jenkins pipeline builds the image, pushes it to Docker Hub, and rolls it out to an EKS cluster. Kubernetes exposes the app on a cloud load balancer.

## Jenkins setup

1. Create a Jenkins **Username with password** credential with ID `dockerhub-credentials`. Use your Docker Hub username and an access token with permission to push to the target repository.
2. Create a Jenkins **Username with password** credential with ID `aws-credentials`. Use an IAM access key and secret for an IAM principal that can update kubeconfig for the EKS cluster and authenticate to its Kubernetes API.
3. Configure the IAM principal or its EKS access entry/RBAC mapping with permission to create resources in the cluster and deploy to the `bus-booking` namespace. The Docker Hub repository must be public for EKS nodes to pull it without an image pull secret.
4. Run this repository's `Jenkinsfile` with `DOCKERHUB_REPOSITORY`, `AWS_REGION`, and `EKS_CLUSTER_NAME` set. The repository value should be `dockerhub-username/repository-name`.
5. The Jenkins agent needs Docker, AWS CLI, `kubectl`, and `envsubst`, plus network access to Docker Hub, AWS, and the cluster API endpoint.

The pipeline tags each image with the Jenkins build number (and updates `latest`), deploys the build-number tag with two replicas, and waits for the rollout to become ready. The `bus-booking` Service uses type `LoadBalancer`; AWS provisions an external endpoint asynchronously after deployment.

## Build the container locally

```sh
docker build -t bus-booking-app .
docker run --rm -p 8080:8080 bus-booking-app
```

Open <http://localhost:8080> to view the app.
