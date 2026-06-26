import React from 'react';

export interface Scenario {
  id: string;
  title: string;
  name: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  avatar: string;
  initialGreeting: string;
  needs: string;
}

export interface RoleplayConfigurationProps {
  allScenarios?: Scenario[];
  startRoleplay: (scenario: Scenario) => void;
}

export default function RoleplayConfiguration({ 
  allScenarios = [],
  startRoleplay
}: RoleplayConfigurationProps) {
  const [startingScenarioId, setStartingScenarioId] = React.useState<string | null>(null);

  const handleStart = (scenario: Scenario) => {
    if (startingScenarioId) return; // Prevent double clicks
    setStartingScenarioId(scenario.id);
    startRoleplay(scenario);
  };

  return (
    <>
        <div className="flex-column gap-xl">
          <div>
            <h1 className="text-3xl mb-xs">Consultative Practice Arena</h1>
            <p className="text-secondary">Select a customer profile to practice the Best Buy sales process and test your consultative skills.</p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-xl">
            {allScenarios?.map(scenario => (
              <div key={scenario.id} className="glass-card flex-column justify-between gap-xl" data-testid={`scenario-card-${scenario.id}`}>
                <div className="flex-column gap-md">
                  <div className="flex justify-between items-center">
                    <span className="tag-pill tag-pill-active">{scenario.category}</span>
                    <span className={`text-xs font-bold ${
                      scenario.difficulty === 'Hard' ? 'text-error' : 
                      scenario.difficulty === 'Medium' ? 'text-warning' : 'text-success'
                    }`}>
                      {scenario.difficulty?.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-md">
                    <img 
                      src={scenario.avatar} 
                      alt="" 
                      className="w-[50px] h-[50px] rounded-full border-2 border-bby-blue object-cover" 
                    />
                    <div>
                      <h3 className="text-lg m-0">{scenario.title}</h3>
                      <p className="text-xs text-secondary m-0">Customer: {scenario.name}</p>
                    </div>
                  </div>

                  <p className="text-sm text-secondary leading-relaxed">
                    {scenario.description}
                  </p>
                </div>

                <button 
                  className="btn btn-primary w-full cursor-pointer" 
                  onClick={() => handleStart(scenario)}
                  disabled={startingScenarioId === scenario.id}
                  data-testid={`launch-roleplay-btn-${scenario.id}`}
                >
                  {startingScenarioId === scenario.id ? 'Launching...' : 'Launch Roleplay'}
                </button>
              </div>
            ))}
            
            {(!allScenarios || allScenarios.length === 0) && (
              <div className="col-span-full p-xl text-center text-secondary border border-dashed border-white-alpha-10 rounded-xl">
                No scenarios available. Add some in Playbook Studio.
              </div>
            )}
          </div>
        </div>
    </>
  );
}
