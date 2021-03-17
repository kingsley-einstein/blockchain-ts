pipeline {
 agent any
 environment {}
 stages {
  stage("Install dependencies") {
   steps {
    bat "npm install"
   }
  }

  stage("Run tests") {
   steps {
    bat "npm test"
   }
  }

  stage("Push to VC") {
   steps {}
  }
 }
}