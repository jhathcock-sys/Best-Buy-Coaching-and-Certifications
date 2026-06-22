import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { generateMonthlyOneOnOne, generateActionPlan } from '../services/ai/geminiCoaching';

export function useAssociateProfile(isOpen, employee, rosterHistory, coachingLogs, followUpTasks, deptGoals) {
  const [activeTab, setActiveTab] = useState('trends');
  const [playingLogId, setPlayingLogId] = useState<any>(null);
  const [expandedLogId, setExpandedLogId] = useState<any>(null);
  const [isGeneratingReview, setIsGeneratingReview] = useState(false);
  const [generatedReview, setGeneratedReview] = useState<any>(null);
  const [isGeneratingActionPlan, setIsGeneratingActionPlan] = useState(false);
  const [generatedActionPlan, setGeneratedActionPlan] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab('trends');
      setPlayingLogId(null);
      setExpandedLogId(null);
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [isOpen]);

  // Handle TTS
  const handlePlayTTS = (logId: any, text: any) => {
    if (playingLogId === logId) {
      window.speechSynthesis.cancel();
      setPlayingLogId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/[#*`_-]/g, ' ') // Strip markdown chars
      .replace(/DISC Focus:/gi, ' DISC Focus step is ')
      .replace(/WHAT:/gi, ' What needs to be done: ')
      .replace(/HOW:/gi, ' How they should sell: ')
      .replace(/WHY:/gi, ' Why it matters: ');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setPlayingLogId(null);
    utterance.onerror = () => setPlayingLogId(null);
    setPlayingLogId(logId);
    window.speechSynthesis.speak(utterance);
  };

  const handleGenerateReview = async () => {
    setIsGeneratingReview(true);
    setGeneratedReview(null);
    try {
      const apiKey = (useStore.getState().apiKey as any)?.gemini;
      const reviewText = await generateMonthlyOneOnOne(employee, associateLogs, apiKey);
      setGeneratedReview(reviewText);
    } catch (err) {
      console.error(err);
      setGeneratedReview("Error generating review. Please check your API key.");
    } finally {
      setIsGeneratingReview(false);
    }
  };

  const handleGenerateActionPlan = async () => {
    setIsGeneratingActionPlan(true);
    try {
      const apiKey = (useStore.getState().apiKey as any)?.gemini;
      const plan = await generateActionPlan(employee, associateLogs, apiKey);
      if (plan) {
        setGeneratedActionPlan(plan);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingActionPlan(false);
    }
  };

  

  if (!isOpen || !employee) return {
    activeTab, setActiveTab,
    playingLogId, setPlayingLogId,
    expandedLogId, setExpandedLogId,
    isGeneratingReview, setIsGeneratingReview,
    generatedReview, setGeneratedReview,
    isGeneratingActionPlan, setIsGeneratingActionPlan,
    generatedActionPlan, setGeneratedActionPlan,
    handlePlayTTS,
    handleGenerateReview,
    handleGenerateActionPlan,
    sortedPeriods: [],
    historyPoints: [],
    activeHistoryPoints: [],
    associateLogs: [],
    associateTasks: [],
    activeGoals: {}
  };

  // 1. Gather historical data for this associate
  const sortedPeriods = Object.keys(rosterHistory).sort((a, b) => {
    const parsePeriod = (p: any) => {
      const [month, year] = p.split(' ');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIdx = months.findIndex(m => month.startsWith(m)) || 0;
      return new Date(parseInt(year), monthIdx);
    };
    return (parsePeriod(a) as any) - (parsePeriod(b) as any);
  });

  const historyPoints = sortedPeriods.map((period: any) => {
    const emp = rosterHistory[period]?.find((e: any) => e.id === employee.id || e.name === employee.name);
    return {
      period,
      found: !!emp,
      hours: emp?.hours || 0,
      memberships: emp?.memberships || 0,
      creditCards: emp?.creditCards || 0,
      warranty: emp?.warranty || 0,
      surveys: emp?.surveys === 0.2 ? 2.0 : (emp?.surveys || 5.0), // normalize failing
      rph: emp?.rph || 0,
      basket: emp?.basket || 0,
      m365: emp?.m365 || 0,
      audio: emp?.audio || 0
    };
  });

  // Filter out periods where employee was not on roster
  const activeHistoryPoints = historyPoints.filter(h => h.found);

  // 2. Filter coaching logs & commitments for this employee
  const associateLogs = coachingLogs.filter(log => 
    log.employeeId === employee.id || 
    log.employeeName === employee.name ||
    (log.employeeName && log.employeeName.startsWith(employee.name))
  );

  const associateTasks = followUpTasks.filter(task => 
    task.employeeId === employee.id || 
    task.employeeName === employee.name
  );

  // Active department goals
  const activeGoals = deptGoals[employee.dept] || { memberships: 8, creditCards: 12.5, warranty: 11, surveys: 1, rph: 640 };



  // Helper to parse markdown-like bold items in log notes

  return {
    activeTab, setActiveTab,
    playingLogId, setPlayingLogId,
    expandedLogId, setExpandedLogId,
    isGeneratingReview, setIsGeneratingReview,
    generatedReview, setGeneratedReview,
    isGeneratingActionPlan, setIsGeneratingActionPlan,
    generatedActionPlan, setGeneratedActionPlan,
    handlePlayTTS,
    handleGenerateReview,
    handleGenerateActionPlan,
    sortedPeriods,
    historyPoints,
    activeHistoryPoints,
    associateLogs,
    associateTasks,
    activeGoals
  };
}
