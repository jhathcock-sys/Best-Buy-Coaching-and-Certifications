import React from 'react';
import { ShieldCheck, ChevronLeft, ChevronRight, Check, Clipboard, Calendar, Users, AlertCircle } from 'lucide-react';

export default function ShadowStep1Employee({ 
  roster,
  selectedEmpId,
  setSelectedEmpId,
  department,
  setDepartment,
  setCurrentStep,
  checklist,
  setChecklist,
  customerPersona,
  setCustomerPersona,
  customPersona,
  setCustomPersona,
  notes,
  setNotes,
  isGenerating,
  setIsGenerating,
  handleGenerateCoaching,
  handleSelectEmployee,
  activeEmployee
 }) {
  return (
    <>
      <div className="flex-column gap-lg animate-fade-in">
        <h3 className="text-xl mb-sm flex-center gap-sm justify-start">
          <Users size={20} color="var(--bby-blue)" /> Select Advisor for Observation
        </h3>
                
        <div className="grid-cols-2 gap-lg">
          <div className="form-group">
            <label className="block text-sm text-secondary mb-sm">
              Associate Name
            </label>
            <select 
              value={selectedEmpId} 
              onChange={(e) => handleSelectEmployee(e.target.value)}
              className="form-control bg-obsidian-alpha border-glass text-white w-full h-44px py-sm px-md-lg"
            >
              <option value="">-- Choose Associate --</option>
                      {roster.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.dept})
                        </option>
                      ))}
                    </select>
                  </div>

          <div className="form-group">
            <label className="block text-sm text-secondary mb-sm">
              Department Focus
            </label>
            <select 
              value={department} 
              onChange={(e) => setDepartment(e.target.value)}
              className="form-control bg-obsidian-alpha border-glass text-white w-full h-44px py-sm px-md-lg"
            >
              <option value="Front End">Front End</option>
                      <option value="General Sales">General Sales</option>
                      <option value="Appliances">Appliances</option>
                      <option value="Computing">Computing</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Home Theatre">Home Theatre</option>
                      <option value="Geek Squad">Geek Squad</option>
                    </select>
                  </div>
                </div>

        {activeEmployee && (
          <div className="mt-lg p-1-25rem rounded-xl bg-bby-blue-alpha-06 border-bby-blue-alpha-15 flex-column gap-sm">
            <div className="flex-between">
              <span className="font-bold text-base text-white">{activeEmployee.name}</span>
              <span className="tag-pill tag-pill-active">{activeEmployee.dept}</span>
            </div>
            <div className="grid-cols-4 gap-md mt-sm text-xs text-secondary">
              <div>Hours: <strong className="text-white">{activeEmployee.hours}</strong></div>
              <div>Memberships: <strong className="text-white">{activeEmployee.memberships}</strong></div>
              <div>BBY Cards: <strong className="text-white">{activeEmployee.creditCards}</strong></div>
              <div>GSP Attach: <strong className="text-white">{activeEmployee.warranty}%</strong></div>
            </div>
            {activeEmployee.gap && activeEmployee.gap !== 'None' && (
              <div className="mt-sm flex-center gap-sm text-xs text-bby-yellow justify-start">
                <AlertCircle size={14} /> Gap focus: {activeEmployee.gap}
              </div>
            )}
          </div>
        )}
              </div>
    </>
  );
}
