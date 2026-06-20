import React from 'react';
import { Target, TrendingUp, Users, Clock, Award, Shield, DollarSign, Calendar, MessageSquare, PlayCircle, Star, Briefcase, FileText, CheckCircle2 } from 'lucide-react';

export default function CommitmentsTab({ 
  employee, 
  rosterHistory, 
  activePeriod, 
  activeHistoryPoints, 
  associateLogs, 
  associateTasks, 
  associateShifts, 
  associateSimulations,
  getRankAndPercentile, 
  calculateCVI, 
  renderMarkdown,
  isGeneratingReview,
  setIsGeneratingReview,
  generateAiReview,
  aiReviewCache
}) {
  return (
    <>
            <CommitmentsTab 
              employee={employee}
              rosterHistory={rosterHistory}
              activePeriod={activePeriod}
              activeHistoryPoints={activeHistoryPoints}
              associateLogs={associateLogs}
              associateTasks={associateTasks}
              associateShifts={associateShifts}
              associateSimulations={associateSimulations}
              getRankAndPercentile={getRankAndPercentile}
              calculateCVI={calculateCVI}
              renderMarkdown={renderMarkdown}
              isGeneratingReview={isGeneratingReview}
              setIsGeneratingReview={setIsGeneratingReview}
              generateAiReview={generateAiReview}
              aiReviewCache={aiReviewCache}
 />
          )}
    </>
  );
}
