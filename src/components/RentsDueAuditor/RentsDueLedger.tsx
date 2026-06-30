import React, { useState } from 'react';
import { CheckCircle2, Wand2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { generateRentRecoveryPlans } from '../../services/ai/geminiRentRecovery';
export interface ParsedEmployee {
  name: string;
  rph: number;
  rphOwed: number;
  rphStatus: 'on-track' | 'off-track';
  revenue: number;
  revenueOwed: number;
  revenueStatus: 'on-track' | 'off-track';
  apps: number;
  appsOwed: number;
  appsStatus: 'on-track' | 'off-track';
  memberships: number;
  membershipsOwed: number;
  membershipsStatus: 'on-track' | 'off-track';
  warranty: number;
  warrantyGoal: number;
  warrantyStatus: 'on-track' | 'off-track';
}

export interface RentsDueLedgerProps {
  gaps?: {
    rev: number;
    apps: number;
    pms: number;
  };
  parsedEmployees: ParsedEmployee[] | null;
  setParsedEmployees: (employees: ParsedEmployee[] | null) => void;
  syncSuccess: boolean;
  handleSyncToRoster: () => void | Promise<void>;
}

export default function RentsDueLedger({ 
  gaps,
  parsedEmployees,
  setParsedEmployees,
  syncSuccess,
  handleSyncToRoster
}: RentsDueLedgerProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const isMounted = React.useRef(true);

  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  const addFollowUpTask = useStore(state => state.addFollowUpTask);
  const playbookSettings = useStore(state => state.playbookSettings);
  const employees = parsedEmployees || [];
  
  const handleSyncClick = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await handleSyncToRoster();
    } finally {
      if (isMounted.current) {
        setIsSyncing(false);
      }
    }
  };

  const handleGenerateRecoveryPlans = async () => {
    if (isGenerating) return;
    const offTrackEmployees = employees.filter(emp => 
      emp.rphStatus === 'off-track' || 
      emp.revenueStatus === 'off-track' || 
      emp.appsStatus === 'off-track' || 
      emp.membershipsStatus === 'off-track'
    );
    if (offTrackEmployees.length === 0) return;

    setIsGenerating(true);
    try {
      const tasks = await generateRentRecoveryPlans(offTrackEmployees, playbookSettings || {}, undefined);
      tasks.forEach(task => addFollowUpTask(task));
      if (isMounted.current) {
        setSuccessToast(`Generated recovery plans for ${tasks.length} off-track employees.`);
        setTimeout(() => isMounted.current && setSuccessToast(null), 3000);
      }
    } catch (err) {
      console.error(err);
      if (isMounted.current) {
        setSuccessToast('Failed to generate recovery plans.');
        setTimeout(() => isMounted.current && setSuccessToast(null), 3000);
      }
    } finally {
      if (isMounted.current) {
        setIsGenerating(false);
      }
    }
  };

  const safeDiv = employees.length > 0 ? employees.length : 1;
  const onTrackCount = employees.filter(e => e.rphStatus === 'on-track' && e.revenueStatus === 'on-track').length;
  const rentPayerRate = employees.length > 0 ? Math.round((onTrackCount / safeDiv) * 100) : 0;

  return (
    <>
        {/* AUDIT RESULTS VIEW */}
        <div className="flex-column gap-xl" data-testid="rents-due-ledger">
          
          {/* Top KPI Cards */}
          <div className="metrics-grid">
            <div className="glass-card p-xl">
              <span className="text-xs text-muted uppercase font-bold tracking-wider block mb-xs">Revenue Rent Owed</span>
              <div className={`text-3xl font-black mt-xs font-heading ${(gaps?.rev || 0) > 0 ? 'text-error' : 'text-success'}`}>
                ${(gaps?.rev || 0).toLocaleString()}
              </div>
              <span className="text-xs text-secondary mt-xs block">Outstanding salesperson gap</span>
            </div>

            <div className="glass-card p-xl">
              <span className="text-xs text-muted uppercase font-bold tracking-wider block mb-xs">Apps Owed</span>
              <div className={`text-3xl font-black mt-xs font-heading ${(gaps?.apps || 0) > 0 ? 'text-bby-yellow' : 'text-success'}`}>
                {gaps?.apps || 0} Apps
              </div>
              <span className="text-xs text-secondary mt-xs block">Credit Card apps to reach standard</span>
            </div>

            <div className="glass-card p-xl">
              <span className="text-xs text-muted uppercase font-bold tracking-wider block mb-xs">Memberships Owed</span>
              <div className={`text-3xl font-black mt-xs font-heading ${(gaps?.pms || 0) > 0 ? 'text-info' : 'text-success'}`}>
                {gaps?.pms || 0} Plus/Total
              </div>
              <span className="text-xs text-secondary mt-xs block">Memberships to reach standard</span>
            </div>

            <div className="glass-card p-xl flex-column justify-center">
              <span className="text-xs text-muted uppercase font-bold tracking-wider block mb-xs">Rent Payer Rate</span>
              <div className="text-3xl font-black mt-xs font-heading text-success">
                {rentPayerRate}%
              </div>
              <span className="text-xs text-secondary mt-xs block">Associates meeting all baseline Rents</span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex-center justify-between flex-wrap gap-md">
            <div className="flex-center gap-sm">
              <button 
                className="btn btn-secondary px-md py-sm text-sm cursor-pointer" 
                onClick={() => setParsedEmployees(null)}
                data-testid="reset-upload-btn"
              >
                ← Reset & Upload New File
              </button>
            </div>
            
            <div className="flex gap-sm">
              <button 
                className={`btn btn-secondary px-md py-sm text-sm cursor-pointer flex-center-y gap-xs transition-normal ${isGenerating ? 'opacity-90 border-bby-yellow shadow-[0_0_15px_var(--bby-yellow)]' : ''}`}
                onClick={handleGenerateRecoveryPlans}
                disabled={isGenerating || employees.length === 0}
                data-testid="generate-recovery-plans-btn"
              >
                <Wand2 size={16} className={isGenerating ? 'animate-pulse text-bby-yellow' : ''} />
                {isGenerating ? 'Generating...' : 'Generate AI Recovery Plans'}
              </button>
              <button 
                className={`btn btn-accent px-md py-sm text-sm cursor-pointer ${isSyncing ? 'opacity-50' : ''}`}
                onClick={handleSyncClick}
                disabled={isSyncing}
                data-testid="sync-metrics-btn"
              >
                {isSyncing ? 'Syncing...' : 'Sync Metrics to Active Roster'}
              </button>
            </div>
          </div>

          {syncSuccess && (
            <div className="p-md bg-[var(--success-glow)] border border-[rgba(16,185,129,0.3)] rounded-xl text-sm text-[#a7f3d0] flex-center-y gap-xs" data-testid="sync-success-message">
              <CheckCircle2 size={16} /> Roster ledger values updated. All performance evaluations and sparklines will reflect these parsed values immediately.
            </div>
          )}

          {successToast && (
            <div className="p-md rounded-xl text-sm text-white flex-center-y gap-xs animate-fade-in bg-bby-blue border border-[rgba(0,70,190,0.3)]" data-testid="ai-success-message">
              <CheckCircle2 size={16} /> {successToast}
            </div>
          )}

          {/* Ledger Table */}
          <div className="glass-card overflow-x-auto p-0">
            <table className="w-full border-collapse text-sm text-left">
              <thead>
                <tr className="border-b border-[var(--border-glass)] bg-white-alpha-01">
                  <th className="p-md">SALESPERSON</th>
                  <th className="p-md text-center">RPH ($/hr)</th>
                  <th className="p-md text-center">REVENUE ($)</th>
                  <th className="p-md text-center">CREDIT CARDS</th>
                  <th className="p-md text-center">MEMBERSHIPS</th>
                  <th className="p-md text-center">WARRANTY GSP</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, idx) => {
                  const isPaidAll = emp.rphStatus === 'on-track' && emp.revenueStatus === 'on-track' && emp.appsStatus === 'on-track' && emp.membershipsStatus === 'on-track';
                  return (
                    <tr key={idx} className={`border-b border-[var(--border-glass)] ${isPaidAll ? 'bg-[rgba(16,185,129,0.02)]' : 'bg-transparent'}`}>
                      <td className="p-md font-bold">
                        <div className="flex-column">
                          <span>{emp.name}</span>
                          <span className={`text-xs ${isPaidAll ? 'text-success' : 'text-muted'}`}>
                            {isPaidAll ? 'Paid Full Rent' : 'Owes Rent'}
                          </span>
                        </div>
                      </td>
                      
                      {/* RPH */}
                      <td className="p-md text-center">
                        <div className="flex-column items-center">
                          <span className="font-bold">${emp.rph}</span>
                          <span className={`text-xs ${emp.rphStatus === 'on-track' ? 'text-success' : 'text-error'}`}>
                            {emp.rphStatus === 'on-track' ? 'Paid' : `Owed: $${emp.rphOwed}`}
                          </span>
                        </div>
                      </td>

                      {/* REVENUE */}
                      <td className="p-md text-center">
                        <div className="flex-column items-center">
                          <span className="font-bold">${emp.revenue.toLocaleString()}</span>
                          <span className={`text-xs ${emp.revenueStatus === 'on-track' ? 'text-success' : 'text-error'}`}>
                            {emp.revenueStatus === 'on-track' ? 'Paid' : `Owed: $${emp.revenueOwed.toLocaleString()}`}
                          </span>
                        </div>
                      </td>

                      {/* APPS */}
                      <td className="p-md text-center">
                        <div className="flex-column items-center">
                          <span className="font-bold">{emp.apps} Apps</span>
                          <span className={`text-xs ${emp.appsStatus === 'on-track' ? 'text-success' : 'text-error'}`}>
                            {emp.appsStatus === 'on-track' ? 'Paid' : `Owed: ${emp.appsOwed}`}
                          </span>
                        </div>
                      </td>

                      {/* MEMBERSHIPS */}
                      <td className="p-md text-center">
                        <div className="flex-column items-center">
                          <span className="font-bold">{emp.memberships} PMs</span>
                          <span className={`text-xs ${emp.membershipsStatus === 'on-track' ? 'text-success' : 'text-error'}`}>
                            {emp.membershipsStatus === 'on-track' ? 'Paid' : `Owed: ${emp.membershipsOwed}`}
                          </span>
                        </div>
                      </td>

                      {/* WARRANTY */}
                      <td className="p-md text-center">
                        <div className="flex-column items-center">
                          <span className="font-bold">{emp.warranty}%</span>
                          <span className={`text-xs ${emp.warrantyStatus === 'on-track' ? 'text-success' : 'text-error'}`}>
                            Goal: {emp.warrantyGoal}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
    </>
  );
}
