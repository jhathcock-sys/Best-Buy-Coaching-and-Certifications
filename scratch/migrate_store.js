import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBip9Q0mIzcpSIa7IMu-M6YBM7TcdHkOU4',
  authDomain: 'bbycoaching.firebaseapp.com',
  projectId: 'bbycoaching',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function copyCollection(srcPath, destPath) {
  const srcRef = collection(db, srcPath);
  const snap = await getDocs(srcRef);
  for (const d of snap.docs) {
    const destRef = doc(db, destPath, d.id);
    await setDoc(destRef, d.data());
    console.log(`Copied ${d.id} to ${destPath}`);
  }
}

async function migrate() {
  const collections = ['periods', 'dailySnapshots', 'followUpTasks', 'floorLeaderShifts', 'coachingLogs'];
  for (const c of collections) {
    await copyCollection(`stores/store-1/${c}`, `stores/1144/${c}`);
  }
  
  console.log('Migration complete.');
  process.exit(0);
}

migrate().catch(e => { console.error(e); process.exit(1); });
