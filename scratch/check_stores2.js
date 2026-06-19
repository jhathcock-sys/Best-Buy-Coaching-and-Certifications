import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBip9Q0mIzcpSIa7IMu-M6YBM7TcdHkOU4',
  authDomain: 'bbycoaching.firebaseapp.com',
  projectId: 'bbycoaching',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkStore(storeId) {
  const periodsRef = collection(db, 'stores', storeId, 'periods');
  const snap = await getDocs(periodsRef);
  if (snap.empty) return;
  console.log('Store:', storeId);
  for (const p of snap.docs) {
    console.log('  Period:', p.id, 'Size:', p.data().roster?.length);
  }
}

async function run() {
  await checkStore('store-1');
  await checkStore('store-1144');
  await checkStore('1144');
  await checkStore('store-undefined');
  await checkStore('undefined');
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
