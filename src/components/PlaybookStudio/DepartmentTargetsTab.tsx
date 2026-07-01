import React, { useState, useEffect } from 'react';
import { Compass, Check } from 'lucide-react';
import { useStore } from '../../store/useStore';

import { StoreState } from '../../types/store';
import { DeptGoal } from '../../types/index';

export default function DepartmentTargetsTab() {
  const [selectedDept, setSelectedDept] = useState('Computers');
  
  const deptGoals = useStore((state: StoreState) => state.deptGoals);
  const saveDeptGoals = useStore((state: StoreState) => state.saveDeptGoals);

  const [editedGoals, setEditedGoals] = useState<Record<string, DeptGoal>>(deptGoals || {});

  useEffect(() => {
    if (deptGoals && Object.keys(deptGoals).length > 0) {
      setEditedGoals(deptGoals);
    }
  }, [deptGoals]);

  const handleGoalChange = (key: keyof DeptGoal, value: string | number) => {
    setEditedGoals(prev => ({
      ...prev,
      [selectedDept]: {
        ...(prev[selectedDept] || {} as DeptGoal),
        [key]: value
      }
    }));
  };

  const handleSaveGoals = () => {
    if (saveDeptGoals) {
      saveDeptGoals(editedGoals);
    }
  };

  const deptKeys = [
    'Computers', 'Home Theater', 'Mobile', 'Appliances', 'Smart Home', 'Digital Imaging', 'Front End'
  ];

  return (
    <>
        <div className="w-full max-w-[850px] mx-auto" data-testid="department-targets-tab">
          <div className="glass-card flex-column gap-xl">
            <h3 className="text-xl flex-center-y gap-sm text-bby-yellow m-0">
              <Compass size={20} color="var(--bby-yellow)" /> Department Goals Configurator
            </h3>
            <p className="text-sm text-secondary leading-relaxed m-0">
              Adapt store benchmarks dynamically by department. These goals are utilized across your roster dynamic audits and simulator scoring!
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="dept-select">Select Department to Configure:</label>
              <select 
                id="dept-select"
                className="form-control text-sm"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                data-testid="dept-select"
              >
                {deptKeys.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="flex-column gap-md bg-white-alpha-01 border border-[var(--border-glass)] p-md rounded-xl">
              <span className="text-xs text-muted uppercase font-bold tracking-wider">
                Editing targets for {selectedDept}
              </span>
              
              <div className="flex-column gap-md mt-xs">
                
                <div className="p-sm bg-white-alpha-01 border border-[var(--border-glass)] rounded-lg">
                  <label className="form-label text-xs text-white block mb-sm">
                    Memberships (Plus/Total) Evaluation
                  </label>
                  <div className="grid grid-cols-[1.2fr_1fr] gap-sm">
                    <div className="form-group m-0">
                      <select 
                        className="form-control px-sm py-xs text-sm"
                        value={editedGoals[selectedDept]?.membershipsType || 'Hours'}
                        onChange={(e) => handleGoalChange('membershipsType', e.target.value)}
                        data-testid="memberships-type-select"
                      >
                        <option value="Hours">Hours worked (1 per X hrs)</option>
                        <option value="Dollars">Dollar sales (1 per $D sales)</option>
                      </select>
                    </div>
                    <div className="form-group m-0">
                      <input 
                        type="number" 
                        className="form-control px-sm py-xs text-sm"
                        value={editedGoals[selectedDept]?.memberships !== undefined ? editedGoals[selectedDept].memberships : ''}
                        onChange={(e) => handleGoalChange('memberships', parseFloat(e.target.value))}
                        placeholder="Target value"
                        data-testid="memberships-target-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-sm bg-white-alpha-01 border border-[var(--border-glass)] rounded-lg">
                  <label className="form-label text-xs text-white block mb-sm">
                    BBY Credit Cards (Apps) Evaluation
                  </label>
                  <div className="grid grid-cols-[1.2fr_1fr] gap-sm">
                    <div className="form-group m-0">
                      <select 
                        className="form-control px-sm py-xs text-sm"
                        value={editedGoals[selectedDept]?.creditCardsType || 'Hours'}
                        onChange={(e) => handleGoalChange('creditCardsType', e.target.value)}
                        data-testid="credit-cards-type-select"
                      >
                        <option value="Hours">Hours worked (1 per X hrs)</option>
                        <option value="Dollars">Dollar sales (1 per $D sales)</option>
                      </select>
                    </div>
                    <div className="form-group m-0">
                      <input 
                        type="number" 
                        className="form-control px-sm py-xs text-sm"
                        value={editedGoals[selectedDept]?.creditCards !== undefined ? editedGoals[selectedDept].creditCards : ''}
                        onChange={(e) => handleGoalChange('creditCards', parseFloat(e.target.value))}
                        placeholder="Target value"
                        data-testid="credit-cards-target-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-sm">
                  <div className="form-group m-0">
                    <label className="form-label text-xs">GSP Attach % Goal:</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="form-control px-sm py-xs text-sm"
                      value={editedGoals[selectedDept]?.warranty !== undefined ? editedGoals[selectedDept].warranty : ''}
                      onChange={(e) => handleGoalChange('warranty', parseFloat(e.target.value))}
                      data-testid="warranty-target-input"
                    />
                  </div>
                  <div className="form-group m-0">
                    <label className="form-label text-xs">5 Star Surveys Goal:</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="form-control px-sm py-xs text-sm"
                      value={editedGoals[selectedDept]?.surveys !== undefined ? editedGoals[selectedDept].surveys : ''}
                      onChange={(e) => handleGoalChange('surveys', parseFloat(e.target.value))}
                      data-testid="surveys-target-input"
                    />
                  </div>
                </div>

              </div>

              <div className="form-group mt-sm">
                <label className="form-label text-xs">RPH index Target ($/hr):</label>
                <input 
                  type="number" 
                  className="form-control px-sm py-xs text-sm"
                  value={editedGoals[selectedDept]?.rph !== undefined ? editedGoals[selectedDept].rph : ''}
                  onChange={(e) => handleGoalChange('rph', parseFloat(e.target.value))}
                  data-testid="rph-target-input"
                />
              </div>

              {(selectedDept === 'Computers' || selectedDept === 'Home Theater') && (
                <div className="grid grid-cols-2 gap-sm p-sm bg-white-alpha-01 border border-[var(--border-glass)] rounded-lg">
                  <div className="form-group m-0">
                    <label className="form-label text-xs">Basket size Goal ($):</label>
                    <input 
                      type="number" 
                      className="form-control px-sm py-xs text-sm"
                      value={editedGoals[selectedDept]?.basket !== undefined ? editedGoals[selectedDept].basket : ''}
                      onChange={(e) => handleGoalChange('basket', parseFloat(e.target.value))}
                      data-testid="basket-target-input"
                    />
                  </div>
                  {selectedDept === 'Computers' && (
                    <div className="form-group m-0">
                      <label className="form-label text-xs">M365 Attach % Goal:</label>
                      <input 
                        type="number" 
                        step="0.1"
                        className="form-control px-sm py-xs text-sm"
                        value={editedGoals[selectedDept]?.m365 !== undefined ? editedGoals[selectedDept].m365 : ''}
                        onChange={(e) => handleGoalChange('m365', parseFloat(e.target.value))}
                        data-testid="m365-target-input"
                      />
                    </div>
                  )}
                  {selectedDept === 'Home Theater' && (
                    <div className="form-group m-0">
                      <label className="form-label text-xs">Audio Attach % Goal:</label>
                      <input 
                        type="number" 
                        step="0.1"
                        className="form-control px-sm py-xs text-sm"
                        value={editedGoals[selectedDept]?.audio !== undefined ? editedGoals[selectedDept].audio : ''}
                        onChange={(e) => handleGoalChange('audio', parseFloat(e.target.value))}
                        data-testid="audio-target-input"
                      />
                    </div>
                  )}
                </div>
              )}

              <button 
                className="btn btn-primary w-full p-sm text-sm cursor-pointer mt-md flex-center-y justify-center gap-xs font-bold" 
                onClick={handleSaveGoals}
                data-testid="save-dept-targets-btn"
              >
                <Check size={16} /> Save {selectedDept} Targets
              </button>

            </div>
          </div>
        
      </div>
    </>
  );
}
