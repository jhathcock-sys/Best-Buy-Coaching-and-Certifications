import { useState, useEffect, useRef, useMemo } from 'react';
import { STANDARD_SCENARIOS, runOfflineSimulationStep, runGeminiSimulationStep, evaluateSessionOffline, evaluateSessionGemini } from '../services/ai';
import { ShieldAlert, Sparkles, Key, Check, Plus, Trash2, BookOpen, Compass, Users, UserPlus, Edit2, Eye, EyeOff, Cpu, RefreshCw, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import RoleplayConfiguration from '../components/RoleplayCenter/RoleplayConfiguration';
import RoleplayActiveSession from '../components/RoleplayCenter/RoleplayActiveSession';
import RoleplayResults from '../components/RoleplayCenter/RoleplayResults';

const EMPTY_ARR: any[] = [];

export default function RoleplayCenter() {
  const navigate = useNavigate();
  const setActiveView = (view: string) => navigate(view === 'dashboard' ? '/' : `/${view}`);
const apiKey = useStore((state) => state.apiKey);
  const customScenarios = useStore((state) => state.customScenarios) || EMPTY_ARR;
  const playbookSettings = useStore((state) => state.playbookSettings);
  const completeRoleplay = useStore((state) => state.completeRoleplay);
  const onCompleteRoleplay = completeRoleplay; // Alias to match existing calls
  
  const [selectedScenario, setSelectedScenario] = useState<any>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [complexity, setComplexity] = useState('Standard');
  const [customerTone, setCustomerTone] = useState('Neutral');
  const [evaluation, setEvaluation] = useState<any>(null);
  
  const allScenarios = useMemo(() => [...STANDARD_SCENARIOS, ...customScenarios], [customScenarios]);

  const startRoleplay = (scenario: any) => {
    setSelectedScenario(scenario);
    setSessionActive(true);
    setEvaluation(null);
  };

  return (
    <div>
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
              onEvaluationComplete={(result) => {
                setEvaluation(result);
                if (result) {
                  onCompleteRoleplay({
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
                    } : null
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
