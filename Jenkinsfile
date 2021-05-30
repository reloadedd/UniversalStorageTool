pipeline {
    agent any

    environment {
        GITHUB_REPOSITORY_URL   = 'https://github.com/reloadedd/UniversalStorageTool' 
        GITHUB_ACCESS_TOKEN     = credentials('a41ba52b-a90d-40ff-9336-8d3e3ccaad50')
        GITHUB_USERNAME         = 'reloadedd'
        GITHUB_REPOSITORY_NAME  = 'UniversalStorageTool'
        JENKINS_URL             = 'https://www.reloadedd.me:8443'
        JENKINS_PROJECT_NAME    = 'UniversalStorageToolMultibranch'
    }

    options {
        // This will skip creating a new stage for checking out the Jenkinsfile from the repository
        skipDefaultCheckout(true)
    }

    stages {
        stage('Checkout from Github') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [
                        [name: "*/${env.BRANCH_NAME}"]
                    ],
                    doGenerateSubmoduleConfigurations: false,
                    extensions: [],
                    submoduleCfg: [],
                    userRemoteConfigs: [
                        [
                            url: "${GITHUB_REPOSITORY_URL}"
                        ]
                    ]
                ])
            }
        }

        stage('Dockerize application') {
            when {
                branch 'master'
            }

            steps {
                sh "docker image build -t ${IMAGE_NAME} ."
            }
        }

        stage('SonarQube Source Code Analysis') {
            steps {
                sh '''/bin/bash
                
                sed -i "s/{{UNST_SONARQUBE_USERNAME}}/$UNST_SONARQUBE_USERNAME/" sonar-project.properties
                sed -i "s/{{UNST_SONARQUBE_PASSWORD}}/$UNST_SONARQUBE_PASSWORD/" sonar-project.properties
                sonar-scanner
                '''
            }
        }

        stage('Deploy') {
            when {
                branch 'master'
            }

            steps {
                sh "docker-compose build"
                sh "docker-compose up"
            }
        }
    }

    post {
        success {
            script {
                sh """#!/bin/bash

                curl "https://api.GitHub.com/repos/${GITHUB_USERNAME}/${GITHUB_REPOSITORY_NAME}/statuses/\$(git rev-parse HEAD)?access_token=\${GITHUB_ACCESS_TOKEN}" \
                -H "Content-Type: application/json" \
                -X POST \
                -d "{\\"state\\": \\"success\\", \\"context\\": \\"continuous-integration/jenkins\\", \\"description\\": \\"Jenkins\\", \\"target_url\\": \\"${JENKINS_URL}/job/${JENKINS_PROJECT_NAME}/$BUILD_NUMBER/console\\"}"
                """
                
                slackSend color: "good", message: "#${env.BUILD_NUMBER}: Build-ul '${env.JOB_NAME}' e gata cumetre."
            }
        }

        failure {
            script {
                sh """#!/bin/bash
                
                curl "https://api.GitHub.com/repos/${GITHUB_USERNAME}/${GITHUB_REPOSITORY_NAME}/statuses/\$(git rev-parse HEAD)?access_token=\${GITHUB_ACCESS_TOKEN}" \
                -H "Content-Type: application/json" \
                -X POST \
                -d "{\\"state\\": \\"failure\\", \\"context\\": \\"continuous-integration/jenkins\\", \\"description\\": \\"Jenkins\\", \\"target_url\\": \\"${JENKINS_URL}/job/${JENKINS_PROJECT_NAME}/$BUILD_NUMBER/console\\"}"
                """

                slackSend color: "danger", message: "#${env.BUILD_NUMBER}: Da' ce ai facut cu '${env.JOB_NAME}', bobiță?"
            }
        }
    }
}