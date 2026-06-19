import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDb() {
  const periodsRef = collection(db, 'stores', 'store-1', 'periods');
  const snap = await getDocs(periodsRef);
  console.log('Periods in cloud:', snap.docs.map(d => d.id));
  if (!snap.empty) {
    const data = snap.docs[0].data();
    console.log('First period roster size:', data.roster?.length || 0);
    console.log('First period roster snippet:', data.roster?.slice(0, 3));
  } else {
    console.log('Cloud roster is empty.');
  }
}
checkDb().catch(console.error);
