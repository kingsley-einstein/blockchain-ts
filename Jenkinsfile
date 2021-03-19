pipeline {
 agent any
 environment {
  GIT_USERNAME = credentials("git-username")
  GIT_PASSWORD = credentials("git-password")
 }
 stages {
  stage("Install dependencies") {
   steps {
    bat("npm install")
   }
  }

  stage("Run tests") {
   steps {
    bat("npm test")
   }
  }

  stage("Configure VC") {
   steps {
    bat 'git config --global user.name "Kingsley Victor"'
    bat 'git config --global user.email "javaprodigy56@gmail.com"'
   }
  }

  stage("Create build details file & SCM tag") {
   steps {
    bat('echo "Build Number $BUILD_NUMBER" > build-${JOB_NAME}-${BUILD_NUMBER}-${BUILD_ID}')
    bat('echo "Job Name: $JOB_NAME" >> build-${JOB_NAME}-${BUILD_NUMBER}-${BUILD_ID}')
    bat('echo "Build ID: $BUILD_ID" >> build-${JOB_NAME}-${BUILD_NUMBER}-${BUILD_ID}')
    bat("if not exist jenkins (mkdir jenkins) && move build-${JOB_NAME}-${BUILD_NUMBER}-${BUILD_ID} ./jenkins/build-${JOB_NAME}-${BUILD_NUMBER}-${BUILD_ID}")
    bat('git tag -a blockchain-ts-$BUILD_ID -m "Jenkins pipeline build"')
    bat('git add . && git commit -m "Successfully completed build number $BUILD_NUMBER"')
   }
  }

  stage("Push to VC") {
   steps {
    bat("git push --force https://$GIT_USERNAME:$GIT_PASSWORD@github.com/kingsley-einstein/blockchain-ts HEAD:refs/heads/jenkins-pipeline-builds")
    echo "Pushed to Github"
   }
  }

  stage("Push tags") {
   steps {
    bat("git push https://$GIT_USERNAME:$GIT_PASSWORD@github.com/kingsley-einstein/blockchain-ts")
    echo "Pushed tag"
   }
  }
 }
}