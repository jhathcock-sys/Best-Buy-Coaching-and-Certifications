import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBip9Q0mIzcpSIa7IMu-M6YBM7TcdHkOU4',
  authDomain: 'bbycoaching.firebaseapp.com',
  projectId: 'bbycoaching',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDb() {
  const storesRef = collection(db, 'stores');
  const snap = await getDocs(storesRef);
  for (const docSnap of snap.docs) {
    console.log('Store:', docSnap.id);
    const periodsRef = collection(db, 'stores', docSnap.id, 'periods');
    const periodsSnap = await getDocs(periodsRef);
    for (const p of periodsSnap.docs) {
      console.log('  Period:', p.id, 'Size:', p.data().roster?.length);
    }
  }
  process.exit(0);
}
checkDb().catch(e => { console.error(e); process.exit(1); });
