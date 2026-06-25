import React from 'react';
import { Trash2, Compass } from 'lucide-react';
import CustomScenarioForm from './CustomScenarioForm';
import { useStore } from '../../store/useStore';
import { StoreState } from '../../types/store';
import { useShallow } from 'zustand/react/shallow';
import { CustomScenario } from './CustomScenarioForm';

export default function CustomScenariosTab() {
  const { customScenarios, deleteCustomScenario } = useStore(useShallow((state: StoreState) => ({
    customScenarios: state.customScenarios || [],
    deleteCustomScenario: state.deleteCustomScenario
  })));

  return (
    <div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-xl">
          
          {/* Extracted Form Component */}
          <CustomScenarioForm />

          <div className="glass-card flex-column gap-xl p-xl">
            <div>
              <h3 className="text-xl flex-center justify-start gap-sm m-0 text-white">
                <Compass size={20} color="var(--bby-blue)" /> Custom Scenarios Library
              </h3>
              <p className="text-xs text-secondary mt-1">Active custom customer personas loaded into your local store consult database.</p>
            </div>

            <div className="flex-column gap-md">
              {customScenarios.length === 0 ? (
                <div className="text-center p-3xl border-2 border-dashed border-[var(--border-glass)] rounded-2xl text-muted text-sm">
                  No custom roleplay scenarios added yet. Use the form on the left to configure your first one!
                </div>
              ) : (
                customScenarios.map((scen: CustomScenario) => (
                  <div 
                    key={scen.id}
                    className="flex-between items-center p-md bg-white/5 border border-[var(--border-glass)] rounded-xl"
                    data-testid={`custom-scenario-item-${scen.id}`}
                  >
                    <div className="flex-center justify-start gap-md">
                      <img src={scen.avatar} alt="" className="w-9 h-9 rounded-full border border-[var(--border-glass)]" />
                      <div>
                        <h4 className="text-md m-0 text-white font-semibold">{scen.title}</h4>
                        <span className="text-xs text-secondary">Customer: {scen.name} | {scen.difficulty}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-trash bg-transparent border-none text-error cursor-pointer p-0"
                      onClick={() => deleteCustomScenario && deleteCustomScenario(scen.id)}
                      title="Remove Custom Scenario"
                      data-testid={`delete-scenario-${scen.id}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
    </div>
  );
}
