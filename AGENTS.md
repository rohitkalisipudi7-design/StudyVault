# Project Rules — UI/UX Pro Max Integration

## Mandatory UI/UX Standards

Whenever designing, building, reviewing, styling, or fixing user interfaces, components, pages, design systems, typography, color palettes, or frontend code in this repository:

1. **Mandatory Skill Activation:**
   Always consult and apply the **`ui-ux-pro-max`** skill located at:
   - `C:/Users/rohit/.agents/skills/ui-ux-pro-max/SKILL.md`
   - `C:/Users/rohit/.gemini/config/skills/ui-ux-pro-max/SKILL.md`

2. **Design Intelligence & CLI Reasoning:**
   When defining or refining visual design systems, color tokens, typography pairings, or stack-specific patterns, run the bundled search engine:
   ```bash
   python "C:/Users/rohit/.agents/skills/ui-ux-pro-max/scripts/search.py" "<keywords>" --design-system
   python "C:/Users/rohit/.agents/skills/ui-ux-pro-max/scripts/search.py" "<query>" --domain <style|color|typography|ux|icons|chart>
   python "C:/Users/rohit/.agents/skills/ui-ux-pro-max/scripts/search.py" "<query>" --stack <stack-name>
   ```

3. **Core Design & Accessibility Gates:**
   - **Contrast:** Strict WCAG 2.1 AA minimum (4.5:1 for body text, 3:1 for large display/headers).
   - **Touch Targets:** Minimum 44px x 44px on mobile viewports.
   - **Icons:** SVG/Lucide/Heroicons only (never raw emojis as functional UI icons).
   - **Motion:** Always respect `prefers-reduced-motion`.
   - **No Visual Clutter:** Cohesive design tokens, consistent elevation shadows, and defined spacing scales.
