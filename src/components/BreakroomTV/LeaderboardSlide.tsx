import React from 'react';
import { Trophy } from 'lucide-react';
import { Employee } from '../../types';

interface LeaderboardSlideProps {
  topAdvisors: Employee[];
}

export default function LeaderboardSlide({ topAdvisors }: LeaderboardSlideProps) {
  if (!topAdvisors || topAdvisors.length === 0) return null;

  return (
    <div className="slide-fade-in flex-column flex-center h-full w-full" data-testid="leaderboard-slide">
      <h2 className="text-4xl text-white mb-xl flex align-center justify-center gap-md font-heading m-0 text-center">
        <Trophy size={48} className="text-bby-yellow" /> Store Top 3 Champions
      </h2>
      
      <div className="flex-row justify-center align-end gap-xl h-400px mt-xl">
        
        {/* Rank 2 */}
        {topAdvisors[1] && (
          <div className="flex-column align-center animate-slide-up" data-testid="leaderboard-rank-2">
            <div className="text-2xl font-bold mb-md text-white">{topAdvisors[1].name}</div>
            <div className="flex-column align-center justify-start pt-xl w-200px h-250px bg-white-alpha-10 border-glass rounded-t-2xl border-b-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-white-alpha-05 to-white-alpha-10 pointer-events-none" />
              <div className="text-6xl font-bold text-muted relative z-10">2</div>
              <div className="mt-auto mb-xl text-2xl font-bold text-white relative z-10">
                {((topAdvisors[1].memberships || 0) + (topAdvisors[1].apps || 0))} Wins
              </div>
            </div>
          </div>
        )}

        {/* Rank 1 */}
        {topAdvisors[0] && (
          <div className="flex-column align-center animate-slide-up animation-delay-200" data-testid="leaderboard-rank-1">
            <div className="text-3xl font-bold mb-md text-bby-yellow">{topAdvisors[0].name}</div>
            <div className="flex-column align-center justify-start pt-xl w-250px h-350px bg-bby-yellow-alpha-10 border-2 border-bby-yellow rounded-t-2xl border-b-0 relative overflow-hidden shadow-glow">
              <div className="absolute inset-0 bg-gradient-to-t from-bby-yellow-alpha-05 to-bby-yellow-alpha-20 pointer-events-none" />
              <div className="text-7xl font-bold text-bby-yellow relative z-10">1</div>
              <div className="mt-auto mb-xl text-3xl font-bold text-white relative z-10">
                {((topAdvisors[0].memberships || 0) + (topAdvisors[0].apps || 0))} Wins
              </div>
            </div>
          </div>
        )}

        {/* Rank 3 */}
        {topAdvisors[2] && (
          <div className="flex-column align-center animate-slide-up animation-delay-100" data-testid="leaderboard-rank-3">
            <div className="text-2xl font-bold mb-md text-warning">{topAdvisors[2].name}</div>
            <div className="flex-column align-center justify-start pt-xl w-200px h-200px bg-warning-alpha-10 border-glass rounded-t-2xl border-b-0 relative overflow-hidden border-warning">
              <div className="absolute inset-0 bg-gradient-to-t from-warning-alpha-05 to-warning-alpha-10 pointer-events-none" />
              <div className="text-6xl font-bold text-warning relative z-10">3</div>
              <div className="mt-auto mb-xl text-2xl font-bold text-white relative z-10">
                {((topAdvisors[2].memberships || 0) + (topAdvisors[2].apps || 0))} Wins
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
