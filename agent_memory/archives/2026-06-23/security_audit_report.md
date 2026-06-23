# Critical Security Posture Audit: Best Buy Coaching & Certifications

## 🚨 Executive Summary: Complete Compromise
Your current application security posture is **catastrophically flawed**. You are relying on a **client-side trust model** married to a **wide-open database**. As it stands, any malicious actor with basic developer tools or Postman can read, mutate, or delete all store performance data, coaching logs, and associate records. 

There is no sugarcoating this: **This app is not safe for production.**

---

## 💥 Critical Vulnerabilities Identified

### 1. The "Public Database" Nightmare (`firestore.rules`)
Your Firestore rules explicitly allow completely unauthenticated users to read your entire database.

```javascript
// Current firestore.rules
match /stores/{storeId} {
  allow read: if isTenantManager(storeId) || request.auth == null; // 🚨 PUBLIC READ EXPOSURE 
}
match /data/{document=**} {
  allow read: if isTenantManager(storeId) || request.auth == null; // 🚨 PUBLIC READ EXPOSURE 
}
```
**The Impact:** Anyone on the internet with your Firebase Project ID can query and dump all your Best Buy store data, employee rosters, coaching logs, and performance metrics without needing a PIN, a login, or any credentials. 

### 2. Client-Side Authentication Forgery (`firebase.ts` & `authSlice.ts`)
You are allowing the frontend client to dictate who gets an account. 

```javascript
// src/services/firebase.ts
export const createTenantAuth = async (storeId: string, pin: string) => {
  const email = `s${storeId}_p${pin}@bby.app`;
  const password = `BBY_${storeId}_${pin}_secret!`;
  await createUserWithEmailAndPassword(auth, email, password); // 🚨 CLIENT-SIDE PROVISIONING
};
```
**The Impact:** Your code says: *"If the PIN login fails, just create a new Firebase account for them using the provided PIN as the password."* An attacker doesn't need to guess a manager's PIN. They can just invent one, run `createTenantAuth("1480", "9999")`, and the client will blindly mint them a valid Firebase Auth token. Your `firestore.rules` relies entirely on the format of the email string to grant access, so this forged account immediately gains total read/write permissions for that store.

### 3. Lack of True Role-Based Access Control (RBAC)
You have a single `isTenantManager` rule. There is no distinction in the database between an Advisor (who should only see their own coaching logs) and a General Manager (who sees the whole store). 
**The Impact:** Once authenticated, an Associate can easily read other Associates' coaching logs or mutate the Store's daily snapshots by hitting the Firestore API directly, bypassing your React UI completely.

### 4. PINs in Plain Text
You are storing Manager PINs in plaintext within localStorage, sessionStorage, and the Firestore `users` collection.
**The Impact:** If a device is shared (common in retail), any user can inspect the browser storage and extract the General Manager's PIN.

---

## 🛠️ Mandatory Security Fixes & Remediation Plan

To stop this from being a massive data breach waiting to happen, you must implement the following immediately.

### Step 1: Kill the Public Database Exposure
Remove every instance of `|| request.auth == null` from `firestore.rules`.
No data should be readable without authentication. None.

### Step 2: Implement True Server-Side RBAC (Custom Claims)
Stop using regex email matching in your security rules. Access control must be validated on the backend.
- Create a **Firebase Cloud Function** for authentication.
- When a user logs in, the Cloud Function verifies their identity against a secure backend registry.
- The Cloud Function mints a Custom Auth Claim: `{ storeId: "1480", role: "manager" }`.
- Your Firestore rules are rewritten to trust the cryptographically signed token:
  ```javascript
  allow read, write: if request.auth.token.storeId == storeId && request.auth.token.role == 'manager';
  ```

### Step 3: Remove Client-Side Auth Provisioning
Delete `createTenantAuth` from the frontend completely. The client should **never** call `createUserWithEmailAndPassword`. If a new manager needs an account, it must be provisioned by a General Manager or System Admin through a secure, gated API endpoint (Cloud Function) that verifies the requester's admin status before creating the new user.

### Step 4: Encrypt/Hash the PINs
Never store `1234` in the database. Use bcrypt or scrypt to hash the PINs before saving them. When a user logs in, send the plain PIN to the backend Cloud Function, hash it, and compare it against the stored hash.

---

## 🚀 Proposed New Features for Production Security

1. **Shift to SSO (Single Sign-On):** Retail environments are high-turnover. Stop using shared PINs. Integrate with Best Buy's Azure AD or Okta via SAML/OIDC so employees log in with their actual employee credentials. This gives you instant onboarding/offboarding and true audit logs.
2. **Advisor-Scoped Dashboards:** With true RBAC implemented, you can build an "Advisor View". An advisor logs in and their Firestore Rules look like: `allow read: if resource.data.employeeId == request.auth.uid`. They see only their own metrics and coaching logs, securely enforced by Google's servers, not your React components.
3. **Audit Logging:** Create a secure, append-only `audit_logs` collection to track who muted what data. `allow read: if false; allow create: if request.auth != null;` (Only the backend can read it).

---
**Verdict:** Stop building features immediately and fix your auth model. The current architecture operates on the honor system, and the internet has no honor.
