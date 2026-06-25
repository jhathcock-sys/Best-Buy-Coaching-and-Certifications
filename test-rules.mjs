import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';

async function runTests() {
  const testEnv = await initializeTestEnvironment({
    projectId: "demo-test",
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  });

  const unauthedDb = testEnv.unauthenticatedContext().firestore();

  try {
    console.log("Testing playbookSettings read...");
    await assertSucceeds(unauthedDb.doc('stores/1480/data/playbookSettings').get());
    console.log("playbookSettings read SUCCESS");
  } catch (e) {
    console.log("playbookSettings read FAILED", e.message);
  }

  try {
    console.log("Testing activePeriod read...");
    await assertFails(unauthedDb.doc('stores/1480/data/activePeriod').get());
    console.log("activePeriod read correctly FAILED");
  } catch (e) {
    console.log("activePeriod read DID NOT FAIL AS EXPECTED", e.message);
  }

  testEnv.cleanup();
}

runTests();
