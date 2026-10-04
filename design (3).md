# WAY2HUMANITY — DESIGN SPECIFICATION
**Version:** 1.0.0
**Target:** AI Coding Agent / Front-End Engineering Team
**Mission:** "Growing Humanity Through Technology"

---

## 1. DESIGN PHILOSOPHY
Way2Humanity is a humanitarian digital art experience that functions as a real working product, a trust platform, and a community network. The core philosophy is **"People helping people."** Technology acts exclusively as the invisible trust layer supporting human connection. The experience must feel cinematic, tactile, physical, and deeply emotional. 

## 2. VISUAL IDENTITY
- **Aesthetic:** Warm, minimal, premium, editorial, human, and sophisticated.
- **Atmosphere:** An interactive physical art installation.
- **Technology Representation:** Invisible. AI and blockchain elements are communicated through trust and transparency, *never* through futuristic visual tropes. 
- **Core Visual Metaphor:** Physical evidence (paper, photographs, clay, hands) coming together to form a connected whole.

## 3. PAGE ARCHITECTURE
The platform operates as a continuous, single-page, scroll-driven journey. 
- **Layer 0 (Background):** A global WebGL canvas handling all 3D objects, lighting, and spatial transitions.
- **Layer 1 (Narrative Scroll):** DOM-based typography and UI elements synced strictly to scroll progress via a library like GSAP (ScrollTrigger).
- **Layer 2 (Interactive Overlay):** Minimal fixed UI (Navigation, active state controls, accessibility toggles).

## 4. 3D SCENE ARCHITECTURE
- **Lighting:** Soft, directional studio lighting. Use high-quality shadow mapping and ambient occlusion to emphasize the physical volume of organic materials. No harsh spotlights.
- **Camera:** Orthographic or low-FOV perspective camera to mimic editorial photography. 
- **Environment:** Void-like but warm space (matching the background color system). No infinite grids or sci-fi environments.
- **Materials:** Exclusively physically-based rendering (PBR) materials utilizing subsurface scattering for organic elements.

## 5. SCROLL FLOW
The user's scroll directly drives the narrative timeline:
`NEED` → `REPORT` → `VERIFY` → `CONNECT` → `HELP` → `PROVE` → `IMPACT` → `HUMANITY`
Scrolling scrubs through a continuous camera path, triggering depth transitions, object rotations, and typography reveals.

---

## 6. SECTION-BY-SECTION DESIGN

### 6.1 HERO: Opening Scene
- **Purpose:** Establish immediate trust and humanity.
- **User Emotion:** Empathetic, grounded, hopeful.
- **Visual Composition:** A slow-moving, artistic 3D composition of sculpted human hands gently holding a physical photograph or a piece of textured paper.
- **3D Objects:** Clay-textured hands, paper mesh with slight wave displacement.
- **Camera Behavior:** Slow pan and gentle parallax. Depth of field focused on the paper/hands, blurring the background.
- **Scroll Behavior:** Scrolling pulls the camera back, revealing the context of the opening story.
- **Typography:** Large, editorial serif headline: "Helping should never feel uncertain."
- **Interaction:** Parallax on mouse move (desktop).
- **Content:** Primary CTA: "REPORT A NEED" / Secondary CTA: "FIND A WAY TO HELP".
- **Responsive:** Hands scale down to remain fully visible; text stacks vertically.
- **Accessibility:** Ensure high contrast between text and the 3D background. 

### 6.2 OPENING SCROLL STORY
- **Purpose:** Establish the core narrative context.
- **User Emotion:** Introspective.
- **Visual Composition:** Minimal text fading in and out across the screen.
- **3D Objects:** Scattered, disconnected physical fragments (pieces of paper, ceramic shards) floating in a warm void.
- **Camera Behavior:** Camera moves *through* the floating objects.
- **Typography:** Staggered reveals: "Someone, somewhere, needs help." → "The problem isn't always finding people who care." → "Sometimes, it's knowing what to trust."

### 6.3 PROBLEM SECTION
- **Purpose:** Visually represent Fake News, Black Hole Effect, and Disconnected Communities.
- **User Emotion:** Understanding, slight tension resolving into clarity.
- **Visual Composition:** Abstracted sculptural representations of the problems. 
- **3D Objects:** 
  - *Fake News:* Blurred/distorted physical photos that snap into sharp focus.
  - *Black Hole:* A thread dropping into shadow, then catching a light source.
  - *Disconnected:* Two clay figures on separate planes that slowly rotate to face each other.
- **Scroll Behavior:** The three concepts transition seamlessly as the user scrolls, *not* presented as three side-by-side cards.

### 6.4 REPORT A NEED
- **Purpose:** Demonstrate the reporting flow elegantly.
- **Visual Composition:** A minimal, unstyled smartphone frame or physical document layout.
- **3D Objects:** A document or device blending physical and digital realms. Location marker (organic shape, not a standard map pin).
- **Typography:** Step-by-step fading text (Report → Evidence → Location → Submit).
- **Interaction:** Scroll triggers the sequential "filling out" of the form.

