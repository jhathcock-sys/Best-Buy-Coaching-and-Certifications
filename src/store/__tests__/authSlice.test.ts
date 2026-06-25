import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStore } from 'zustand/vanilla';
import { createAuthSlice } from '../slices/authSlice';
import * as firebaseServices from '../../services/firebase';

// Mock Firebase services
vi.mock('../../services/firebase', () => ({
  signInTenant: vi.fn(),
  getUserByPin: vi.fn(),
  createTenantAuth: vi.fn(),
  isFirebaseConnected: vi.fn().mockReturnValue(true), // cloud-only
  initFirebase: vi.fn(),
  saveManagersToCloud: vi.fn(),
  signOutTenant: vi.fn(),
  getStoreGuestPin: vi.fn().mockResolvedValue('1234')
}));

// Mock sessionStorage
global.sessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
} as any;

describe('authSlice - login', () => {
  let store: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create a vanilla zustand store for testing the slice
    store = createStore<any>((set, get, api) => ({
      ...createAuthSlice(set, get, api),
      // Set the initial storePin to '1234' for Guest PIN tests
      storePin: '1234'
    }));
  });

  it('returns true when signInTenant succeeds', async () => {
    vi.mocked(firebaseServices.signInTenant).mockResolvedValue(true);
    vi.mocked(firebaseServices.getUserByPin).mockResolvedValue({
      name: 'Cloud Manager',
      role: 'Manager',
      pin: '9999'
    } as any);

    const result = await store.getState().login('9999', '1480');

    expect(result).toBe(true);
    expect(firebaseServices.signInTenant).toHaveBeenCalledWith('1480', '9999');
    expect(firebaseServices.getUserByPin).toHaveBeenCalledWith('1480', '9999');
    expect(store.getState().isAuthenticated).toBe(true);
    expect(store.getState().activeManager).toEqual({
      name: 'Cloud Manager',
      role: 'Manager',
      pin: '9999'
    });
  });

  it('returns true for Guest PIN (1234)', async () => {
    // Fails standard sign-in, but should still authenticate as guest due to matching storePin
    vi.mocked(firebaseServices.signInTenant).mockResolvedValue(false);
    vi.mocked(firebaseServices.createTenantAuth).mockResolvedValue(true);
    
    const result = await store.getState().login('1234', '1480');

    expect(result).toBe(true);
    expect(store.getState().isAuthenticated).toBe(true);
    expect(store.getState().activeManager.name).toBe('Default Supervisor');
  });

  it('returns false for invalid credentials', async () => {
    vi.mocked(firebaseServices.signInTenant).mockResolvedValue(false);
    vi.mocked(firebaseServices.getUserByPin).mockResolvedValue(null);

    const result = await store.getState().login('wrong-pin', '1480');

    expect(result).toBe(false);
    expect(store.getState().isAuthenticated).toBe(false);
  });
});
