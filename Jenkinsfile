pipeline {
    agent any

    environment {
        GITHUB_REPOSITORY_URL   = 'https://github.com/reloadedd/UniversalStorageTool' 
        GITHUB_ACCESS_TOKEN     = credentials('a41ba52b-a90d-40ff-9336-8d3e3ccaad50')
        GITHUB_USERNAME         = 'reloadedd'
        GITHUB_REPOSITORY_NAME  = 'UniversalStorageTool'
        JENKINS_URL             = 'https://www.reloadedd.me:8443'
        JENKINS_PROJECT_NAME    = 'UniversalStorageToolMultibranch'
        UNST_SONARQUBE          = credentials('3f457c4a-0fd8-4777-a061-6712958fb98d')
    }

    options {
        // This will skip creating a new stage for checking out the Jenkinsfile from the repository
        skipDefaultCheckout(true)
    }

    stages {
        stage('Checkout from Github') {
            steps {
                script {
                    if (env.CHANGE_BRANCH) {
                        checkout([
                            $class: 'GitSCM',
                            branches: [
                                [name: "*/${env.CHANGE_BRANCH}"]
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
                    } else {
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
            }
        }

        stage('Dockerize application') {
            when {
                branch 'master'
            }

            steps {
                sh "docker-compose --env-file /etc/unst/.env build"
            }
        }

        stage('SonarQube Source Code Analysis') {
            steps {
                sh 'sed -i "s/{{UNST_SONARQUBE_USERNAME}}/$UNST_SONARQUBE_USR/" sonar-project.properties'
                sh 'sed -i "s/{{UNST_SONARQUBE_PASSWORD}}/$UNST_SONARQUBE_PSW/" sonar-project.properties'
                sh 'sonar-scanner'
            }
        }

        stage('Deploy application') {
            when {
                branch 'master'
            }

            steps {
                sh "docker-compose --env-file /etc/unst/.env down"
                sh "docker-compose --env-file /etc/unst/.env up --detach"
            }
        }
    }

    post {
        success {
            script {
                slackSend color: "good", message: "#${env.BUILD_NUMBER}: Build-ul '${env.JOB_NAME}' e gata cumetre."
            }
        }

        failure {
            script {
                slackSend color: "danger", message: "#${env.BUILD_NUMBER}: Da' ce ai facut cu '${env.JOB_NAME}', bobiță?"
            }
        }
    }
}