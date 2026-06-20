import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  runOfflineEmployeeCoachingStep, 
  evaluateCoachingSession, 
  isGeminiAvailable,
  runGeminiEmployeeCoachingStep,
  evaluateCoachingSessionGemini
} from '../../services/ai';

export function useAiCoaching(apiKey, playbookSettings, coachingLogs, onLogCoachingSession) {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentCoachStep, setCurrentCoachStep] = useState('goal');
  const [completedCoachSteps, setCompletedCoachSteps] = useState({
    goal: false,
    reality: false,
    options: false,
    will: false
  });
  const [evaluation, setEvaluation] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const startCoaching = (employee, isVoiceMode, speakText) => {
    setSelectedEmployee(employee);
    setSessionActive(true);
    setMessages([
      { sender: 'employee', text: employee.initialGreeting }
    ]);
    setCompletedCoachSteps({
      goal: false,
      reality: false,
      options: false,
      will: false
    });
    setCurrentCoachStep('goal');
    setEvaluation(null);
    if (isVoiceMode) {
      speakText(employee.initialGreeting);
    }
  };

  const handleSend = async (inputVal, isVoiceMode, speakText) => {
    if (!inputVal.trim() || isThinking) return;
    const currentMsg = inputVal;
    
    setMessages(prev => [...prev, { sender: 'coach', text: currentMsg }]);
    setIsThinking(true);
    
    let nextState = null;
    try {
      const historyObj = {
        messages: [...messages, { sender: 'coach', text: currentMsg }],
        completedCoachSteps: completedCoachSteps,
        currentCoachStep: currentCoachStep
      };
      
      if (isGeminiAvailable(apiKey) && playbookSettings?.useGemini) {
        const cleanEmpName = selectedEmployee.name.split(' (')[0].trim();
        const pastLogs = (coachingLogs || [])
          .filter(log => log.employeeName && log.employeeName.split(' (')[0].trim() === cleanEmpName)
          .slice(0, 3)
          .map(log => `- Date: ${log.date}, Score: ${log.score}%, Notes: ${log.notes}`)
          .join('\n');
        
        nextState = await runGeminiEmployeeCoachingStep(apiKey, currentMsg, historyObj, selectedEmployee, playbookSettings, pastLogs);
      } else {
        await new Promise(resolve => setTimeout(resolve, 800));
        nextState = runOfflineEmployeeCoachingStep(currentMsg, historyObj, selectedEmployee);
      }
    } catch (err) {
      toast.error("Coaching generation error.");
      console.error("Coaching step generation error:", err);
      const historyObj = {
        messages: [...messages, { sender: 'coach', text: currentMsg }],
        completedCoachSteps: completedCoachSteps,
        currentCoachStep: currentCoachStep
      };
      nextState = runOfflineEmployeeCoachingStep(currentMsg, historyObj, selectedEmployee);
    } finally {
      setIsThinking(false);
      if (nextState) {
        setMessages(nextState.messages);
        setCompletedCoachSteps(nextState.completedCoachSteps);
        setCurrentCoachStep(nextState.currentCoachStep);
        
        if (isVoiceMode) {
          const lastMsg = nextState.messages[nextState.messages.length - 1];
          if (lastMsg && lastMsg.sender !== 'coach') {
            speakText(lastMsg.text);
          }
        }
      }
    }
  };

  const finishCoaching = async () => {
    setIsEvaluating(true);
    const historyObj = {
      messages: messages,
      completedCoachSteps: completedCoachSteps,
      currentCoachStep: currentCoachStep
    };
    
    try {
      let evalResult;
      if (isGeminiAvailable(apiKey) && playbookSettings?.useGemini) {
        evalResult = await evaluateCoachingSessionGemini(apiKey, historyObj, selectedEmployee, playbookSettings);
      } else {
        evalResult = evaluateCoachingSession(historyObj);
      }
      
      setEvaluation(evalResult);
      
      if (onLogCoachingSession) {
        const isRoster = selectedEmployee.id && String(selectedEmployee.id).startsWith('roster-');
        const rosterEmpId = isRoster ? String(selectedEmployee.id).substring(7) : null;
        const cleanName = isRoster ? selectedEmployee.name.split(' (')[0] : selectedEmployee.name;
        onLogCoachingSession({
          employeeId: rosterEmpId,
          customerName: cleanName || 'Advisor',
          category: 'Coaching Practice',
          avatar: selectedEmployee.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          score: evalResult.score,
          notes: evalResult.feedback || 'Completed GROW Coaching practice session.'
        });
      }
    } catch (err) {
      toast.error("Evaluation generation error.");
      console.error("Evaluation error:", err);
      const evalResult = evaluateCoachingSession(historyObj);
      setEvaluation(evalResult);
    } finally {
      setIsEvaluating(false);
    }
  };

  return {
    selectedEmployee,
    setSelectedEmployee,
    sessionActive,
    setSessionActive,
    messages,
    currentCoachStep,
    completedCoachSteps,
    evaluation,
    setEvaluation,
    isThinking,
    isEvaluating,
    startCoaching,
    handleSend,
    finishCoaching
  };
}
