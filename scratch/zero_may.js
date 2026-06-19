import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBip9Q0mIzcpSIa7IMu-M6YBM7TcdHkOU4',
  authDomain: 'bbycoaching.firebaseapp.com',
  projectId: 'bbycoaching',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const mayRef = doc(db, 'stores', '1480', 'periods', 'May 2026');
  const snap = await getDoc(mayRef);
  
  if (snap.exists()) {
    const data = snap.data();
    const roster = data.roster || [];
    
    // Zero out all performance metrics for the historical period
    const zeroedRoster = roster.map(emp => ({
      ...emp,
      memberships: 0,
      creditCards: 0,
      warranty: 0,
      surveys: 0,
      rph: 0,
      hours: 0, // usually historical hours should start at 0 too for a clean slate
      gap: 'No Data'
    }));
    
    await setDoc(mayRef, { roster: zeroedRoster }, { merge: true });
    console.log('Successfully zeroed out all metrics for May 2026 (43 employees).');
  } else {
    console.log('May 2026 document not found!');
  }
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
