const { initializeApp } = require('firebase/app'); 
const { getFirestore, doc, onSnapshot } = require('firebase/firestore'); 
const app = initializeApp({ projectId: 'bbycoaching' }); 
const db = getFirestore(app); 
onSnapshot(doc(db, 'stores', '1480', 'data', 'playbookSettings'), 
  (s) => console.log('success', s.data()), 
  (e) => console.error('error', e.message)); 
setTimeout(() => process.exit(0), 3000);
