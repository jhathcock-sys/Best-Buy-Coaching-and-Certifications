---
name: firebase-deploy-manager
description: Instructions and standard operating procedures for building, testing, and deploying Firebase Cloud Functions and Hosting.
---

# Firebase Deployment Manager

Use this skill whenever you need to deploy changes to Firebase Cloud Functions, update Firestore Security Rules, or push a new web hosting build.

## 1. Deploying Cloud Functions
If you modified any code inside the `functions/` directory, you must recompile and deploy it.
1. Always build the functions first:
   ```bash
   cd functions ; npm run build ; cd ..
   ```
2. Deploy ONLY the functions to prevent accidentally overwriting the frontend or database rules:
   ```bash
   firebase deploy --only functions
   ```
3. To deploy a specific function to save time:
   ```bash
   firebase deploy --only functions:yourFunctionName
   ```

## 2. Deploying Firestore Rules
If you overhauled `firestore.rules`, you can push them independently without requiring a full build:
```bash
firebase deploy --only firestore:rules
```

## 3. Deploying the Frontend (Web Hosting)
If you made significant changes to the React application and the user requests a live deployment:
1. Ensure the build passes TypeScript compilation:
   ```bash
   npm run build
   ```
2. Deploy the hosting bundle:
   ```bash
   firebase deploy --only hosting
   ```

## 4. Debugging Cloud Functions
If a Cloud Function is throwing `500 Internal Server Error` on the frontend, do NOT guess the issue. Read the actual cloud logs:
```bash
firebase functions:log
```
This will print the live execution logs and stack traces from the GCP environment.
