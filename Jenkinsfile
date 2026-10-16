pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    parameters {
        string(name: 'AWS_REGION', defaultValue: 'us-east-1', description: 'AWS region containing the EKS cluster')
        string(name: 'EKS_CLUSTER_NAME', defaultValue: '', description: 'Target EKS cluster name')
        string(name: 'DOCKERHUB_REPOSITORY', defaultValue: 'your-dockerhub-username/bus-booking-app', description: 'Docker Hub repository in username/repository format')
    }

    environment {
        AWS_DEFAULT_REGION = "${params.AWS_REGION}"
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        K8S_NAMESPACE = 'bus-booking'
    }

    stages {
        stage('Validate configuration') {
            steps {
                script {
                    if (!(params.DOCKERHUB_REPOSITORY ==~ /[a-z0-9._-]+\/[a-z0-9._-]+/) || params.DOCKERHUB_REPOSITORY.startsWith('your-dockerhub-username/')) {
                        error('Set DOCKERHUB_REPOSITORY to your Docker Hub username/repository.')
                    }
                    if (!params.EKS_CLUSTER_NAME?.trim()) {
                        error('Set EKS_CLUSTER_NAME to the target EKS cluster name.')
                    }
                    if (!(params.AWS_REGION ==~ /[a-z]{2}(-gov)?-[a-z]+-[0-9]/)) {
                        error('Set AWS_REGION to a valid AWS region, for example us-east-1.')
                    }
                }
            }
        }

        stage('Build and push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_TOKEN')]) {
                    sh '''#!/bin/sh
                        set -eu
                        printf '%s' "$DOCKERHUB_TOKEN" | docker login --username "$DOCKERHUB_USERNAME" --password-stdin
                        docker build --pull -t "$DOCKERHUB_REPOSITORY:$IMAGE_TAG" -t "$DOCKERHUB_REPOSITORY:latest" .
                        docker push "$DOCKERHUB_REPOSITORY:$IMAGE_TAG"
                        docker push "$DOCKERHUB_REPOSITORY:latest"
                    '''
                }
            }
        }

        stage('Deploy to EKS') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'aws-credentials',
                    usernameVariable: 'AWS_ACCESS_KEY_ID',
                    passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                )]) {
                    sh '''#!/bin/sh
                        set -eu
                        export IMAGE="$DOCKERHUB_REPOSITORY:$IMAGE_TAG"
                        aws eks update-kubeconfig --region "$AWS_REGION" --name "$EKS_CLUSTER_NAME"
                        kubectl create namespace "$K8S_NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
                        envsubst '${IMAGE}' < k8s/deployment.yaml | kubectl apply -f -
                        kubectl apply -f k8s/service.yaml
                        kubectl -n "$K8S_NAMESPACE" rollout status deployment/bus-booking --timeout=180s
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'docker image prune -f >/dev/null 2>&1 || true'
        }
    }
}
