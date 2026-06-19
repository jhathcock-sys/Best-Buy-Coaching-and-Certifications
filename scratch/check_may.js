import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBip9Q0mIzcpSIa7IMu-M6YBM7TcdHkOU4',
  authDomain: 'bbycoaching.firebaseapp.com',
  projectId: 'bbycoaching',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const docRef = doc(db, 'stores', '1480', 'periods', 'May 2026');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    console.log('May 2026 roster size:', snap.data().roster.length);
  } else {
    console.log('May 2026 doc missing!');
  }
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
