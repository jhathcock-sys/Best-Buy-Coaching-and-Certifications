import { useState, useMemo } from 'react';
import { STANDARD_SCENARIOS } from '../services/ai';
import { useStore } from '../store/useStore';
import RoleplayConfiguration, { Scenario } from '../components/RoleplayCenter/RoleplayConfiguration';
import RoleplayActiveSession from '../components/RoleplayCenter/RoleplayActiveSession';
import RoleplayResults, { RoleplayEvaluation } from '../components/RoleplayCenter/RoleplayResults';

const EMPTY_ARR: Scenario[] = [];

export default function RoleplayCenter() {
  const customScenarios = useStore((state) => state.customScenarios) || EMPTY_ARR;
  const completeRoleplay = useStore((state) => state.completeRoleplay);
  
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [complexity, setComplexity] = useState('Standard');
  const [customerTone, setCustomerTone] = useState('Neutral');
  const [evaluation, setEvaluation] = useState<RoleplayEvaluation | null>(null);
  
  const allScenarios = useMemo(() => [...STANDARD_SCENARIOS, ...customScenarios] as Scenario[], [customScenarios]);

  const startRoleplay = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setSessionActive(true);
    setEvaluation(null);
  };

  return (
    <div data-testid="roleplay-center-page" className="flex-column gap-xl h-full w-full">
      {/* 1. SCENARIOS SELECTOR VIEW */}
          {!sessionActive && (
            <RoleplayConfiguration 
              allScenarios={allScenarios}
              startRoleplay={startRoleplay}
            />
          )}

          {sessionActive && !evaluation && (
            <RoleplayActiveSession 
              selectedScenario={selectedScenario}
              complexity={complexity}
              customerTone={customerTone}
              onExit={() => setSessionActive(false)}
              onEvaluationComplete={(result: any) => {
                setEvaluation(result as RoleplayEvaluation);
                if (result && selectedScenario) {
                  completeRoleplay({
                    scenarioId: selectedScenario.id,
                    category: selectedScenario.category,
                    customerName: selectedScenario.name,
                    avatar: selectedScenario.avatar,
                    score: result.overallScore,
                    passed: result.passed,
                    growReport: result.growReport,
                    metrics: result.overallScore >= 80 ? {
                      memberships: result.overallScore >= 90 ? 100 : 0,
                      creditCards: result.overallScore >= 85 ? 1 : 0,
                      warranty: result.overallScore >= 80 ? 100 : 0,
                      surveys: 5.0,
                      rph: 1380
                    } : undefined
                  });
                }
              }}
            />
          )}

          {evaluation && (
            <RoleplayResults 
              selectedScenario={selectedScenario}
              evaluation={evaluation}
              onRestart={startRoleplay}
              onExit={() => {
                setEvaluation(null);
                setSessionActive(false);
                setSelectedScenario(null);
              }}
            />
          )}
    </div>
  );
}
