import React from 'react';
import DOMPurify from 'dompurify';

export const renderMarkdown = (text: string | null | undefined): React.ReactNode => {
    if (!text || typeof text !== 'string') return null;
    
    return text.split('\n').map((line: string, i: number) => {
      if (line.startsWith('## ')) return <h3 key={i} className="text-white mt-5 mb-2">{line.replace('## ', '')}</h3>;
      if (line.startsWith('# ')) return <h2 key={i} className="text-[var(--bby-blue)] mt-0 mb-4 border-b border-white/10 pb-2">{line.replace('# ', '')}</h2>;
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) return <li key={i} className="ml-6 mb-1" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(line.replace(/^[-*]\s/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')) }} />;
      if (line.trim() === '') return <br key={i} />;
      
      // Handle bold
      const boldedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} className="mb-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(boldedLine) }} />;
    });
};

export const formatMarkdownNotes = (text: string | null | undefined): React.ReactNode => {
    if (!text || typeof text !== 'string') return null;
    
    return text.split('\n').map((line: string, i: number) => {
      if (line.startsWith('##')) {
        return <h4 key={i} className="text-[var(--bby-yellow)] text-[0.95rem] my-3 font-[var(--font-heading)]">{line.replace(/##/g, '').trim()}</h4>;
      }
      if (line.startsWith('* **')) {
        const parts = line.replace(/^\*\s+/, '').split('**');
        const label = parts[1] || '';
        const desc = parts.slice(2).join('**').trim();
        return (
          <p key={i} className="my-1 text-[0.82rem] leading-relaxed text-[var(--text-secondary)]">
            <strong className="text-white">{label}</strong> {desc}
          </p>
        );
      }
      return <p key={i} className="my-1 text-[0.82rem] leading-relaxed text-[var(--text-secondary)]">{line}</p>;
    });
};
