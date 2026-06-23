---
name: premium-component-scaffold
description: UI/UX template generator enforcing premium design tokens and layout conventions. Use this when creating new React components.
---

# Premium Component Scaffold

This skill prevents the accumulation of inline CSS technical debt. Whenever you are asked to create a new React component, Page, or Modal, you MUST base it on the provided templates in this skill folder instead of writing generic MVP HTML.

## Golden Rules
1. **NO INLINE STYLES**: You are strictly forbidden from using `style={{...}}`.
2. **Use Utility Classes**: Only use the classes defined in `src/index.css` (e.g., `flex-center`, `gap-md`, `text-lg`).
3. **Use Premium Tokens**: Leverage `--bg-surface`, `--bg-obsidian`, and `--border-glass` for containers. Use `--bby-blue`, `--bby-yellow`, and `--success-glow` for accents.
4. **Micro-Animations**: All clickable elements must include the `--transition-normal` property.

## Available Templates
To view the templates, read the files located in `.agents/skills/premium-component-scaffold/templates/`:

1. **`GlassCardTemplate.tsx`**: Use this when building dashboard widgets, stat metrics, or content containers. It utilizes the premium glassmorphism borders and background tokens.
2. **`StandardModalTemplate.tsx`**: Use this when building popups, forms, or confirmations. It includes the correct overlay, z-indexing, and close button positioning.

## How to use
When creating a new file, copy the contents of the relevant template and modify it to fit the feature. Do not strip away the core wrapper classes.
