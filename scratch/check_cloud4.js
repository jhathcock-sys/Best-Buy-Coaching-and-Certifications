import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

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
    const data = docSnap.data();
    console.log(docSnap.id, 'size:', data.roster?.length || 0);
  }
  
  const activePeriodSnap = await getDoc(doc(db, 'stores', 'store-1', 'data', 'activePeriod'));
  if (activePeriodSnap.exists()) {
    console.log('Active Period in cloud:', activePeriodSnap.data().activePeriod);
  } else {
    console.log('No Active Period in cloud');
  }
  
  process.exit(0);
}
checkDb().catch(e => { console.error(e); process.exit(1); });
