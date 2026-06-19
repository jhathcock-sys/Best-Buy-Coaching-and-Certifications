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
  const periodsRef = collection(db, 'stores', 'store-1', 'periods');
  const snap = await getDocs(periodsRef);
  for (const docSnap of snap.docs) {
    if (docSnap.id === 'June 2026') {
      const data = docSnap.data();
      const names = data.roster?.map(r => r.name) || [];
      console.log('June 2026 names:', names);
    }
  }
  process.exit(0);
}
checkDb().catch(e => { console.error(e); process.exit(1); });
