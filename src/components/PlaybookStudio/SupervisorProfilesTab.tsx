// @ts-nocheck
import React from 'react';
import { ShieldAlert, Plus, Edit2, Trash2, Check, Eye, EyeOff, Key, Users, UserPlus } from 'lucide-react';

export default function SupervisorProfilesTab({ 
  managers, 
  newManagerName, setNewManagerName,
  newManagerRole, setNewManagerRole,
  newManagerPin, setNewManagerPin,
  editingManagerIndex, setEditingManagerIndex,
  editingManagerName, setEditingManagerName,
  editingManagerRole, setEditingManagerRole,
  editingManagerPin, setEditingManagerPin,
  visiblePins, togglePinVisibility,
  handleAddManager,
  startEditingManager,
  saveEditingManager,
  handleDeleteManager,
  storePin, setStorePin
}) {
  return (
    <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Store Passcode PIN Security Card */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={20} color="var(--bby-yellow)" /> Store Passcode PIN Security
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
              Configure the 4-digit supervisor access passcode PIN. This passcode locks all dashboards, store rosters, and settings configurations from unauthorized advisor modifications.
            </p>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Supervisor 4-Digit PIN:</label>
              <input 
                type="text" 
                maxLength={4}
                className="form-control" 
                placeholder="e.g. 1234"
                value={storePin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setStorePin(val);
                }}
                style={{ letterSpacing: '0.25em', fontSize: '1.1rem', fontWeight: 'bold', width: '120px', textAlign: 'center' }}
              />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem', margin: '0.35rem 0 0 0' }}>
                Default is 1234. Change this PIN to lock out access on floor tablets. PIN must be exactly 4 digits.
              </p>
            </div>
          </div>

          {/* Supervisor Profiles & PINs Card */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="var(--info)" /> Supervisor Profiles & PINs
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
              Configure individual supervisor accounts and unique 4-digit PINs for dashboard logins and coaching attribution.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {managers.map((mgr, idx) => {
                const isEditing = editingManagerIndex === idx;
                const isPinVisible = visiblePins[idx];

                return (
                  <div 
                    key={idx} 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: '0.75rem',
                      background: 'rgba(255,255,255,0.01)', 
                      border: '1px solid var(--border-glass)', 
                      padding: '1rem', 
                      borderRadius: '12px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Name</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                              value={editingManagerName}
                              onChange={(e) => setEditingManagerName(e.target.value)}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Role</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                              value={editingManagerRole}
                              onChange={(e) => setEditingManagerRole(e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>4-Digit PIN</label>
                          <input 
                            type="text" 
                            maxLength={4}
                            className="form-control" 
                            placeholder="e.g. 2001"
                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', width: '100px', letterSpacing: '0.1em' }}
                            value={editingManagerPin}
                            onChange={(e) => setEditingManagerPin(e.target.value.replace(/\D/g, ''))}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <button className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={handleSaveEditManager}>
                            Save
                          </button>
                          <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setEditingManagerIndex(null)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{mgr.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{mgr.role}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--bby-yellow)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span>PIN: {isPinVisible ? mgr.pin : '••••'}</span>
                            <button 
                              type="button" 
                              onClick={() => togglePinVisibility(idx)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0 }}
                            >
                              {isPinVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem', borderRadius: '8px' }} 
                            onClick={() => handleEditManager(idx)}
                            title="Edit Supervisor"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem', borderRadius: '8px', color: 'var(--error)' }} 
                            onClick={() => handleDeleteManager(idx)}
                            title="Delete Supervisor"
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

            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <UserPlus size={16} color="var(--success)" /> Add New Supervisor
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Supervisor Name"
                    style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                    value={newManagerName}
                    onChange={(e) => setNewManagerName(e.target.value)}
                  />
                  <select 
                    className="form-control" 
                    style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                    value={newManagerRole}
                    onChange={(e) => setNewManagerRole(e.target.value)}
                  >
                    <option value="Experience Manager Sales Focused">Experience Manager Sales Focused</option>
                    <option value="Experience Manager Ops Focused">Experience Manager Ops Focused</option>
                    <option value="Experience Supervisor Sales">Experience Supervisor Sales</option>
                    <option value="Experience Supervisor Sales and Front End">Experience Supervisor Sales and Front End</option>
                    <option value="GM">GM</option>
                    <option value="Store Leader">Store Leader</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    maxLength={4}
                    className="form-control" 
                    placeholder="4-Digit PIN"
                    style={{ fontSize: '0.8rem', padding: '0.5rem', width: '110px', letterSpacing: '0.05em' }}
                    value={newManagerPin}
                    onChange={(e) => setNewManagerPin(e.target.value.replace(/\D/g, ''))}
                  />
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    onClick={handleAddManager}
                  >
                    <Plus size={14} /> Add Supervisor
                  </button>
                </div>
              </div>
            </div>
          </div>
        
      </div>
    </>
  );
}
