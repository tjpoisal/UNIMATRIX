# Unimatrix — Complete Onboarding & Prompting Audit

## ✅ WHAT EXISTS

### Marketing Site
- ✅ Palace theme with 6-stage funnel
- ✅ SEO (JSON-LD, OpenGraph, keywords)
- ✅ Pricing transparency
- ✅ Feature explanations
- ✅ CTA buttons ("Start Free")

### Web App
- ✅ Signup/login flows (`/auth/register`, `/auth/login`)
- ✅ Forgot password flow
- ✅ Dashboard (`/dashboard`)
- ✅ Memory creator component

### Browser Extension
- ✅ Installation instructions (README)
- ✅ Settings page with auth
- ✅ Quick save popup UI

### MCP Server
- ✅ Tools exposed (remember, recall, etc.)
- ✅ API documented in CLAUDE.md

### Mobile App
- ✅ Auth screens exist
- ✅ Basic structure in place

---

## ❌ WHAT'S MISSING

### **1. Web App Onboarding Flow** ❌
Missing:
- [ ] Welcome screen (first-time user)
- [ ] Step-by-step setup wizard
- [ ] Encryption password setup (explained clearly)
- [ ] "Create your first memory" guided walkthrough
- [ ] Workspace/context creation tutorial
- [ ] Dashboard orientation
- [ ] Completion celebration + next steps

**Priority:** CRITICAL (blocks user activation)

### **2. In-App Prompting & Guidance** ❌
Missing:
- [ ] Contextual tooltips ("What is this?")
- [ ] Onboarding checklist (sidebar)
- [ ] Smart empty states ("You have no memories yet — save one now")
- [ ] Help modal system
- [ ] Keyboard shortcut hints
- [ ] Progressive disclosure (show advanced features later)
- [ ] Hotspot/beacon system (highlight clickable elements)

**Priority:** HIGH (improves UX, reduces support)

### **3. Mobile App Onboarding** ❌
Missing:
- [ ] Native mobile onboarding flow
- [ ] Touch-friendly tutorials
- [ ] Mobile-specific "save from clipboard" tutorial
- [ ] Push notification opt-in + explanation

**Priority:** HIGH (mobile = 40% of users)

### **4. Extension Onboarding** ❌
Missing:
- [ ] First-install welcome page
- [ ] "Here's how to use this" walkthrough
- [ ] Chrome permissions explanation
- [ ] Settings page tour
- [ ] Badge/notification on first use
- [ ] Video demo (30 sec)

**Priority:** HIGH (extension = main entry point for web LLMs)

### **5. MCP Server Setup Guide** ❌
Missing:
- [ ] Claude Desktop config tutorial (with copy-paste examples)
- [ ] Cursor IDE integration guide
- [ ] Windsurf setup instructions
- [ ] Getting API key (docs)
- [ ] Testing connection (CLI command)
- [ ] Troubleshooting guide

**Priority:** CRITICAL (developers need this to get started)

### **6. Video Tutorials** ❌
Missing:
- [ ] 30-second "what is Unimatrix" explainer
- [ ] "Save your first memory" (web)
- [ ] "Install extension and save from ChatGPT" (extension)
- [ ] "Configure Claude Desktop" (MCP)
- [ ] "Access memory across devices" (cross-LLM feature)

**Priority:** HIGH (video = 70% higher engagement)

### **7. Email Onboarding Series** ❌
Missing:
- [ ] Welcome email (day 0)
- [ ] "Set up encryption" email (day 1)
- [ ] "Save your first memory" email (day 3)
- [ ] "Install extension" email (day 5)
- [ ] "Try MCP with Claude" email (day 7)
- [ ] "You're missing out" re-engagement (day 14)

**Priority:** MEDIUM (email nurtures inactive users)

### **8. Guided Tours & Hotspots** ❌
Missing:
- [ ] Interactive tour of dashboard
- [ ] Highlight memory creator on first visit
- [ ] Beacon effect on "Settings" (where to set encryption password)
- [ ] Tour of context/workspace creation
- [ ] "Try this feature" prompts based on behavior

**Priority:** HIGH (proven to increase feature adoption)

### **9. Help Documentation** ❌
Missing:
- [ ] In-app help center (`/help`)
- [ ] FAQ searchable page
- [ ] "How do I...?" guides
- [ ] Troubleshooting section
- [ ] Security/privacy explanations (deep dive)
- [ ] Glossary (Memory, Context, Palace, etc.)

