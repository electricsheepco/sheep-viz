# YouTube-Style Watermark Feature - Design Document

**Date:** 2026-02-15
**Project:** sheep-viz Control Room
**Feature:** Customizable watermark/logo system

---

## Overview

Add YouTube-style watermark functionality to sheep-viz, allowing musicians to upload their own band logo that appears in the bottom-right corner of all visualizers. Logo is customizable (size, opacity, visibility) and persists across sessions via localStorage.

---

## Requirements

**User Story:**
> As a musician using sheep-viz for live performances, I want to add my band's logo as a watermark so that when I record or stream my visuals, my branding is always visible.

**Key Features:**
- Upload custom logo image (replaces default sheep logo)
- Adjust watermark size (20-100px)
- Adjust watermark opacity (20-100%)
- Toggle watermark visibility on/off
- Reset to default sheep logo
- Settings persist across browser sessions
- Watermark syncs across all visualizers in Control Room
- Works in fullscreen and popout modes

**Default Behavior:**
- Default logo: sheep round logo (`icon.svg`)
- Default size: 40px
- Default opacity: 50%
- Default visibility: on

---

## Architecture

### System Design

**Control Room-Centric via postMessage:**

```
Control Room (control-room.html)
    ├─ Watermark UI (bottom bar)
    │   ├─ Upload button
    │   ├─ Visibility toggle
    │   ├─ Size slider (20-100px)
    │   ├─ Opacity slider (20-100%)
    │   └─ Reset button
    ├─ Watermark State
    │   ├─ logo (base64)
    │   ├─ size (number)
    │   ├─ opacity (number)
    │   └─ visible (boolean)
    └─ localStorage
        ├─ watermark_logo
        ├─ watermark_size
        ├─ watermark_opacity
        └─ watermark_visible

        │ postMessage
        ▼

Visualizer Iframe
    ├─ embed-adapter.js
    │   └─ Listens for watermark messages
    └─ hardware-controls.js
        └─ .sheep-watermark element
            ├─ Displays logo/text
            └─ Positioned bottom-right
```

**Key Decisions:**
- **Control Room owns state** - single source of truth for watermark configuration
- **localStorage for persistence** - settings survive browser refresh
- **postMessage for sync** - real-time updates to visualizer iframes
- **Base64 encoding** - store logo as data URL in localStorage
- **Matches existing patterns** - reuses overlay/audio postMessage architecture

---

## UI Design

### Location

**Bottom bar, next to Overlay section** - logical grouping of visual customization controls.

### Layout

```
┌──────────────────────────────────────────┐
│ Watermark                                 │
│ [🖼️+] [👁️] [↻]                           │
│                                           │
│ Size    [━━━━━━━●━━] 40px                │
│ Opacity [━━━●━━━━━━] 50%                 │
└──────────────────────────────────────────┘
```

**Buttons:**
- 🖼️+ Upload logo
- 👁️ Toggle visibility
- ↻ Reset to default

**Sliders:**
- Size: 20-100px, default 40px
- Opacity: 20-100%, default 50%

### HTML Structure

```html
<div class="cr-bottom-extra">
  <span class="cr-section-label">Watermark</span>

  <div class="cr-btn-row">
    <button class="cr-btn" id="btn-watermark-upload" title="Upload logo">
      <i data-lucide="image-plus"></i>
    </button>
    <button class="cr-btn" id="btn-watermark-toggle" title="Toggle visibility">
      <i data-lucide="eye"></i>
    </button>
    <button class="cr-btn" id="btn-watermark-reset" title="Reset to default">
      <i data-lucide="rotate-ccw"></i>
    </button>
  </div>

  <input type="file" id="watermark-file-input" accept="image/*" style="display:none">

  <div class="cr-slider-group">
    <label>Size <span id="watermark-size-val">40</span>px</label>
    <input type="range" id="watermark-size" min="20" max="100" value="40" step="5">
  </div>

  <div class="cr-slider-group">
    <label>Opacity <span id="watermark-opacity-val">50</span>%</label>
    <input type="range" id="watermark-opacity" min="20" max="100" value="50" step="5">
  </div>
</div>
```

---

## Data Model

### localStorage Schema

```javascript
{
  watermark_logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0i...',
  watermark_size: 40,
  watermark_opacity: 50,
  watermark_visible: true
}
```

