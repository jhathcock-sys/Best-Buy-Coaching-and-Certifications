import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "bbycoaching",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
    const storeId = "1480";
    const periodId = "June 2026";
    const ref = doc(db, 'stores', storeId, 'settings', 'activePeriod');
    await setDoc(ref, { period: periodId }, { merge: true });
    console.log("Successfully set Store 1480 activePeriod to June 2026.");
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
run();
