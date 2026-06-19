import { config } from 'dotenv';
config();
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};
console.log('Project ID:', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDb() {
  const periodsRef = collection(db, 'stores', 'store-1', 'periods');
  const snap = await getDocs(periodsRef);
  console.log('Periods in cloud:', snap.docs.map(d => d.id));
  if (!snap.empty) {
    const data = snap.docs[0].data();
    console.log('First period roster size:', data.roster?.length || 0);
  } else {
    console.log('Cloud roster is empty.');
  }
  process.exit(0);
}
checkDb().catch(e => { console.error(e); process.exit(1); });
