import React from 'react';

export interface WizardEditFormState {
  name: string;
  dept: string;
  hours: number | string;
  memberships?: number | string;
  creditCards?: number | string;
  warranty?: number | string;
  surveys?: number | string;
  rph?: number | string;
  transactions?: number | string;
  basket?: number | string;
  m365?: number | string;
  audio?: number | string;
  focus5?: boolean;
  gap?: string;
}

export interface WizardStep1GeneralProps {
  editForm: WizardEditFormState;
  setEditForm: React.Dispatch<React.SetStateAction<WizardEditFormState>>;
  DEPARTMENTS: string[];
}

export default function WizardStep1General({ 

  editForm,
  setEditForm,
  DEPARTMENTS
 }: WizardStep1GeneralProps) {
  return (
    <>
      <div className="flex-column gap-xl animate-fade-in">
        <div className="form-group">
          <label className="form-label text-xs">Associate Name:</label>
          <input 
            type="text" 
            className="form-control px-md py-sm text-sm" 
            value={editForm?.name || ''}
            onChange={(e) => setEditForm((prev: WizardEditFormState) => ({ ...prev, name: e.target.value }))}
            data-testid="wizard-step1-name-input"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label text-xs">Department:</label>
          <select 
            className="form-control px-md py-sm text-sm"
            value={editForm?.dept || ''}
            onChange={(e) => setEditForm((prev: WizardEditFormState) => ({ ...prev, dept: e.target.value }))}
            data-testid="wizard-step1-dept-select"
          >
            {DEPARTMENTS?.map(d => (
              <option key={d} value={d}>{d}</option>
            )) || []}
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label text-xs">Hours Worked:</label>
          <div className="flex-center gap-sm justify-start">
            <button 
              type="button" 
              className="stepper-btn" 
              onClick={() => setEditForm((prev: WizardEditFormState) => ({ ...prev, hours: Math.max(0, parseFloat((parseFloat(prev.hours?.toString() || "0") - 1).toFixed(1))) }))}
              data-testid="wizard-step1-hours-minus"
            >
              -
            </button>
            <input 
              type="number" 
              className="form-control px-md py-sm text-sm text-center" 
              value={editForm?.hours ?? 0}
              onChange={(e) => setEditForm((prev: WizardEditFormState) => ({ ...prev, hours: e.target.value }))}
              data-testid="wizard-step1-hours-input"
            />
            <button 
              type="button" 
              className="stepper-btn" 
              onClick={() => setEditForm((prev: WizardEditFormState) => ({ ...prev, hours: parseFloat((parseFloat(prev.hours?.toString() || "0") + 1).toFixed(1)) }))}
              data-testid="wizard-step1-hours-plus"
            >
              +
            </button>
          </div>
        </div>

        <div className="form-group flex-center justify-start gap-sm mt-sm">
          <input 
            type="checkbox" 
            id="edit-focus5"
            className="w-4 h-4 cursor-pointer"
            checked={!!editForm?.focus5}
            onChange={(e) => setEditForm((prev: WizardEditFormState) => ({ ...prev, focus5: e.target.checked }))}
            data-testid="wizard-step1-focus5-checkbox"
          />
          <label htmlFor="edit-focus5" className="text-sm text-white cursor-pointer font-bold m-0">
            🔥 Supervisor Focus 5 List (Priority Shift Coaching)
          </label>
        </div>
      </div>
    </>
  );
}