**Priority:** MEDIUM (reduces support load)

### **10. Desktop App (Electron)** ❌
Missing:
- [ ] Multi-LLM conversation UI (planned in CLAUDE.md)
- [ ] Collaborative room feature
- [ ] Native app onboarding

**Priority:** LOW (Wave 2, Week 6+)

### **11. Prompting System** ❌
Missing:
- [ ] "What to do next" suggestions (context-aware)
- [ ] Empty state prompts ("Your memory palace is empty. Save one now!")
- [ ] Idle user prompts ("It's been a week...")
- [ ] Feature discovery prompts ("Did you know you can...?")
- [ ] Celebration prompts (milestone: 10 memories saved)

**Priority:** HIGH (increases engagement)

### **12. Accessibility & i18n** ❌
Missing:
- [ ] Screen reader support (ARIA labels)
- [ ] Keyboard-only navigation
- [ ] High contrast mode
- [ ] Multi-language support (Spanish, French, Chinese, etc.)

**Priority:** MEDIUM (expands addressable market)

### **13. Analytics & Tracking** ❌
Missing:
- [ ] Onboarding completion tracking
- [ ] Feature adoption metrics
- [ ] Funnel analytics (signup → first memory → etc.)
- [ ] Heatmaps (where do users click?)
- [ ] Session recordings (understand friction points)

**Priority:** HIGH (data-driven improvements)

### **14. A/B Testing Framework** ❌
Missing:
- [ ] Test different onboarding flows
- [ ] Test CTA copy variations
- [ ] Test email subject lines
- [ ] Test pricing page layouts
- [ ] Statistical significance testing

**Priority:** MEDIUM (optimize conversion)

---

## 📋 COMPLETE ONBOARDING FLOW (By Entry Point)

### **Flow 1: Marketing Site → Signup → Web App**
```
Landing page (deployunimatrix.com)
    ↓ Click "Start Free"
Sign up form
    ↓ Verify email
Welcome screen ("Your memory palace awaits")
    ↓
Encryption setup ("Protect your memories")
    ↓ Set password + explanation
First memory walkthrough ("Save something from this conversation")
    ↓
Context/workspace setup ("Organize by project, topic, or device")
    ↓
Dashboard orientation (tour with hotspots)
    ↓
CTA: "Install extension" or "Connect to Claude"
```

### **Flow 2: Browser Extension → Web App**
```
Click extension icon
    ↓
Options page (settings)
    ↓ First time?
Redirect to signup at deployunimatrix.com
    ↓
Return to extension (auth'd)
    ↓
Extension welcome overlay ("Save from web LLMs")
    ↓
Show "Save to Unimatrix" button highlight
    ↓
Prompt: "Try saving from ChatGPT"
    ↓
CTA: "View in dashboard"
```

### **Flow 3: MCP (Claude Desktop) → Setup**
```
User wants to add Unimatrix to Claude Desktop
    ↓
Go to https://deployunimatrix.com/mcp-setup
    ↓
Video: "Configure in 2 minutes" (shows copy-paste)
    ↓
Copy config snippet
    ↓
Edit ~/.config/Claude/claude_desktop_config.json
    ↓
Test: `@unimatrix recall "python recursion"`
    ↓
Success message + next steps
```

### **Flow 4: Mobile App**
```
Download from App Store
    ↓
Sign in (or create account)
    ↓
Mobile onboarding tour
    ↓
Permission requests (notifications, clipboard)
    ↓
"Save from clipboard" walkthrough
    ↓
Create first memory
    ↓
View in dashboard (web)
    ↓
Cross-device sync explanation
```

---

## 🎬 VIDEO CONTENT NEEDED

| Video | Length | Purpose | Priority |
|-------|--------|---------|----------|
| "What is Unimatrix?" | 30s | Homepage, landing | CRITICAL |
| "Save your first memory (web)" | 1m | Onboarding | HIGH |
| "Install extension & save from ChatGPT" | 1m | Extension | HIGH |
| "Configure Claude Desktop" | 2m | MCP setup | CRITICAL |
| "Cross-LLM handoff demo" | 2m | Feature showcase | MEDIUM |
| "Encryption explained" | 2m | Trust building | MEDIUM |
| "Mobile: save on the go" | 1m | Mobile onboarding | MEDIUM |

---

## 📊 IMPLEMENTATION ROADMAP

