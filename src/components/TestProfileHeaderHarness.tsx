import React from 'react';
import AssociateProfileHeader from './AssociateProfile/AssociateProfileHeader';

export default function TestProfileHeaderHarness() {
  const nullEmployee = null;

  const focus5Employee = {
    id: 'emp1',
    name: 'John Doe',
    dept: 'Computing',
    focus5: true,
    employeeNumber: '123456'
  };

  const cvi100Employee = { id: 'emp2', name: 'Jane', dept: 'Mobile', employeeNumber: '222', memberships: 200 };
  const cviNeg50Employee = { id: 'emp3', name: 'Bob', dept: 'Home Theater', employeeNumber: '333', memberships: 50 };
  const cvi0Employee = { id: 'emp4', name: 'Alice', dept: 'Appliances', employeeNumber: '444', memberships: 100 };

  const activePeriod = 'Oct 2023';
  const prevPeriod = 'Sep 2023';
  
  const rosterHistory = {
    [activePeriod]: {
      'emp2': { id: 'emp2', memberships: 200 },
      'emp3': { id: 'emp3', memberships: 50 },
      'emp4': { id: 'emp4', memberships: 100 }
    },
    [prevPeriod]: {
      'emp2': { id: 'emp2', memberships: 100 }, // (200-100)/100 = 100% Accelerating
      'emp3': { id: 'emp3', memberships: 100 }, // (50-100)/100 = -50% Needs Review
      'emp4': { id: 'emp4', memberships: 100 }  // (100-100)/100 = 0% Neutral
    }
  } as any;

  return (
    <div className="p-xl bg-obsidian min-h-screen text-white">
      <h2>Test Harness</h2>
      <div className="mb-lg">
        <h3>Null Employee</h3>
        <AssociateProfileHeader employee={nullEmployee as any} rosterHistory={{}} activePeriod={activePeriod} onClose={() => {}} />
      </div>
      
      <div className="mb-lg">
        <h3>Focus 5</h3>
        <AssociateProfileHeader employee={focus5Employee as any} rosterHistory={{}} activePeriod={activePeriod} onClose={() => {}} />
      </div>

      <div className="mb-lg">
        <h3>Accelerating CVI</h3>
        <AssociateProfileHeader employee={cvi100Employee as any} rosterHistory={rosterHistory} activePeriod={activePeriod} onClose={() => {}} />
      </div>

      <div className="mb-lg">
        <h3>Needs Review CVI</h3>
        <AssociateProfileHeader employee={cviNeg50Employee as any} rosterHistory={rosterHistory} activePeriod={activePeriod} onClose={() => {}} />
      </div>

      <div className="mb-lg">
        <h3>Neutral CVI</h3>
        <AssociateProfileHeader employee={cvi0Employee as any} rosterHistory={rosterHistory} activePeriod={activePeriod} onClose={() => {}} />
      </div>
    </div>
  );
}
