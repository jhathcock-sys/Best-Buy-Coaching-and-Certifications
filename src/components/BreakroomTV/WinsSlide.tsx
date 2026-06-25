import React from 'react';
import { Flame } from 'lucide-react';

export interface WinRecord {
  id?: string;
  name: string;
  win: string;
  time: string;
}

interface WinsSlideProps {
  recentWins: WinRecord[];
}

export default function WinsSlide({ recentWins }: WinsSlideProps) {
  if (!recentWins || recentWins.length === 0) return null;

  return (
    <div className="slide-fade-in w-full max-w-1000px mx-auto" data-testid="wins-slide">
      <h2 className="text-4xl text-white mb-xl flex align-center justify-center gap-md font-heading m-0 text-center">
        <Flame size={48} className="text-error" /> Floor Wins Feed
      </h2>
      
      <div className="flex-column gap-xl mt-xl">
        {recentWins.map((win, idx) => (
          <div 
            key={win.id || idx} 
            className="flex-row align-center justify-start bg-white-alpha-05 border-glass rounded-2xl p-xl gap-xl opacity-0 animate-slide-in-right" 
            style={{ animationDelay: `${0.4 + idx * 0.2}s`, animationFillMode: 'forwards' }}
            data-testid={`win-item-${win.id || idx}`}
          >
            <div className="flex-center w-80px h-80px rounded-full bg-bby-blue text-3xl font-bold shrink-0">
              {win.name?.charAt(0) || '?'}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold m-0 mb-sm text-bby-yellow">{win.name}</h3>
              <p className="text-xl m-0 text-white">"{win.win}"</p>
            </div>
            <div className="text-lg text-muted whitespace-nowrap shrink-0">
              {win.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