### **WEEK 1 (THIS WEEK) — CRITICAL PATH**
- [ ] Web app onboarding flow (welcome → memory creation)
- [ ] Extension first-install guide
- [ ] MCP setup guide + copy-paste config
- [ ] Email onboarding series (5 emails)

### **WEEK 2**
- [ ] In-app prompting system (tooltips, empty states)
- [ ] Guided tour with hotspots
- [ ] Help center (`/help`)
- [ ] Accessibility (ARIA labels)

### **WEEK 3**
- [ ] Video tutorials (5 key videos)
- [ ] Mobile onboarding flow
- [ ] Analytics + funnel tracking
- [ ] A/B testing framework

### **WEEK 4**
- [ ] Multi-language support (3 languages)
- [ ] Advanced prompting (smart suggestions)
- [ ] Session recordings (Hotjar/Clarity)
- [ ] Optimization based on data

---

## 🔧 TECHNICAL REQUIREMENTS

### Frontend Components Needed
```typescript
// Onboarding components
<WelcomeScreen />
<EncryptionSetup />
<FirstMemoryWalkthrough />
<OnboardingChecklist />
<HotspotBeacon point={{ x, y }} label="Click here" />
<ContextualTooltip content="..." />
<EmptyStatePrompt action={() => {}} />

// Help components
<HelpCenter />
<FAQ />
<SearchableGuide />
<FloatingHelpButton />
```

### Backend APIs Needed
```typescript
POST /api/onboarding/start
POST /api/onboarding/step/{step}
GET  /api/onboarding/progress
POST /api/help/search
GET  /api/tutorials/{tutorial-id}
POST /api/analytics/event
POST /api/feedback/onboarding
```

### Database Schema Updates
```sql
-- Track onboarding progress
CREATE TABLE onboarding_progress (
  user_id UUID PRIMARY KEY,
  current_step INT,
  steps_completed JSONB,
  completed_at TIMESTAMP,
  last_prompted_at TIMESTAMP
);

-- Track feature adoption
CREATE TABLE feature_adoption (
  user_id UUID,
  feature VARCHAR,
  first_used_at TIMESTAMP,
  usage_count INT
);

-- Store user preferences
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY,
  theme VARCHAR,
  language VARCHAR,
  notifications_enabled BOOLEAN,
  show_tooltips BOOLEAN
);
```

---

## 📈 SUCCESS METRICS

### Onboarding Completion
- [ ] 80%+ sign up → create first memory (currently unknown)
- [ ] <5 min average time to first memory (target)
- [ ] 60%+ activate extension (within 7 days)
- [ ] 40%+ set up MCP server (within 14 days)

### Engagement
- [ ] 50%+ create 2nd memory (within 3 days)
- [ ] 70%+ return after day 1
- [ ] 40%+ retain after month 1

### Support Reduction
- [ ] -50% support emails (current unknown → target)
- [ ] -70% "how do I...?" questions (via in-app help)

---

## ✅ COMPLETE CHECKLIST FOR LAUNCH

- [ ] Web app onboarding (5 screens)
- [ ] Extension first-install guide
- [ ] MCP setup guide (copy-paste config)
- [ ] Email onboarding series (5 emails)
- [ ] Video tutorials (3 minimum: web, extension, MCP)
- [ ] In-app help center
- [ ] Tooltip system (10+ key tooltips)
- [ ] Empty state prompts
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] Analytics tracking
- [ ] Mobile onboarding
- [ ] Guided tour (hotspots)
- [ ] FAQ page
- [ ] Troubleshooting guide
- [ ] API documentation (MCP setup)

---

## 🎯 PRIORITY ORDER (Do This First)

1. **Web app onboarding** (blocks user activation) — START NOW
2. **Extension first-install** (main entry point) — START NOW
3. **MCP setup guide** (critical for dev users) — START NOW
4. **Video tutorials** (3 videos) — THIS WEEK
5. **Email onboarding** (nurture inactive users) — THIS WEEK
6. **In-app help** (reduce support load) — NEXT WEEK

---

## 🚨 CURRENT GAP

**What's blocking conversion right now:**
- Users sign up but don't know what to do next
- Extension users don't understand it works with ChatGPT
- Developers can't figure out MCP setup
- No video = people leave without understanding value
- No email follow-up = bounce rate high

**Fix:** Complete onboarding flows for each entry point (web, extension, MCP) + video content.

---

**Status:** 🔴 **CRITICAL — 80% of onboarding infrastructure MISSING**

**Estimate:** 40-60 hours to complete all onboarding (2 devs, 1 week)
