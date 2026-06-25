const admin = require('firebase-admin');

// Initialize Firebase Admin only once at the root
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// 1. AI Generation & Coaching Logic
const aiModules = require('./src/ai');
exports.generateCoaching = aiModules.generateCoaching;
exports.auditDialogue = aiModules.auditDialogue;
exports.generateAIContent = aiModules.generateAIContent;

// 2. CSV Parsing Logic
const csvModules = require('./src/csv');
exports.parseRentsDueCSV = csvModules.parseRentsDueCSV;

// 3. Auth & Provisioning Logic
const authModules = require('./src/auth');
exports.verifyCertification = authModules.verifyCertification;
exports.provisionTenantAccount = authModules.provisionTenantAccount;
