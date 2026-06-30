import React, { useState, useRef, useEffect } from 'react';
import { Employee } from '../../types';

interface OcvData {
  empId: string;
  connect: boolean;
  recommend: boolean;
  protect: boolean;
  close: boolean;
  notes: string;
}

interface OcvObservationFormProps {
  roster: Employee[];
  getEmployeesOnShift: () => Employee[];
  handleLogOcvObservation: (data: OcvData) => void;
}

export default function OcvObservationForm({
  getEmployeesOnShift,
  roster,
  handleLogOcvObservation,
}: OcvObservationFormProps) {
  const [ocvEmpId, setOcvEmpId] = useState('');
  const [ocvConnect, setOcvConnect] = useState(false);
  const [ocvRecommend, setOcvRecommend] = useState(false);
  const [ocvProtect, setOcvProtect] = useState(false);
  const [ocvClose, setOcvClose] = useState(false);
  const [ocvNotes, setOcvNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const isMounted = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await handleLogOcvObservation({
      empId: ocvEmpId,
      connect: ocvConnect,
      recommend: ocvRecommend,
      protect: ocvProtect,
      close: ocvClose,
      notes: ocvNotes,
    });
    
    if (isMounted.current) {
      setShowSuccess(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (isMounted.current) setShowSuccess(false);
      }, 3000);
      
      setOcvEmpId('');
      setOcvConnect(false);
      setOcvRecommend(false);
      setOcvProtect(false);
      setOcvClose(false);
      setOcvNotes('');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card p-xl">
      <h3 className="text-1-1rem font-bold mb-xs flex-center gap-sm text-white justify-start">
        ⏱️ 30-Second OCV Floor Observation
      </h3>
      <p className="text-xs text-secondary mb-lg">
        Observe behavior on the fly. Score out of 4 benchmarks.
      </p>

      <div className="flex-column gap-md">
        <div className="form-group mb-sm">
          <label className="form-label text-xs text-secondary">Select Associate:</label>
          <select 
            className="form-control bg-obsidian text-sm h-38px w-full"
            value={ocvEmpId}
            onChange={(e) => setOcvEmpId(e.target.value)}
            data-testid="ocv-emp-select"
          >
            <option value="">-- Select Associate --</option>
            {(() => {
              const onShift = getEmployeesOnShift() || [];
              const offShift = (roster || []).filter(emp => !onShift.some(os => os.id === emp.id));
              return (
                <>
                  {onShift.length > 0 && (
                    <optgroup label="Associates On Shift">
                      {onShift.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept || 'Floor'})</option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Other Roster Associates">
                    {offShift.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.dept || 'Floor'})</option>
                    ))}
                  </optgroup>
                </>
              );
            })()}
          </select>
        </div>

        {/* Checkbox Benchmarks */}
        <div className="flex-column gap-sm bg-black-alpha-15 p-md rounded-lg border-glass">
          <label className="flex-center gap-sm cursor-pointer text-xs text-white justify-start">
            <input 
              type="checkbox" 
              checked={ocvConnect} 
              onChange={(e) => setOcvConnect(e.target.checked)} 
              className="accent-bby-blue"
              data-testid="ocv-checkbox-connect"
            />
            <span><strong>Connect</strong> (Greeting & discovery)</span>
          </label>
          <label className="flex-center gap-sm cursor-pointer text-xs text-white justify-start">
            <input 
              type="checkbox" 
              checked={ocvRecommend} 
              onChange={(e) => setOcvRecommend(e.target.checked)} 
              className="accent-bby-blue"
              data-testid="ocv-checkbox-recommend"
            />
            <span><strong>Recommend</strong> (Solution matching)</span>
          </label>
          <label className="flex-center gap-sm cursor-pointer text-xs text-white justify-start">
            <input 
              type="checkbox" 
              checked={ocvProtect} 
              onChange={(e) => setOcvProtect(e.target.checked)} 
              className="accent-bby-blue"
              data-testid="ocv-checkbox-protect"
            />
            <span><strong>Protect</strong> (Membership & GSP attach)</span>
          </label>
          <label className="flex-center gap-sm cursor-pointer text-xs text-white justify-start">
            <input 
              type="checkbox" 
              checked={ocvClose} 
              onChange={(e) => setOcvClose(e.target.checked)} 
              className="accent-bby-blue"
              data-testid="ocv-checkbox-close"
            />
            <span><strong>Close</strong> (Financing card & survey ask)</span>
          </label>
        </div>

        <div className="form-group mb-xs">
          <label className="form-label text-xs text-secondary">Micro Observations / Notes:</label>
          <textarea
            className="form-control text-xs bg-obsidian"
            rows={2}
            placeholder="Quick coaching feedback note..."
            value={ocvNotes}
            onChange={(e) => setOcvNotes(e.target.value)}
            data-testid="ocv-notes-textarea"
          />
        </div>

        <button 
          className="btn btn-primary p-md text-sm font-bold w-full"
          onClick={handleSubmit}
          disabled={!ocvEmpId || isSubmitting}
          data-testid="ocv-submit-btn"
        >
          {isSubmitting ? 'Logging...' : 'Log Floor Observation'}
        </button>

        {showSuccess && (
          <div className="text-success text-xs text-center mt-xs font-semibold" data-testid="ocv-success-msg">
            ✅ OCV Observation logged successfully!
          </div>
        )}
      </div>
    </div>
  );
}