### postMessage Payload

```javascript
{
  type: 'watermark',
  logo: 'data:image/svg+xml;base64,...',  // base64-encoded image
  size: 40,                                // pixels
  opacity: 50,                             // percentage (0-100)
  visible: true                            // boolean
}
```

### State Object (Control Room)

```javascript
let watermarkState = {
  logo: null,      // base64 data URL or null
  size: 40,        // 20-100
  opacity: 50,     // 20-100
  visible: true    // boolean
};
```

---

## Implementation Details

### Control Room (control-room.html)

**1. Initialize on page load:**

```javascript
// Global state
let watermarkState = null;

async function initWatermark() {
  // Load default logo (icon.svg) as base64
  const defaultLogo = await getDefaultLogoBase64();

  // Load from localStorage or use defaults
  watermarkState = {
    logo: localStorage.getItem('watermark_logo') || defaultLogo,
    size: parseInt(localStorage.getItem('watermark_size')) || 40,
    opacity: parseInt(localStorage.getItem('watermark_opacity')) || 50,
    visible: localStorage.getItem('watermark_visible') !== 'false'
  };

  // Sync UI controls to state
  syncWatermarkUI();

  // Send to current visualizer
  sendWatermarkToViz();
}

async function getDefaultLogoBase64() {
  try {
    const response = await fetch('icon.svg');
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error('Failed to load default logo:', err);
    return null;  // Fallback to text in hardware-controls
  }
}

function syncWatermarkUI() {
  document.getElementById('watermark-size').value = watermarkState.size;
  document.getElementById('watermark-size-val').textContent = watermarkState.size;
  document.getElementById('watermark-opacity').value = watermarkState.opacity;
  document.getElementById('watermark-opacity-val').textContent = watermarkState.opacity;

  const toggleBtn = document.getElementById('btn-watermark-toggle');
  const icon = toggleBtn.querySelector('i');
  icon.setAttribute('data-lucide', watermarkState.visible ? 'eye' : 'eye-off');
  lucide.createIcons();  // Re-render Lucide icons
}
```

**2. Upload handler:**

```javascript
function uploadWatermarkLogo(file) {
  // Validate file size (max 500KB)
  if (file.size > 500 * 1024) {
    alert('Logo file too large (max 500KB). Please use a smaller image.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    watermarkState.logo = e.target.result;

    try {
      localStorage.setItem('watermark_logo', watermarkState.logo);
    } catch (err) {
      if (err.name === 'QuotaExceededError') {
        alert('Storage full. Please use a smaller logo or clear browser data.');
        return;
      }
      throw err;
    }

    sendWatermarkToViz();
  };
  reader.readAsDataURL(file);
}
```

**3. Control handlers:**

```javascript
// Size slider
document.getElementById('watermark-size').addEventListener('input', (e) => {
  watermarkState.size = parseInt(e.target.value);
  localStorage.setItem('watermark_size', watermarkState.size);
  document.getElementById('watermark-size-val').textContent = watermarkState.size;
  sendWatermarkToViz();
});

// Opacity slider
document.getElementById('watermark-opacity').addEventListener('input', (e) => {
  watermarkState.opacity = parseInt(e.target.value);
  localStorage.setItem('watermark_opacity', watermarkState.opacity);
  document.getElementById('watermark-opacity-val').textContent = watermarkState.opacity;
  sendWatermarkToViz();
});

// Visibility toggle
document.getElementById('btn-watermark-toggle').addEventListener('click', () => {
  watermarkState.visible = !watermarkState.visible;
  localStorage.setItem('watermark_visible', watermarkState.visible);
  syncWatermarkUI();
  sendWatermarkToViz();
});

// Reset to default
document.getElementById('btn-watermark-reset').addEventListener('click', async () => {
  const defaultLogo = await getDefaultLogoBase64();
  watermarkState.logo = defaultLogo;
  watermarkState.size = 40;
  watermarkState.opacity = 50;
  watermarkState.visible = true;

  localStorage.setItem('watermark_logo', watermarkState.logo);
  localStorage.setItem('watermark_size', watermarkState.size);
  localStorage.setItem('watermark_opacity', watermarkState.opacity);
  localStorage.setItem('watermark_visible', watermarkState.visible);

  syncWatermarkUI();
  sendWatermarkToViz();
});

// Upload button
document.getElementById('btn-watermark-upload').addEventListener('click', () => {
  document.getElementById('watermark-file-input').click();
});

document.getElementById('watermark-file-input').addEventListener('change', (e) => {
  if (e.target.files[0]) {
    uploadWatermarkLogo(e.target.files[0]);
  }
});
```

