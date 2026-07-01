import React, { useState } from 'react';
import { Key, Check } from 'lucide-react';
import { useStore } from '../../../store/useStore';

import { StoreState } from '../../../types/store';

export default function StorePinSecurityCard() {
  const playbookSettings = useStore((state: StoreState) => state.playbookSettings);
  const apiKey = useStore((state: StoreState) => state.apiKey);
  const saveSettings = useStore((state: StoreState) => state.saveSettings);

  const [storePin, setStorePin] = useState(playbookSettings?.storePin || '1234');

  React.useEffect(() => {
    if (playbookSettings?.storePin) {
      setStorePin(playbookSettings.storePin);
    }
  }, [playbookSettings?.storePin]);

  const handleSavePin = () => {
    if (!playbookSettings || !saveSettings || !apiKey) return;
    saveSettings({
      apiKey: apiKey,
      playbookSettings: {
        ...playbookSettings,
        storePin
      }
    });
    alert('Store PIN saved securely!');
  };

  return (
    <div className="glass-card" data-testid="store-pin-security-card">
      <h3 className="text-xl mb-md flex-center-y gap-sm">
        <Key size={20} color="var(--bby-yellow)" /> Store Passcode PIN Security
      </h3>
      <p className="text-sm text-secondary mb-xl">
        Configure the 4-digit supervisor access passcode PIN. This passcode locks all dashboards, store rosters, and settings configurations from unauthorized advisor modifications.
      </p>

      <div className="form-group m-0">
        <label className="form-label" htmlFor="store-pin-input">Supervisor 4-Digit PIN:</label>
        <div className="flex gap-sm items-center">
          <input 
            id="store-pin-input"
            type="text" 
            maxLength={4}
            className="form-control text-lg font-bold w-[120px] text-center tracking-[0.25em]" 
            placeholder="e.g. 1234"
            value={storePin}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setStorePin(val);
            }}
            data-testid="store-pin-input"
          />
          <button 
            className="btn btn-primary px-lg py-sm text-sm font-bold flex-center-y gap-xs cursor-pointer"
            onClick={handleSavePin}
            data-testid="save-pin-btn"
          >
            <Check size={16} /> Save PIN
          </button>
        </div>
        <p className="text-xs text-muted mt-sm">
          Default is 1234. Change this PIN to lock out access on floor tablets. PIN must be exactly 4 digits.
        </p>
      </div>
    </div>
  );
}
