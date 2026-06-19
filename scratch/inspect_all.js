import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBip9Q0mIzcpSIa7IMu-M6YBM7TcdHkOU4',
  authDomain: 'bbycoaching.firebaseapp.com',
  projectId: 'bbycoaching',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function inspect(storeId) {
  const collections = ['periods', 'dailySnapshots', 'followUpTasks', 'floorLeaderShifts', 'coachingLogs'];
  console.log(`\n=== STORE: ${storeId} ===`);
  for (const c of collections) {
    const snap = await getDocs(collection(db, `stores/${storeId}/${c}`));
    if (!snap.empty) {
      console.log(`Collection: ${c}`);
      for (const d of snap.docs) {
        let sizeInfo = '';
        if (c === 'periods') sizeInfo = `(Roster Size: ${d.data().roster?.length})`;
        console.log(`  Doc: ${d.id} ${sizeInfo}`);
      }
    }
  }
}

async function run() {
  await inspect('store-1');
  await inspect('1144');
  await inspect('1480');
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
