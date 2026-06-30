import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  runOfflineEmployeeCoachingStep, 
  evaluateCoachingSession, 
  isGeminiAvailable,
  runGeminiEmployeeCoachingStep,
  evaluateCoachingSessionGemini
} from '../../services/ai';

export function useAiCoaching(apiKey, playbookSettings, coachingLogs, onLogCoachingSession) {
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

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
    if (!inputVal.trim() || isThinking || !selectedEmployee) return;
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
        
        nextState = await runGeminiEmployeeCoachingStep(
          apiKey, 
          currentMsg, 
          historyObj, 
          selectedEmployee, 
          playbookSettings, 
          pastLogs,
          (partialText) => {
            if (!isMounted.current) return;
            setMessages(prev => {
              const newMsgs = [...prev];
              // If the last message is from 'coach', it means the employee hasn't replied yet in the UI state
              if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].sender === 'coach') {
                newMsgs.push({ sender: 'employee', text: partialText });
              } else if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].sender === 'employee') {
                // We are progressively building the employee's response
                newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], text: partialText };
              }
              return newMsgs;
            });
          }
        );
      } else {
        await new Promise(resolve => setTimeout(resolve, 800));
        nextState = runOfflineEmployeeCoachingStep(currentMsg, historyObj, selectedEmployee);
      }
    } catch (err) {
      if (isMounted.current) {
        toast.error("Coaching generation error.");
      }
      console.error("Coaching step generation error:", err);
      const historyObj = {
        messages: [...messages, { sender: 'coach', text: currentMsg }],
        completedCoachSteps: completedCoachSteps,
        currentCoachStep: currentCoachStep
      };
      nextState = runOfflineEmployeeCoachingStep(currentMsg, historyObj, selectedEmployee);
    } finally {
      if (isMounted.current) {
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
    }
  };

  const finishCoaching = async () => {
    if (!selectedEmployee) return;
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
      
      if (isMounted.current) {
        setEvaluation(evalResult);
      }
      
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
      if (isMounted.current) {
        toast.error("Evaluation generation error.");
        console.error("Evaluation error:", err);
        const evalResult = evaluateCoachingSession(historyObj);
        setEvaluation(evalResult);
      }
    } finally {
      if (isMounted.current) {
        setIsEvaluating(false);
      }
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