**4. Send to visualizer:**

```javascript
function sendWatermarkToViz() {
  sendToViz({
    type: 'watermark',
    logo: watermarkState.logo,
    size: watermarkState.size,
    opacity: watermarkState.opacity,
    visible: watermarkState.visible
  });
}
```

**5. On visualizer switch:**

```javascript
// In loadVisualizer() function, after iframe loads:
iframe.addEventListener('load', () => {
  // ... existing code ...

  // Send watermark config to new visualizer
  setTimeout(() => {
    sendWatermarkToViz();
  }, 100);  // Small delay to ensure visualizer is ready
});
```

---

### Visualizer (lib/embed-adapter.js)

**Listen for watermark messages and apply settings:**

```javascript
// Add to existing message listener
window.addEventListener('message', (e) => {
  const msg = e.data;

  // ... existing overlay, audio, etc. handlers ...

  if (msg.type === 'watermark') {
    applyWatermarkSettings(msg);
  }
});

function applyWatermarkSettings(config) {
  // Wait for hardware controls to be initialized
  if (!window.hardware) {
    console.warn('Hardware controls not initialized yet, queueing watermark');
    setTimeout(() => applyWatermarkSettings(config), 100);
    return;
  }

  // Update logo via hardware-controls API
  if (config.logo) {
    hardware.setLogo(config.logo, 'Band Logo');
  }

  // Find watermark element
  const watermark = document.querySelector('.sheep-watermark');
  if (!watermark) {
    console.warn('Watermark element not found');
    return;
  }

  // Apply visibility
  watermark.style.display = config.visible ? 'flex' : 'none';

  // Apply size and opacity
  const img = watermark.querySelector('img');
  if (img) {
    // Image watermark
    img.style.maxHeight = `${config.size}px`;
    img.style.maxWidth = `${config.size * 3}px`;  // Wider max for horizontal logos
    img.style.opacity = `${config.opacity / 100}`;
  } else {
    // Text watermark
    watermark.style.fontSize = `${config.size / 3}px`;
    watermark.style.opacity = `${config.opacity / 100}`;
  }
}
```

---

### CSS Updates (lib/hardware-controls.css)

**Ensure watermark can be dynamically resized:**

```css
.sheep-watermark {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.4);
    text-transform: lowercase;
    letter-spacing: 1px;
    pointer-events: none;
    user-select: none;
    transition: opacity 0.2s ease;  /* Smooth opacity changes */
}

.sheep-watermark img {
    /* Dynamic sizing via inline styles */
    max-height: 40px;      /* Default, overridden by JS */
    max-width: 120px;      /* Default, overridden by JS */
    opacity: 0.5;          /* Default, overridden by JS */
    filter: grayscale(30%);
    transition: opacity 0.2s ease, max-height 0.2s ease;  /* Smooth transitions */
}
```

---

## Integration Points

### 1. Control Room Initialization

**In `control-room.html`, after audio setup:**

```javascript
// After audio initialization
initAudio();

// Initialize watermark system
initWatermark();
```

### 2. Visualizer Switch

**When loading new visualizer, re-send watermark:**

Already handled in `loadVisualizer()` iframe load event.

### 3. Fullscreen/Popout

**Watermark persists automatically:**
- Watermark is part of visualizer DOM
- Hardware bar moves up, watermark stays bottom-right
- No special handling needed

### 4. Controls Popout

**Watermark sliders work in popout window:**
- Event listeners preserved via DOM reparenting
- Sliders functional in both main and popout window

---

## Edge Cases & Error Handling

### 1. No Logo Uploaded Yet

**Behavior:**
- Use `icon.svg` as default logo
- If fetch fails, hardware-controls falls back to text ("sheep-viz")

**Code:**
```javascript
async function getDefaultLogoBase64() {
  try {
    const response = await fetch('icon.svg');
    // ...
  } catch (err) {
    console.error('Failed to load default logo:', err);
    return null;  // hardware-controls will use text fallback
  }
}
```

