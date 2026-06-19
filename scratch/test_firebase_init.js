import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const config = {
  apiKey: 'AIzaSyBip9Q0mIzcpSIa7IMu-M6YBM7TcdHkOU4',
  authDomain: 'bbycoaching.firebaseapp.com',
  projectId: 'bbycoaching',
};

const app = initializeApp(config);
console.log('Init 1');
initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

console.log('Init 2');
try {
  initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
  });
  console.log('Init 2 Success');
} catch (e) {
  console.error('Init 2 Failed:', e.message);
}
process.exit(0);