### 6.5 AI MISSION COPILOT
- **Purpose:** Show unstructured data becoming structured mission data via AI.
- **Visual Composition:** Calm, conversational text parsing.
- **3D Objects:** A soft, glowing, natural material (like warm frosted glass or tracing paper) overlaying the text. NO robots or brains.
- **Animation:** Text organically highlights and extracts into structured metadata (Category, Urgency, Location) without jarring technical UI.

### 6.6 AI VERIFICATION
- **Purpose:** Communicate trust, integrity, and human oversight in verification.
- **Visual Composition:** A physical photograph undergoing analysis.
- **Camera Behavior:** Top-down view of the evidence.
- **Content:** "AI-ASSISTED VERIFICATION. Human review when required."
- **Typography:** Clean UI overlays showing metadata consistency (Location, Risk).

### 6.7 TRUSTGRAPH
- **Purpose:** Map the flow from report to impact.
- **Visual Composition:** An elegant, editorial timeline/diagram. 
- **3D Objects:** Ceramic circles connected by thin, physical threads or etched lines on a natural surface.
- **Scroll Behavior:** The camera tracks along the connecting lines as the user scrolls.

### 6.8 HUMANITY RADAR & HELPER NETWORK
- **Purpose:** Discover nearby missions and connect helpers.
- **Visual Composition:** A beautiful, abstract topographic map (not a military radar). 
- **3D Objects:** Gentle undulations in a paper-like surface indicating need density.
- **UI:** Editorial layout showing mission details (e.g., "12 km away, FOOD SUPPORT, 18 families"). NO generic grid of cards.

### 6.9 HELP / ACTION & DONATION TRANSPARENCY
- **Purpose:** Show the direct pipeline of contribution.
- **Visual Composition:** A continuous visual chain showing "YOUR CONTRIBUTION → MISSION → ACTION → PROOF → IMPACT".
- **Interaction:** A guided scroll path where a token (representing help) moves from the user's side to the destination.

### 6.10 PROOF OF WORK & IMPACT
- **Purpose:** The signature trust moment.
- **Visual Composition:** "Before & After" physical photographs laid on a tactile surface.
- **Content:** Real outcomes, timestamps, verified locations. Emotionally resonant photography.

### 6.11 SUCCESS GALLERY & HUMANITY PASSPORT
- **Purpose:** Storytelling and verified human contribution.
- **Visual Composition:** Large, cinematic photography dominating the screen. Thin borders for the Passport record.
- **UI:** A refined ledger of contributions (Humanity Points, missions). Does *not* look like a gaming profile.
- **Content Strict Rule:** Must explicitly label "DEMO DATA" if using placeholders.

### 6.12 HUMANITY HEATMAP & CSR COMMAND CENTER
- **Purpose:** Organizational impact interface.
- **Visual Composition:** More structured but retaining the warm, editorial aesthetic. 
- **UI:** Data presented through typography and simple lines rather than heavy dashboards.

### 6.13 BUSINESS MODEL
- **Purpose:** Explain sustainability.
- **Visual Composition:** An editorial story format. NO three-tier pricing tables or SaaS cards.

### 6.14 FINAL SCENE
- **Purpose:** Emotional climax.
- **Visual Composition:** All disconnected elements from the opening scroll now form a single, unified, beautiful 3D sculpture.
- **Typography:** "DIFFERENT PEOPLE. ONE HUMANITY."
- **Content:** Primary CTA: "REPORT A NEED" / "HELP SOMEONE".

---

## 7. TYPOGRAPHY
- **Primary Font (Headings/Editorial):** A warm, highly legible, premium Serif (e.g., *GT Alpina*, *PP Editorial New*, or similar classic proportions).
- **Secondary Font (UI/Data):** A clean, humanist Sans-Serif (e.g., *Lineto Circular*, *Inter* fine-tuned for warmth). 
- **Prohibited:** Space Grotesk, Intergeist, futuristic fonts, monospaced terminal fonts.
- **Styling:** Rely on scale, weight, and tracking for hierarchy. Never rely on heavy containers or backgrounds.

## 8. COLORS
**Primary Palette:**
- Backgrounds: Warm ivory (`#F9F8F6`), Warm white (`#FFFFFF`)
- Text/Primary UI: Deep charcoal (`#2C2B29`), Soft black (`#1A1A1A`)

**Supporting Palette (Natural & Restrained):**
- Dusty rose (`#C8A9A9`)
- Muted terracotta (`#C28F7B`)
- Muted green (`#8A9A86`)
- Warm amber (`#D9A05B`)
- Beige/Taupe (`#E3DCD2`)
- Soft gray (`#D1D0CE`)

