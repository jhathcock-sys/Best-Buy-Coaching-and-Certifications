import React, { useMemo } from 'react';
import { Trophy, Medal } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Employee } from '../../types';

const EMPTY_OBJ = {};

export default function AdvisorLeaderboard() {
  const activePeriod = useStore(state => state.activePeriod);
  const rosterHistory = useStore(state => state.rosterHistory);
  
  const _rawactiveRoster = activePeriod ? (rosterHistory?.[activePeriod] || EMPTY_OBJ) : EMPTY_OBJ;
  const activeRoster = useMemo(() => (Object.values(_rawactiveRoster) as Employee[]).sort((a, b) => a.name.localeCompare(b.name)), [_rawactiveRoster]);
  
  const top3Champions = useMemo(() => {
    return [...activeRoster]
      .filter(emp => emp.trophies && emp.trophies.length > 0)
      .sort((a, b) => (b.trophies?.length || 0) - (a.trophies?.length || 0))
      .slice(0, 3);
  }, [activeRoster]);

  return (
    <div className="bg-purple-alpha rounded-20 border-purple-alpha p-lg" data-testid="advisor-leaderboard">
      <h2 className="text-xl font-bold mb-lg flex-center gap-sm justify-start text-white">
        <Trophy size={20} color="var(--bby-yellow)" />
        Top 3 Store Champions
      </h2>
      {top3Champions.length === 0 ? (
        <div className="p-2xl text-center text-muted" data-testid="no-champions-message">
          No champions this period. Be the first!
        </div>
      ) : (
        <div className="flex-column gap-md">
          {top3Champions.map((champ, idx) => {
            let bgClass = "bg-white-alpha-02 border-white-alpha-05";
            let badgeClass = "bg-surface";
            if (idx === 0) {
              bgClass = "bg-yellow-alpha-10 border-yellow-alpha-30";
              badgeClass = "bg-bby-yellow text-black";
            } else if (idx === 1) {
              badgeClass = "bg-silver text-black";
            } else if (idx === 2) {
              badgeClass = "bg-bronze text-white";
            }

            return (
              <div key={champ.id} className={`flex-center gap-md p-md rounded-xl justify-start ${bgClass}`} data-testid="champion-card">
                <div className={`w-8 h-8 rounded-full flex-center font-bold ${badgeClass}`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white text-base">{champ.name}</div>
                  <div className="text-xs text-secondary">{champ.trophies?.length || 0} Trophies</div>
                </div>
                {idx === 0 && <Medal size={24} color="var(--bby-yellow)" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
