import React, { useMemo } from 'react';
import { Zap, CheckCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Employee, CoachingLog } from '../../types';

interface DailyQuestsProps {
  employee: Employee;
}

const EMPTY_ARR: any[] = [];

export default function DailyQuests({ employee }: DailyQuestsProps) {
  const coachingLogs = useStore(state => state.coachingLogs) || EMPTY_ARR;
  
  const myLogs = useMemo(() => {
    if (!employee) return [];
    return coachingLogs.filter((log: CoachingLog) => 
      log.employeeId === employee.id || log.employeeName === employee.name
    );
  }, [coachingLogs, employee]);

  const dailyQuests = [
    { 
      title: "Complete an AI Roleplay", 
      xp: 50, 
      completed: myLogs.length > 0 
    },
    { 
      title: "Secure 2 Memberships", 
      xp: 100, 
      completed: (employee.memberships || 0) >= 2 
    },
    { 
      title: "Review your Performance Metrics", 
      xp: 25, 
      completed: true 
    }
  ];

  return (
    <div className="bg-cyan-alpha rounded-20 border-cyan-alpha p-lg" data-testid="daily-quests-widget">
      <h2 className="text-xl font-bold mb-lg flex-center gap-sm justify-start text-white">
        <Zap size={20} color="var(--info)" />
        Daily Quests
      </h2>
      <div className="flex-column gap-md">
        {dailyQuests.map((quest, idx) => (
          <div key={idx} className={`flex-between align-center bg-white-alpha-02 p-md rounded-xl ${quest.completed ? 'border-success opacity-70' : 'border-glass'}`} data-testid="quest-item">
            <div className="flex-center gap-md">
              <div className={`w-6 h-6 rounded-full flex-center ${quest.completed ? 'bg-success' : 'border-2 border-muted'}`} data-testid={quest.completed ? 'quest-status-completed' : 'quest-status-incomplete'}>
                {quest.completed && <CheckCircle size={16} color="#fff" />}
              </div>
              <div className={`font-medium ${quest.completed ? 'text-secondary line-through' : 'text-white'}`}>
                {quest.title}
              </div>
            </div>
            <div className="text-sm font-extrabold text-bby-blue">
              +{quest.xp} XP
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
