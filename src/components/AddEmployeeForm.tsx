import React, { useState, useEffect, useRef } from 'react';
import { EmployeeSchema } from '../schemas';
import { z } from 'zod';

export interface AddEmployeeFormProps {
  onAddEmployee: (emp: z.infer<typeof EmployeeSchema>) => void | Promise<void>;
  onCancel: () => void;
}

const DEPARTMENTS = ['Front End', 'General Sales', 'Appliances', 'Computing', 'Mobile', 'Home Theatre', 'Geek Squad'];

const INITIAL_FORM_STATE = {
  name: '',
  employeeNumber: '',
  dept: 'Front End',
  hours: '',
  memberships: '',
  creditCards: '',
  warranty: '',
  surveys: '',
  rph: '',
  transactions: '',
  basket: '',
  m365: '',
  audio: '',
  focus5: false,
  gap: 'None'
};

export default function AddEmployeeForm({ onAddEmployee, onCancel }: AddEmployeeFormProps) {
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Please enter the associate's name!");
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedEmp = EmployeeSchema.parse({
        id: `emp-${Date.now()}`,
        name: form.name.trim(),
        employeeNumber: form.employeeNumber.trim(),
        dept: form.dept,
        hours: parseFloat(form.hours) || 0,
        memberships: parseInt(form.memberships) || 0,
        creditCards: parseInt(form.creditCards) || 0,
        warranty: parseFloat(form.warranty) || 0.0,
        surveys: form.surveys === 'Failing' || form.surveys === 'failing' ? 0.2 : parseFloat(form.surveys) || 0.0,
        rph: parseInt(form.rph) || 0,
        transactions: parseInt(form.transactions) || 0,
        basket: (form.dept === 'Computing' || form.dept === 'Home Theatre') ? (parseFloat(form.basket) || 0) : 0,
        m365: form.dept === 'Computing' ? (parseFloat(form.m365) || 0) : 0,
        audio: form.dept === 'Home Theatre' ? (parseFloat(form.audio) || 0) : 0,
        focus5: form.focus5 || false,
        gap: form.gap || 'None'
      });
      await Promise.resolve(onAddEmployee(parsedEmp));
      if (isMounted.current) {
        setForm(INITIAL_FORM_STATE);
        onCancel();
      }
    } catch (err) {
      console.error('Validation failed:', err);
      alert('Invalid form data. Please check your inputs.');
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="modal-body flex-column gap-lg max-h-80vh overflow-y-auto" data-testid="add-employee-form">
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Associate Name:</label>
          <input 
            type="text" 
            className="form-control form-control-sm" 
            placeholder="e.g. Sarah Jennings"
            value={form.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, name: e.target.value })}
            disabled={isSubmitting}
            data-testid="input-name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Employee Number (Optional):</label>
          <input 
            type="text" 
            className="form-control form-control-sm" 
            placeholder="e.g. A1234567"
            value={form.employeeNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, employeeNumber: e.target.value })}
            disabled={isSubmitting}
            data-testid="input-employee-number"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Department:</label>
          <select 
            className="form-control form-control-sm cursor-pointer"
            value={form.dept}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, dept: e.target.value })}
            disabled={isSubmitting}
            data-testid="select-dept"
          >
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">Monthly Hours Worked:</label>
          <input 
            type="number" 
            step="0.1"
            className="form-control form-control-sm" 
            placeholder="e.g. 45.5"
            value={form.hours}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, hours: e.target.value })}
            disabled={isSubmitting}
            data-testid="input-hours"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Memberships Attach:</label>
          <input 
            type="number" 
            className="form-control form-control-sm" 
            placeholder="e.g. 6"
            value={form.memberships}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, memberships: e.target.value })}
            disabled={isSubmitting}
            data-testid="input-memberships"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Credit Card Apps:</label>
          <input 
            type="number" 
            className="form-control form-control-sm" 
            placeholder="e.g. 3"
            value={form.creditCards}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, creditCards: e.target.value })}
            disabled={isSubmitting}
            data-testid="input-credit-cards"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">GSP/Warranty Attach %:</label>
          <input 
            type="number" 
            step="0.1"
            className="form-control form-control-sm" 
            placeholder="e.g. 10.5"
            value={form.warranty}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, warranty: e.target.value })}
            disabled={isSubmitting}
            data-testid="input-warranty"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">5 Star Surveys:</label>
          <input 
            type="text" 
            className="form-control form-control-sm" 
            placeholder="e.g. 4 or Failing"
            value={form.surveys}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, surveys: e.target.value })}
            disabled={isSubmitting}
            data-testid="input-surveys"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">RPH ($ index):</label>
          <input 
            type="number" 
            className="form-control form-control-sm" 
            placeholder="e.g. 950"
            value={form.rph}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, rph: e.target.value })}
            disabled={isSubmitting}
            data-testid="input-rph"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Total Transactions:</label>
          <input 
            type="number" 
            className="form-control form-control-sm" 
            placeholder="e.g. 150"
            value={form.transactions}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, transactions: e.target.value })}
            disabled={isSubmitting}
            data-testid="input-transactions"
          />
        </div>

        {/* Conditional Department Metrics */}
        {(form.dept === 'Computing' || form.dept === 'Home Theatre') && (
          <div className="form-group">
            <label className="form-label">Basket Size ($):</label>
            <input 
              type="number" 
              step="0.01"
              className="form-control form-control-sm" 
              placeholder="e.g. 165.50"
              value={form.basket}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, basket: e.target.value })}
              disabled={isSubmitting}
              data-testid="input-basket"
            />
          </div>
        )}
        
        {form.dept === 'Computing' && (
          <div className="form-group">
            <label className="form-label">Microsoft 365 Attach %:</label>
            <input 
              type="number" 
              step="0.1"
              className="form-control form-control-sm" 
              placeholder="e.g. 62.5"
              value={form.m365}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, m365: e.target.value })}
              disabled={isSubmitting}
              data-testid="input-m365"
            />
          </div>
        )}

        {form.dept === 'Home Theatre' && (
          <div className="form-group">
            <label className="form-label">Audio Attach %:</label>
            <input 
              type="number" 
              step="0.1"
              className="form-control form-control-sm" 
              placeholder="e.g. 38.0"
              value={form.audio}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, audio: e.target.value })}
              disabled={isSubmitting}
              data-testid="input-audio"
            />
          </div>
        )}
      </div>
      
      <div className="form-group">
        <label className="form-label">Opportunity Gap Description (or None):</label>
        <input 
          type="text" 
          className="form-control form-control-sm" 
          placeholder="e.g. GSP Attach (4.0% vs 12.0%) or None"
          value={form.gap}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, gap: e.target.value })}
          disabled={isSubmitting}
          data-testid="input-gap"
        />
      </div>

      <div className="form-group flex-row align-center gap-sm mt-sm">
        <input 
          type="checkbox" 
          id="add-focus5"
          className="w-4 h-4 cursor-pointer"
          checked={form.focus5}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, focus5: e.target.checked })}
          disabled={isSubmitting}
          data-testid="input-focus5"
        />
        <label htmlFor="add-focus5" className="text-sm text-white cursor-pointer font-semibold">
          🔥 Add to Focus 5 List (Supervisor Observation Plan)
        </label>
      </div>

      <div className="flex-row gap-md justify-end mt-sm pt-md border-top">
        <button type="button" className="btn btn-secondary btn-sm cursor-pointer" onClick={onCancel} disabled={isSubmitting} data-testid="btn-cancel">
          Cancel
        </button>
        <button type="submit" className="btn btn-accent btn-sm cursor-pointer" disabled={isSubmitting} data-testid="btn-submit">
          {isSubmitting ? 'Adding...' : 'Add Associate'}
        </button>
      </div>
    </form>
  );
}
