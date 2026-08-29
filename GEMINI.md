# Agent Behavioral Rules: UI Iconography & Aesthetics

## Zero-Emoji Policy
- **NEVER use raw Unicode emojis** anywhere in user interfaces, JSX components, templates, or UI strings (no `🐱`, `🐾`, `🚀`, `⚡`, `🎯`, `👑`, `🔥`, `🏆`, `🏁`, `★`, etc.).
- **ALWAYS use animated SVGs or vector icons**:
  - Prefer existing SVG components from `./src/components/AspirantIcons.jsx` or inline `<svg>` elements with precise `viewBox`, `stroke`, `fill`, and sizing props.
  - Pair icons with modern micro-animations (e.g. subtle CSS glow, pulse, float, spin, or wave) for a premium, high-tech aesthetic.
  - When rendering mascots (such as the cat companion), render them as vector SVG illustrations (e.g. `AsciiMascot`, `ComicPeekingCatBuddy`, or inline SVG characters), never raw emojis.
- When handling external or legacy strings containing emojis, pass them through `stripEmojis()` from `./src/utils/textUtils.js` or replace with appropriate SVG badge icons.
