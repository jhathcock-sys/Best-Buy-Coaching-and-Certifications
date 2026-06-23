import React from 'react';
import DOMPurify from 'dompurify';

export const renderMarkdown = (text: any) => {
    return text.split('\n').map((line: any, i: number) => {
      if (line.startsWith('## ')) return <h3 key={i} style={{ color: '#fff', marginTop: '1.25rem', marginBottom: '0.5rem' }}>{line.replace('## ', '')}</h3>;
      if (line.startsWith('# ')) return <h2 key={i} style={{ color: 'var(--bby-blue)', marginTop: '0', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>{line.replace('# ', '')}</h2>;
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) return <li key={i} style={{ marginLeft: '1.5rem', marginBottom: '0.25rem' }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(line.replace(/^[-*]\s/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')) }} />;
      if (line.trim() === '') return <br key={i} />;
      
      // Handle bold
      const boldedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} style={{ marginBottom: '0.5rem', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(boldedLine) }} />;
    });
  };

export const formatMarkdownNotes = (text: any) => {
    if (!text) return '';
    return text.split('\n').map((line: any, i: number) => {
      if (line.startsWith('##')) {
        return <h4 key={i} style={{ color: 'var(--bby-yellow)', fontSize: '0.95rem', margin: '0.75rem 0 0.4rem 0', fontFamily: 'var(--font-heading)' }}>{line.replace(/##/g, '').trim()}</h4>;
      }
      if (line.startsWith('* **')) {
        const parts = line.replace(/^\*\s+/, '').split('**');
        const label = parts[1] || '';
        const desc = parts.slice(2).join('**').trim();
        return (
          <p key={i} style={{ margin: '0.25rem 0', fontSize: '0.82rem', lineHeight: 1.4, color: 'var(--text-secondary)' }}>
            <strong style={{ color: '#fff' }}>{label}</strong> {desc}
          </p>
        );
      }
      return <p key={i} style={{ margin: '0.25rem 0', fontSize: '0.82rem', lineHeight: 1.4, color: 'var(--text-secondary)' }}>{line}</p>;
    });
  };