### 2. Large Images

**Behavior:**
- Reject files > 500KB
- Show user-friendly error message

**Code:**
```javascript
if (file.size > 500 * 1024) {
  alert('Logo file too large (max 500KB). Please use a smaller image.');
  return;
}
```

### 3. localStorage Full

**Behavior:**
- Catch `QuotaExceededError`
- Show user message
- Revert to previous/default logo

**Code:**
```javascript
try {
  localStorage.setItem('watermark_logo', watermarkState.logo);
} catch (err) {
  if (err.name === 'QuotaExceededError') {
    alert('Storage full. Please use a smaller logo or clear browser data.');
    return;
  }
  throw err;
}
```

### 4. Iframe Not Loaded

**Behavior:**
- Queue watermark messages
- Retry after 100ms if hardware not ready

**Code:**
```javascript
function applyWatermarkSettings(config) {
  if (!window.hardware) {
    setTimeout(() => applyWatermarkSettings(config), 100);
    return;
  }
  // ...
}
```

### 5. Visualizer Without Hardware Controls

**Behavior:**
- Silently skip (not all visualizers may use hardware-controls)
- Log warning to console

**Code:**
```javascript
if (!watermark) {
  console.warn('Watermark element not found');
  return;
}
```

---

## Testing Plan

### Manual Testing Checklist

**Basic Functionality:**
- [ ] Default sheep logo appears on first load
- [ ] Upload custom logo - appears in visualizer
- [ ] Adjust size slider - logo resizes smoothly
- [ ] Adjust opacity slider - logo transparency changes
- [ ] Toggle visibility - logo shows/hides
- [ ] Reset button - returns to sheep logo with default settings

**Persistence:**
- [ ] Refresh page - settings persist (logo, size, opacity, visibility)
- [ ] Close browser, reopen - settings persist

**Visualizer Sync:**
- [ ] Switch visualizers - watermark appears with same settings
- [ ] Crossfade transition - watermark visible throughout

**Modes:**
- [ ] Fullscreen mode - watermark visible bottom-right
- [ ] Popout mode - watermark in fullscreen viz window
- [ ] Controls popout - sliders functional in separate window

**Edge Cases:**
- [ ] Upload file > 500KB - shows error message
- [ ] Upload invalid file - shows error
- [ ] Clear localStorage - resets to default
- [ ] No icon.svg available - falls back to text

**Cross-Browser:**
- [ ] Chrome/Edge - all features work
- [ ] Firefox - all features work
- [ ] Safari - all features work

---

## Files to Modify

| File | Changes |
|------|---------|
| `control-room.html` | Add watermark UI section, state management, event handlers, init function |
| `lib/embed-adapter.js` | Add watermark message listener, `applyWatermarkSettings()` function |
| `lib/hardware-controls.css` | Add transition properties for smooth size/opacity changes |

**No changes needed:**
- `lib/hardware-controls.js` - already has `setLogo()` and watermark support
- Individual visualizers - embed-adapter handles everything

---

## Future Enhancements (Not in Scope)

**V2 Features (if requested later):**
- Watermark position control (corners: BL, BR, TL, TR)
- Multiple watermarks (stack logos)
- Animated watermarks (GIF support)
- Watermark presets (save multiple band logos)
- URL-based watermark (query param override)

**Not implementing now:**
- Keep it simple
- YAGNI - build when actually needed

---

## Success Metrics

**Feature is successful if:**
- Musicians can upload their logo in < 30 seconds
- Logo persists across sessions (100% of time)
- No performance impact on visualizers (< 1ms overhead)
- Works in all modes (fullscreen, popout, controls popout)
- Zero crashes or localStorage errors

---

## Summary

**What we're building:**
YouTube-style customizable watermark for sheep-viz that lets musicians brand their visuals with their band logo.

**How it works:**
Control Room provides UI to upload logo and customize appearance. Settings saved to localStorage and synced to visualizers via postMessage. Visualizers update their existing watermark element dynamically.

**Why this approach:**
Reuses existing hardware-controls watermark infrastructure and Control Room postMessage architecture. Simple, robust, musician-friendly.

---

**Design approved:** 2026-02-15
**Next step:** Create implementation plan
