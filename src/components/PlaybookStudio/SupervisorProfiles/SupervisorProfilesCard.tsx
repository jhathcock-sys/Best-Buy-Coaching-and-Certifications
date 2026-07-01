import React, { useState } from 'react';
import { Edit2, Trash2, Eye, EyeOff, Users, UserPlus, Plus } from 'lucide-react';
import { useStore } from '../../../store/useStore';

import { Manager } from '../../../types/index';
import { StoreState } from '../../../types/store';

export default function SupervisorProfilesCard() {
  const rawManagers = useStore((state: StoreState) => state.managers);
  const saveManagers = useStore((state: StoreState) => state.saveManagers);
  
  const managers = rawManagers || [];

  const [newManagerName, setNewManagerName] = useState('');
  const [newManagerRole, setNewManagerRole] = useState('Experience Supervisor Sales');
  const [newManagerPin, setNewManagerPin] = useState('');
  
  const [editingManagerIndex, setEditingManagerIndex] = useState<number | null>(null);
  const [editingManagerName, setEditingManagerName] = useState('');
  const [editingManagerRole, setEditingManagerRole] = useState('');
  const [editingManagerPin, setEditingManagerPin] = useState('');
  
  const [visiblePins, setVisiblePins] = useState<Record<number, boolean>>({});

  const handleAddManager = () => {
    if (!newManagerName.trim() || !newManagerRole.trim() || !newManagerPin.trim()) {
      alert("Error: All fields are required."); return;
    }
    const newMgr: Manager = { 
      name: newManagerName.trim(), 
      role: newManagerRole.trim(), 
      pin: newManagerPin.trim()
    };
    if (saveManagers) {
      saveManagers([...managers, newMgr]);
    }
    setNewManagerName(''); setNewManagerRole('Experience Supervisor Sales'); setNewManagerPin('');
  };

  const startEditingManager = (idx: number, mgr: Manager) => {
    setEditingManagerIndex(idx);
    setEditingManagerName(mgr.name);
    setEditingManagerRole(mgr.role || 'Experience Supervisor Sales');
    setEditingManagerPin(mgr.pin);
  };

  const saveEditingManager = () => {
    if (!editingManagerName.trim() || !editingManagerRole.trim() || !editingManagerPin.trim() || editingManagerIndex === null) return;
    const updated = [...managers];
    updated[editingManagerIndex] = { 
      ...updated[editingManagerIndex],
      name: editingManagerName.trim(), 
      role: editingManagerRole.trim(), 
      pin: editingManagerPin.trim() 
    };
    if (saveManagers) {
      saveManagers(updated);
    }
    setEditingManagerIndex(null);
  };

  const handleDeleteManager = (idx: number) => {
    if (confirm("Remove this supervisor?")) {
      const updated = [...managers];
      updated.splice(idx, 1);
      if (saveManagers) {
        saveManagers(updated);
      }
    }
  };

  const togglePinVisibility = (idx: number) => {
    setVisiblePins(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="glass-card" data-testid="supervisor-profiles-card">
      <h3 className="text-xl mb-md flex-center-y gap-sm">
        <Users size={20} color="var(--info)" /> Supervisor Profiles & PINs
      </h3>
      <p className="text-sm text-secondary mb-xl">
        Configure individual supervisor accounts and unique 4-digit PINs for dashboard logins and coaching attribution.
      </p>

      <div className="flex-column gap-md mb-xl">
        {managers.map((mgr, idx) => {
          const isEditing = editingManagerIndex === idx;
          const isPinVisible = visiblePins[idx];

          return (
            <div 
              key={idx} 
              className="flex-column gap-sm bg-white-alpha-01 border border-[var(--border-glass)] p-md rounded-xl transition-normal"
              data-testid={`manager-row-${idx}`}
            >
              {isEditing ? (
                <div className="flex-column gap-sm">
                  <div className="grid grid-cols-2 gap-sm">
                    <div>
                      <label className="text-xs text-secondary block mb-xs" htmlFor={`edit-name-${idx}`}>Name</label>
                      <input 
                        id={`edit-name-${idx}`}
                        type="text" 
                        className="form-control text-sm px-md py-sm" 
                        value={editingManagerName}
                        onChange={(e) => setEditingManagerName(e.target.value)}
                        data-testid={`edit-name-input-${idx}`}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-secondary block mb-xs" htmlFor={`edit-role-${idx}`}>Role</label>
                      <input 
                        id={`edit-role-${idx}`}
                        type="text" 
                        className="form-control text-sm px-md py-sm" 
                        value={editingManagerRole}
                        onChange={(e) => setEditingManagerRole(e.target.value)}
                        data-testid={`edit-role-input-${idx}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-secondary block mb-xs" htmlFor={`edit-pin-${idx}`}>4-Digit PIN</label>
                    <input 
                      id={`edit-pin-${idx}`}
                      type="text" 
                      maxLength={4}
                      className="form-control text-sm px-md py-sm w-[100px] tracking-[0.1em]" 
                      placeholder="e.g. 2001"
                      value={editingManagerPin}
                      onChange={(e) => setEditingManagerPin(e.target.value.replace(/\D/g, ''))}
                      data-testid={`edit-pin-input-${idx}`}
                    />
                  </div>
                  <div className="flex gap-sm mt-xs">
                    <button 
                      className="btn btn-primary px-md py-xs text-xs cursor-pointer" 
                      onClick={saveEditingManager}
                      data-testid={`save-edit-btn-${idx}`}
                    >
                      Save
                    </button>
                    <button 
                      className="btn btn-secondary px-md py-xs text-xs cursor-pointer" 
                      onClick={() => setEditingManagerIndex(null)}
                      data-testid={`cancel-edit-btn-${idx}`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-sm text-white" data-testid={`manager-name-${idx}`}>{mgr.name}</div>
                    <div className="text-xs text-secondary" data-testid={`manager-role-${idx}`}>{mgr.role}</div>
                    <div className="text-xs text-bby-yellow mt-xs flex-center-y gap-xs">
                      <span data-testid={`manager-pin-${idx}`}>PIN: {isPinVisible ? mgr.pin : '••••'}</span>
                      <button 
                        type="button" 
                        onClick={() => togglePinVisibility(idx)}
                        className="bg-transparent border-none cursor-pointer text-secondary p-0"
                        data-testid={`toggle-pin-btn-${idx}`}
                      >
                        {isPinVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-sm">
                    <button 
                      className="btn btn-secondary p-sm rounded-lg cursor-pointer" 
                      onClick={() => startEditingManager(idx, mgr)}
                      title="Edit Supervisor"
                      data-testid={`edit-mgr-btn-${idx}`}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      className="btn btn-secondary p-sm rounded-lg text-error cursor-pointer hover-bg-error hover-text-white transition-normal" 
                      onClick={() => handleDeleteManager(idx)}
                      title="Delete Supervisor"
                      data-testid={`delete-mgr-btn-${idx}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-[var(--border-glass)] pt-xl">
        <h4 className="text-sm text-white mb-md flex-center-y gap-xs">
          <UserPlus size={16} color="var(--success)" /> Add New Supervisor
        </h4>
        <div className="flex-column gap-md">
          <div className="grid grid-cols-[1.2fr_1fr] gap-sm">
            <input 
              type="text" 
              className="form-control text-sm p-sm" 
              placeholder="Supervisor Name"
              value={newManagerName}
              onChange={(e) => setNewManagerName(e.target.value)}
              data-testid="new-mgr-name-input"
            />
            <select 
              className="form-control text-sm p-sm" 
              value={newManagerRole}
              onChange={(e) => setNewManagerRole(e.target.value)}
              data-testid="new-mgr-role-select"
            >
              <option value="Experience Manager Sales Focused">Experience Manager Sales Focused</option>
              <option value="Experience Manager Ops Focused">Experience Manager Ops Focused</option>
              <option value="Experience Supervisor Sales">Experience Supervisor Sales</option>
              <option value="Experience Supervisor Sales and Front End">Experience Supervisor Sales and Front End</option>
              <option value="GM">GM</option>
              <option value="Store Leader">Store Leader</option>
            </select>
          </div>
          <div className="flex gap-sm items-center">
            <input 
              type="text" 
              maxLength={4}
              className="form-control text-sm p-sm w-[110px] tracking-[0.05em]" 
              placeholder="4-Digit PIN"
              value={newManagerPin}
              onChange={(e) => setNewManagerPin(e.target.value.replace(/\D/g, ''))}
              data-testid="new-mgr-pin-input"
            />
            <button 
              className="btn btn-primary px-lg py-sm text-sm flex-center-y gap-xs cursor-pointer"
              onClick={handleAddManager}
              data-testid="add-mgr-btn"
            >
              <Plus size={14} /> Add Supervisor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
