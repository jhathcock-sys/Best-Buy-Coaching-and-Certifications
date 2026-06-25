import React from 'react';

export interface LogBuilderForm {
  employeeName?: string;
  metricGap?: string;
  discFocus?: string | string[];
  strengths?: string;
  gapDetails?: string;
  rawObservation?: string;
  [key: string]: any;
}

export interface LogBuilderFormFieldsProps {
  builderForm: LogBuilderForm;
  setBuilderForm: React.Dispatch<React.SetStateAction<LogBuilderForm>>;
}

export default function LogBuilderFormFields({ 
  builderForm, 
  setBuilderForm 
}: LogBuilderFormFieldsProps) {
  return (
    <div className="flex-column gap-xl" data-testid="log-builder-form-fields">
      
      {/* Basic Info */}
      <div className="flex-row gap-md">
        <div className="flex-1">
          <label className="block mb-xs text-white text-sm">Employee Name</label>
          <input 
            type="text" 
            className="form-control"
            value={builderForm?.employeeName || ''}
            onChange={e => setBuilderForm(prev => ({ ...prev, employeeName: e.target.value }))}
            placeholder="e.g., John Doe"
            data-testid="input-employee-name"
          />
        </div>
        <div className="flex-1">
          <label className="block mb-xs text-white text-sm">Metric Focus</label>
          <select 
            className="form-control"
            value={builderForm?.metricGap || 'Memberships'}
            onChange={e => setBuilderForm(prev => ({ ...prev, metricGap: e.target.value }))}
            data-testid="select-metric-focus"
          >
            <option value="Memberships">Memberships</option>
            <option value="Credit Cards">Credit Cards</option>
            <option value="GSP / Warranty">GSP / Warranty</option>
            <option value="5-Star Surveys">5-Star Surveys</option>
            <option value="Revenue Per Hour">Revenue Per Hour</option>
            <option value="Basket Size">Basket Size</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block mb-xs text-white text-sm">DISC Focus Strategy</label>
        <select 
          className="form-control"
          value={Array.isArray(builderForm?.discFocus) ? builderForm.discFocus[0] : (builderForm?.discFocus || 'Solve')}
          onChange={e => setBuilderForm(prev => ({ ...prev, discFocus: [e.target.value] }))}
          data-testid="select-disc-focus"
        >
          <option value="Discover">Discover (Asking Questions)</option>
          <option value="Inspire">Inspire (Demoing & Value)</option>
          <option value="Solve">Solve (Closing & Objections)</option>
          <option value="Commit">Commit (Follow up)</option>
        </select>
      </div>

      {/* Text Areas */}
      <div>
        <label className="block mb-xs text-white text-sm">Observed Strengths</label>
        <textarea 
          className="form-control resize-y"
          value={builderForm?.strengths || ''}
          onChange={e => setBuilderForm(prev => ({ ...prev, strengths: e.target.value }))}
          placeholder="What did they do well during your observation?"
          rows={3}
          data-testid="textarea-strengths"
        />
      </div>

      <div>
        <label className="block mb-xs text-white text-sm">Gap / Opportunity Details</label>
        <textarea 
          className="form-control resize-y"
          value={builderForm?.gapDetails || ''}
          onChange={e => setBuilderForm(prev => ({ ...prev, gapDetails: e.target.value }))}
          placeholder="What specific behavior or metric are you addressing?"
          rows={3}
          data-testid="textarea-gap-details"
        />
      </div>

      <div>
        <label className="block mb-xs text-white text-sm">Raw Observation Notes (Optional)</label>
        <textarea 
          className="form-control resize-y"
          value={builderForm?.rawObservation || ''}
          onChange={e => setBuilderForm(prev => ({ ...prev, rawObservation: e.target.value }))}
          placeholder="Paste unformatted or rough notes here, and the AI will parse them..."
          rows={3}
          data-testid="textarea-raw-observation"
        />
      </div>

    </div>
  );
}
