import { describe, it, expect, vi } from 'vitest';
import { renderMarkdown, formatMarkdownNotes } from '../profileUtils';
import { render } from '@testing-library/react';

vi.mock('dompurify', () => ({
  default: {
    sanitize: (str: string) => str // Mock sanitize for tests to simplify
  }
}));

describe('profileUtils', () => {
  describe('renderMarkdown', () => {
    it('returns null for empty input', () => {
      expect(renderMarkdown(null)).toBeNull();
      expect(renderMarkdown(undefined)).toBeNull();
      expect(renderMarkdown('')).toBeNull();
    });

    it('renders heading 2', () => {
      const result = renderMarkdown('# Heading 2');
      const { container } = render(<>{result}</>);
      expect(container.querySelector('h2')).not.toBeNull();
      expect(container.textContent).toContain('Heading 2');
    });

    it('renders heading 3', () => {
      const result = renderMarkdown('## Heading 3');
      const { container } = render(<>{result}</>);
      expect(container.querySelector('h3')).not.toBeNull();
      expect(container.textContent).toContain('Heading 3');
    });

    it('renders list items', () => {
      const result = renderMarkdown('* List item\n- Another list item');
      const { container } = render(<>{result}</>);
      expect(container.querySelectorAll('li').length).toBe(2);
    });

    it('renders bold text in paragraphs', () => {
      const result = renderMarkdown('This is **bold** text');
      const { container } = render(<>{result}</>);
      expect(container.querySelector('p')).not.toBeNull();
    });
  });

  describe('formatMarkdownNotes', () => {
    it('returns null for empty input', () => {
      expect(formatMarkdownNotes(null)).toBeNull();
    });

    it('renders heading 4', () => {
      const result = formatMarkdownNotes('## Notes Heading');
      const { container } = render(<>{result}</>);
      expect(container.querySelector('h4')).not.toBeNull();
      expect(container.textContent).toContain('Notes Heading');
    });

    it('renders labeled list items', () => {
      const result = formatMarkdownNotes('* **Label:** Description');
      const { container } = render(<>{result}</>);
      expect(container.querySelector('strong')).not.toBeNull();
      expect(container.textContent).toContain('Label:');
    });

    it('renders normal paragraphs', () => {
      const result = formatMarkdownNotes('Just a regular note.');
      const { container } = render(<>{result}</>);
      expect(container.querySelector('p')).not.toBeNull();
      expect(container.textContent).toContain('Just a regular note.');
    });
  });
});