**Prohibited:** Neons, pure blacks, pure vibrant blues/purples, rainbow gradients.

## 9. 3D MATERIALS
- **Tactile PBR:** Clay, unglazed ceramic, textured cotton paper, linen fabric, matte wood.
- **Visual Effects:** Soft subsurface scattering to mimic human skin and wax. 
- **Prohibited:** Chrome, glass/liquid glass, holographic shaders, glowing neon materials, sci-fi metals.

## 10. PHOTOGRAPHY DIRECTION
- **Style:** Documentary, editorial, unpolished but high-quality.
- **Subjects:** Humans, connection, real environments.
- **Prohibited:** Generic stock, overly posed corporate smiles, AI-generated synthetic faces.

## 11. MOTION
- **Easing:** Cinematic, slow, organic (e.g., `power2.inOut` or `power3.out`).
- **Pacing:** Let the user's scroll dictate the speed. Add gentle continuous float/breathe animations to 3D objects to feel alive.
- **Prohibited:** Springy/bouncy animations, glitch effects, rapid zooming, constant micro-hover flashes.

## 12. INTERACTION RULES
- Hover states should be subtle (e.g., a slight change in opacity or a slow underline reveal).
- Forms and inputs should be reduced to their absolute minimal visual essence (a single underline).

## 13. UI COMPONENTS
- **Cards:** Avoid completely. Use spatial grouping and typography to separate content. If boundaries are necessary, use 1px thin lines in `Soft gray`.
- **Buttons:** Simple typographic buttons with thin borders or solid `Deep charcoal` blocks with `Warm ivory` text. Fully rounded corners are banned; use sharp or minimally rounded (2px-4px) corners.
- **Overlays:** Semi-transparent warm ivory, never blurred glassmorphism.

## 14. RESPONSIVE BEHAVIOR
- **Desktop:** Full WebGL canvas drives the experience.
- **Tablet:** Camera FOV adjusts; interactive elements increase in hit-area size.
- **Mobile:** The 3D canvas scales down or locks to specific keyframes. Typography takes absolute precedence. Touch-scrolling must feel native and buttery smooth.

## 15. ACCESSIBILITY
- `prefers-reduced-motion`: When detected, disable the scroll-driven camera journey. Replace with cross-fading static 3D renders and standard vertical scrolling DOM content.
- **Semantics:** All text must be in the DOM (not rendered in WebGL). Ensure strict `h1`-`h6` hierarchy.
- **Contrast:** Ensure Deep Charcoal on Warm Ivory passes WCAG AAA.

## 16. LOADING & SYSTEM STATES
- **3D Loading:** Do not use spinner icons. Use a slow, cinematic reveal (e.g., fading up from warm ivory, or a silhouette slowly catching light).
- **Verification in Progress:** A pulsing line or a gentle rotation of a physical document.
- **WebGL Unavailable:** Graceful fallback to static editorial photography.

## 17. ERROR STATES
- **Style:** Calm, helpful, direct. 
- **Visual:** A muted terracotta text notice. Never use alarming bright red or alert icons.

## 18. PERFORMANCE CONSTRAINTS
- **Geometry:** Keep polycounts low. Bake details into normal/displacement maps.
- **Textures:** Optimize and compress (KTX2/Basis).
- **Loading:** Lazy-load off-screen 3D assets. Initialize the hero scene first, then stream the rest of the narrative models.

## 19. CONTENT RULES
- Tone: Empathetic, factual, clear, confident.
- Labels: Any demonstration data MUST include an elegant `[ SAMPLE DATA ]` badge. 

## 20. STRICT ANTI-PATTERNS (NON-NEGOTIABLE)
- NO Cyberpunk / Neon / Futuristic UI.
- NO AI brains, holograms, or glowing orbs.
- NO Bento grids or generic 3-card layouts.
- NO Three-tier pricing tables.
- NO Glassmorphism or heavy drop shadows.
- NO Animated decorative arrows or sparkle icons.
- NO Fake statistics or testimonials.

---

## 21. FINAL DESIGN CHECKLIST

Before final implementation approval, the engineering and design agent must validate:

- [ ] **HUMAN:** Does it feel like people helping people?
- [ ] **TRUST:** Does the user understand why something is trustworthy?
- [ ] **FLOW:** Does the website feel like one continuous story?
- [ ] **3D:** Does 3D communicate meaning rather than just decoration?
- [ ] **ORIGINAL:** Does it feel specifically designed for Way2Humanity?
- [ ] **PRODUCT:** Does the design demonstrate real product functionality?
- [ ] **SIMPLE:** Can a normal user understand the experience?
- [ ] **ACCESSIBLE:** Does it remain usable without animation?
- [ ] **PERFORMANT:** Can it work on normal devices?

*If any answer is NO, the specific component must be redesigned before deployment.*