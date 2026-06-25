import React from 'react';
import { WizardEditFormState } from './WizardStep1General';

export interface WizardStep2AttachProps {
  editForm: WizardEditFormState;
  setEditForm: React.Dispatch<React.SetStateAction<WizardEditFormState>>;
}

export default function WizardStep2Attach({ 
  editForm,
  setEditForm
 }: WizardStep2AttachProps) {
  return (
    <>
      <div className="flex-column gap-xl animate-fade-in">
        <div className="form-group">
          <label className="form-label text-xs">Memberships Attach:</label>
          <div className="flex-center gap-sm justify-start">
            <button 
              type="button" 
              className="stepper-btn" 
              onClick={() => setEditForm(prev => ({ ...prev, memberships: Math.max(0, parseInt(String(prev.memberships || '0'), 10) - 1) }))}
              data-testid="wizard-step2-memberships-minus"
            >
              -
            </button>
            <input 
              type="number" 
              className="form-control px-md py-sm text-sm text-center" 
              value={editForm.memberships ?? 0}
              onChange={(e) => setEditForm(prev => ({ ...prev, memberships: e.target.value }))}
              data-testid="wizard-step2-memberships-input"
            />
            <button 
              type="button" 
              className="stepper-btn" 
              onClick={() => setEditForm(prev => ({ ...prev, memberships: parseInt(String(prev.memberships || '0'), 10) + 1 }))}
              data-testid="wizard-step2-memberships-plus"
            >
              +
            </button>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label text-xs">BBY Credit Card Apps:</label>
          <div className="flex-center gap-sm justify-start">
            <button 
              type="button" 
              className="stepper-btn" 
              onClick={() => setEditForm(prev => ({ ...prev, creditCards: Math.max(0, parseInt(String(prev.creditCards || '0'), 10) - 1) }))}
              data-testid="wizard-step2-creditcards-minus"
            >
              -
            </button>
            <input 
              type="number" 
              className="form-control px-md py-sm text-sm text-center" 
              value={editForm.creditCards ?? 0}
              onChange={(e) => setEditForm(prev => ({ ...prev, creditCards: e.target.value }))}
              data-testid="wizard-step2-creditcards-input"
            />
            <button 
              type="button" 
              className="stepper-btn" 
              onClick={() => setEditForm(prev => ({ ...prev, creditCards: parseInt(String(prev.creditCards || '0'), 10) + 1 }))}
              data-testid="wizard-step2-creditcards-plus"
            >
              +
            </button>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label text-xs">GSP/Warranty Attach %:</label>
          <div className="flex-center gap-sm justify-start">
            <button 
              type="button" 
              className="stepper-btn" 
              onClick={() => setEditForm(prev => ({ ...prev, warranty: Math.max(0, parseFloat((parseFloat(String(prev.warranty || '0')) - 1).toFixed(1))) }))}
              data-testid="wizard-step2-warranty-minus"
            >
              -
            </button>
            <input 
              type="number" 
              className="form-control px-md py-sm text-sm text-center" 
              value={editForm.warranty ?? 0}
              onChange={(e) => setEditForm(prev => ({ ...prev, warranty: e.target.value }))}
              data-testid="wizard-step2-warranty-input"
            />
            <button 
              type="button" 
              className="stepper-btn" 
              onClick={() => setEditForm(prev => ({ ...prev, warranty: parseFloat((parseFloat(String(prev.warranty || '0')) + 1).toFixed(1)) }))}
              data-testid="wizard-step2-warranty-plus"
            >
              +
            </button>
          </div>
        </div>

        {/* Conditional Department-Specific Metrics */}
        {(editForm.dept === 'Computing' || editForm.dept === 'Home Theatre') && (
          <div className="form-group">
            <label className="form-label text-xs">Basket Size ($):</label>
            <div className="flex-center gap-sm justify-start">
              <button 
                type="button" 
                className="stepper-btn" 
                onClick={() => setEditForm(prev => ({ ...prev, basket: Math.max(0, parseFloat((parseFloat(String(prev.basket || '0')) - 10).toFixed(2))) }))}
                data-testid="wizard-step2-basket-minus"
              >
                -10
              </button>
              <input 
                type="number" 
                step="0.01"
                className="form-control px-md py-sm text-sm text-center" 
                value={editForm.basket ?? 0}
                onChange={(e) => setEditForm(prev => ({ ...prev, basket: e.target.value }))}
                data-testid="wizard-step2-basket-input"
              />
              <button 
                type="button" 
                className="stepper-btn" 
                onClick={() => setEditForm(prev => ({ ...prev, basket: parseFloat((parseFloat(String(prev.basket || '0')) + 10).toFixed(2)) }))}
                data-testid="wizard-step2-basket-plus"
              >
                +10
              </button>
            </div>
          </div>
        )}
        
        {editForm.dept === 'Computing' && (
          <div className="form-group">
            <label className="form-label text-xs">Microsoft 365 Attach %:</label>
            <div className="flex-center gap-sm justify-start">
              <button 
                type="button" 
                className="stepper-btn" 
                onClick={() => setEditForm(prev => ({ ...prev, m365: Math.max(0, parseFloat((parseFloat(String(prev.m365 || '0')) - 5).toFixed(1))) }))}
                data-testid="wizard-step2-m365-minus"
              >
                -5
              </button>
              <input 
                type="number" 
                step="0.1"
                className="form-control px-md py-sm text-sm text-center" 
                value={editForm.m365 ?? 0}
                onChange={(e) => setEditForm(prev => ({ ...prev, m365: e.target.value }))}
                data-testid="wizard-step2-m365-input"
              />
              <button 
                type="button" 
                className="stepper-btn" 
                onClick={() => setEditForm(prev => ({ ...prev, m365: parseFloat((parseFloat(String(prev.m365 || '0')) + 5).toFixed(1)) }))}
                data-testid="wizard-step2-m365-plus"
              >
                +5
              </button>
            </div>
          </div>
        )}

        {editForm.dept === 'Home Theatre' && (
          <div className="form-group">
            <label className="form-label text-xs">Audio Attach %:</label>
            <div className="flex-center gap-sm justify-start">
              <button 
                type="button" 
                className="stepper-btn" 
                onClick={() => setEditForm(prev => ({ ...prev, audio: Math.max(0, parseFloat((parseFloat(String(prev.audio || '0')) - 5).toFixed(1))) }))}
                data-testid="wizard-step2-audio-minus"
              >
                -5
              </button>
              <input 
                type="number" 
                step="0.1"
                className="form-control px-md py-sm text-sm text-center" 
                value={editForm.audio ?? 0}
                onChange={(e) => setEditForm(prev => ({ ...prev, audio: e.target.value }))}
                data-testid="wizard-step2-audio-input"
              />
              <button 
                type="button" 
                className="stepper-btn" 
                onClick={() => setEditForm(prev => ({ ...prev, audio: parseFloat((parseFloat(String(prev.audio || '0')) + 5).toFixed(1)) }))}
                data-testid="wizard-step2-audio-plus"
              >
                +5
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
