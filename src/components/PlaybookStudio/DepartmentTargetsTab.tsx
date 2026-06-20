import React from 'react';
import { Compass, Check } from 'lucide-react';

export default function DepartmentTargetsTab({
  selectedDept, setSelectedDept, deptGoals, handleSaveDeptGoals
}) {
  const [editedGoals, setEditedGoals] = React.useState(deptGoals || {});

  React.useEffect(() => {
    if (deptGoals) setEditedGoals(deptGoals);
  }, [deptGoals]);

  const handleGoalChange = (key, value) => {
    const updated = {
      ...editedGoals,
      [selectedDept]: {
        ...(editedGoals[selectedDept] || {}),
        [key]: value
      }
    };
    setEditedGoals(updated);
    if (handleSaveDeptGoals) {
      handleSaveDeptGoals(updated);
    }
  };

  const handleSaveGoals = () => {
    if (handleSaveDeptGoals) {
      handleSaveDeptGoals(editedGoals);
    }
  };

  const deptKeys = [
    'Computers', 'Home Theater', 'Mobile', 'Appliances', 'Smart Home', 'Digital Imaging', 'Front End'
  ];
  return (
    <>
        <div style={{ maxWidth: '850px', margin: '0 auto', width: '100%' }}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--bby-yellow)' }}>
              <Compass size={20} color="var(--bby-yellow)" /> Department Goals Configurator
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.4 }}>
              Adapt store benchmarks dynamically by department. These goals are utilized across your roster dynamic audits and simulator scoring!
            </p>

            <div className="form-group">
              <label className="form-label">Select Department to Configure:</label>
              <select 
                className="form-control"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              >
                {deptKeys.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', padding: '1rem', borderRadius: '12px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                Editing targets for {selectedDept}
              </span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.25rem' }}>
                
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '10px' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#fff', display: 'block', marginBottom: '0.5rem' }}>
                    Memberships (Plus/Total) Evaluation
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <select 
                        className="form-control"
                        value={editedGoals[selectedDept]?.membershipsType || 'Hours'}
                        onChange={(e) => handleGoalChange('membershipsType', e.target.value)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                      >
                        <option value="Hours">Hours worked (1 per X hrs)</option>
                        <option value="Dollars">Dollar sales (1 per $D sales)</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <input 
                        type="number" 
                        className="form-control"
                        value={editedGoals[selectedDept]?.memberships !== undefined ? editedGoals[selectedDept].memberships : ''}
                        onChange={(e) => handleGoalChange('memberships', e.target.value)}
                        placeholder="Target value"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '10px' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#fff', display: 'block', marginBottom: '0.5rem' }}>
                    BBY Credit Cards (Apps) Evaluation
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <select 
                        className="form-control"
                        value={editedGoals[selectedDept]?.creditCardsType || 'Hours'}
                        onChange={(e) => handleGoalChange('creditCardsType', e.target.value)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                      >
                        <option value="Hours">Hours worked (1 per X hrs)</option>
                        <option value="Dollars">Dollar sales (1 per $D sales)</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <input 
                        type="number" 
                        className="form-control"
                        value={editedGoals[selectedDept]?.creditCards !== undefined ? editedGoals[selectedDept].creditCards : ''}
                        onChange={(e) => handleGoalChange('creditCards', e.target.value)}
                        placeholder="Target value"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.725rem' }}>GSP Attach % Goal:</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="form-control"
                      value={editedGoals[selectedDept]?.warranty !== undefined ? editedGoals[selectedDept].warranty : ''}
                      onChange={(e) => handleGoalChange('warranty', e.target.value)}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.725rem' }}>5 Star Surveys Goal:</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="form-control"
                      value={editedGoals[selectedDept]?.surveys !== undefined ? editedGoals[selectedDept].surveys : ''}
                      onChange={(e) => handleGoalChange('surveys', e.target.value)}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>

              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.725rem' }}>RPH index Target ($/hr):</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={editedGoals[selectedDept]?.rph !== undefined ? editedGoals[selectedDept].rph : ''}
                  onChange={(e) => handleGoalChange('rph', e.target.value)}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                />
              </div>

              {(selectedDept === 'Computing' || selectedDept === 'Home Theatre') && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '10px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.725rem' }}>Basket size Goal ($):</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={editedGoals[selectedDept]?.basket !== undefined ? editedGoals[selectedDept].basket : ''}
                      onChange={(e) => handleGoalChange('basket', e.target.value)}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    />
                  </div>
                  {selectedDept === 'Computing' && (
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.725rem' }}>M365 Attach % Goal:</label>
                      <input 
                        type="number" 
                        step="0.1"
                        className="form-control"
                        value={editedGoals[selectedDept]?.m365 !== undefined ? editedGoals[selectedDept].m365 : ''}
                        onChange={(e) => handleGoalChange('m365', e.target.value)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      />
                    </div>
                  )}
                  {selectedDept === 'Home Theatre' && (
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.725rem' }}>Audio Attach % Goal:</label>
                      <input 
                        type="number" 
                        step="0.1"
                        className="form-control"
                        value={editedGoals[selectedDept]?.audio !== undefined ? editedGoals[selectedDept].audio : ''}
                        onChange={(e) => handleGoalChange('audio', e.target.value)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      />
                    </div>
                  )}
                </div>
              )}

              <button className="btn btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }} onClick={handleSaveGoals}>
                Save {selectedDept} Targets
              </button>

            </div>
          </div>
        
      </div>
    </>
  );
}
