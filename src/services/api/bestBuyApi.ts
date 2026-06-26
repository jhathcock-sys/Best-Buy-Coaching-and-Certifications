import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase';

export interface Deal {
  title: string;
  link: string;
  description: string;
}

export const scrapeDeals = async (): Promise<Deal[]> => {
  if (!app) {
    throw new Error('Firebase app not initialized');
  }
  const functionsInstance = getFunctions(app);
  const scrapeDealsFn = httpsCallable<void, Deal[]>(functionsInstance, 'scrapeDeals');
  
  try {
    const result = await scrapeDealsFn();
    return result.data;
  } catch (error) {
    console.error('Error fetching deals:', error);
    throw error;
  }
};
