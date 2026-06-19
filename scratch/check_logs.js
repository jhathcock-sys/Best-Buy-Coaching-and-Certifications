import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBip9Q0mIzcpSIa7IMu-M6YBM7TcdHkOU4',
  authDomain: 'bbycoaching.firebaseapp.com',
  projectId: 'bbycoaching',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkCoachingLogs() {
  const col = collection(db, 'stores', '1480', 'coachingLogs');
  const snap = await getDocs(col);
  console.log('1480 Coaching Logs count:', snap.docs.length);
  process.exit(0);
}
checkCoachingLogs();
