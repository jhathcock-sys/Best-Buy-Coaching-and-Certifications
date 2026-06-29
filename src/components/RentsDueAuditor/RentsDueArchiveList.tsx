import React from 'react';
import { FileText } from 'lucide-react';
import { RentsDueArchive } from '../../types';

interface RentsDueArchiveListProps {
  archives: RentsDueArchive[];
}

export default function RentsDueArchiveList({ archives }: RentsDueArchiveListProps) {
  return (
    <div className="flex-column gap-md" data-testid="archives-list">
      {!archives || archives.length === 0 ? (
        <div className="glass-card p-xl text-center text-secondary" data-testid="empty-archives-msg">
          No Rents Due archives found for this store.
        </div>
      ) : (
        archives.map(arch => (
          <div key={arch.id} className="glass-card p-md flex-row justify-between align-center" data-testid={`archive-item-${arch.id}`}>
            <div>
              <h4 className="m-0 font-bold text-sm">{arch.fileName}</h4>
              <div className="text-xs text-secondary mt-xs">
                Period: {arch.period} | Uploaded: {new Date(arch.timestamp).toLocaleString()}
              </div>
            </div>
            <a href={arch.downloadUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary cursor-pointer text-xs px-md py-sm flex-center-y gap-xs" data-testid={`download-archive-${arch.id}`}>
              <FileText size={14} /> View / Download
            </a>
          </div>
        ))
      )}
    </div>
  );
}
