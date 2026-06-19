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
  const docRef = doc(db, 'stores', '1480', 'periods', 'June 2026');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    console.log('June 2026 roster sample:', JSON.stringify(snap.data().roster[0], null, 2));
  }
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
