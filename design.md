# Mempalace Design System & Continuity Guide

**Last Updated:** May 14, 2026  
**Version:** 1.0  
**Product:** Mempalace — Universal LLM-Agnostic Memory Palace (part of Unimatrix)

## 1. Vision & Personality
- **Core Feeling:** A calm, magical, trustworthy "second brain". Think: Notion × Linear × Arc Browser × Apple Intelligence.
- **Tone:** Professional yet warm, futuristic-minimal, intelligent, spacious.
- **Key Words:** Clarity, Depth, Connection, Delight, Control, Memory.

## 2. Color Palette (Dark Mode Primary)

| Role              | Hex         | Usage                              |
|-------------------|-------------|------------------------------------|
| Background        | `#0A0F1C`   | Main bg                            |
| Surface           | `#111827`   | Cards, panels                      |
| Surface Elevated  | `#1F2937`   | Modals, floating elements          |
| Accent Primary    | `#00F5FF`   | Cyan — buttons, links, highlights  |
| Accent Secondary  | `#A855F7`   | Purple — memory connections        |
| Text Primary      | `#F1F5F9`   | Main text                          |
| Text Secondary    | `#94A3B8`   | Supporting text                    |
| Success           | `#22C55E`   | Connected, saved                   |
| Warning           | `#F59E0B`   | Attention needed                   |
| Error             | `#EF4444`   | Critical                           |
| Border            | `#334155`   | Subtle dividers                    |

**Light Mode** available but secondary (use same accents).

## 3. Typography
- **Headings:** Satoshi or Inter Bold (700)
- **Body:** Inter Regular (400) / Medium (500)
- **Mono:** JetBrains Mono or Berkeley Mono (for code/memory IDs)
- **Scale:**
  - H1: 32–40px
  - H2: 24–28px
  - H3: 18–20px
  - Body: 16px
  - Small: 14px / 13px

## 4. Design Language & Components

### Glassmorphism + Depth
- All cards have subtle backdrop blur (`backdrop-blur-xl`)
- Border: 1px solid with 8–12% opacity white
- Soft inner glow on interactive elements using cyan/purple
- Elevation: increasing shadow + slight scale on hover

### Spatial Memory Palace Style
- Nodes: rounded-xl cards with soft glow
- Connections: glowing bezier curves (thickness = similarity score)
- Background: very subtle grid or constellation pattern (low opacity)
- Zoomable canvas (like Figma / tldraw)

### Status Indicators
- **Connected:** Bright green dot + "Live • synced X seconds ago"
- **Syncing:** Cyan pulsing animation
- **Disconnected:** Orange dot with "Reconnect" button

## 5. Layout & Structure
- **Sidebar** (left, collapsible): Navigation + Memory Palaces list
- **Top Bar:** Global search, current palace breadcrumb, user avatar + plan
- **Main Content:** Responsive, generous padding (24–32px)
- **Floating Action Button (FAB):** Bottom right — "Memorize Anything" (cyan)
- **Right Sidebar:** Context panel (when viewing a memory)

## 6. Micro-interactions & Motion
- All buttons: scale 105% + glow on hover (duration 200ms)
- Memory nodes: gentle float animation when idle
- Retrieval: "thinking" particles or light rays shooting to relevant nodes
- Transitions: `ease-out` cubic-bezier(0.4, 0, 0.2, 1)

## 7. Key Screens – Style References
1. **Dashboard** — Clean grid of palaces + usage rings
2. **Memory Palace Canvas** — Spatial, zoomable, Method of Loci inspired
3. **Connections Hub** — Grid of LLM/device cards with live status
4. **Search** — Full-screen overlay with instant semantic results
5. **Memory Detail** — Rich editor + linked memories graph

## 8. Accessibility & Best Practices
- Contrast ratio ≥ 4.5:1
- Focus states with cyan ring
- ARIA labels on all interactive elements
- Keyboard navigation support
- Reduce motion option

## 9. Stitch / AI Prompt Rules (Always Include)
When generating in Stitch, always start prompts with:
> "Follow the Mempalace Design System exactly: dark navy base (#0A0F1C), cyan accent (#00F5FF), glassmorphic cards, Satoshi/Inter typography, spacious futuristic-minimal aesthetic."

## 10. File Naming & Handoff
- All designs must be exported with:
  - High-fidelity PNG
  - React + Tailwind component code (shadcn/ui style)
  - Figma link (if applicable)

---

**Approved By:** Timothy (Product Owner)  
**Purpose:** Maintain 100% visual & experiential continuity across web, desktop, and mobile.

Use this document as the single source of truth when prompting Stitch, Claude, or any designer/developer.
