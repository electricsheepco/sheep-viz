# YouTube-Style Watermark Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add customizable watermark (band logo) to sheep-viz Control Room with upload UI, size/opacity controls, and localStorage persistence.

**Architecture:** Control Room owns watermark state (logo, size, opacity, visibility) and sends config via postMessage to visualizer iframes. Visualizers' embed-adapter listens and updates hardware-controls watermark element dynamically. Default logo is sheep icon.svg encoded as base64.

**Tech Stack:** Vanilla JavaScript, localStorage, postMessage API, FileReader API, Lucide icons

---

## Task 1: Add Watermark UI to Control Room

**Files:**
- Modify: `control-room.html` (bottom bar section, around line 810-820)

**Step 1: Add watermark HTML section**

Find the Overlay section in the bottom bar (search for `<div class="cr-bottom-extra">` with "Overlay" label).

After the Overlay section closing `</div>`, add a section divider and watermark section:

```html
<!-- After Overlay section -->
<div class="cr-section-divider"></div>

<!-- Watermark Section -->
<div class="cr-bottom-extra">
  <span class="cr-section-label">Watermark</span>

  <div class="cr-btn-row">
    <button class="cr-btn" id="btn-watermark-upload" data-tip="Upload logo">
      <i data-lucide="image-plus"></i>
    </button>
    <button class="cr-btn" id="btn-watermark-toggle" data-tip="Toggle visibility">
      <i data-lucide="eye"></i>
    </button>
    <button class="cr-btn" id="btn-watermark-reset" data-tip="Reset to default">
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

**Step 2: Verify UI renders**

Open `control-room.html` in browser, check that:
- Watermark section appears in bottom bar after Overlay
- 3 buttons render with correct Lucide icons
- 2 sliders render with labels showing default values (40px, 50%)

**Step 3: Commit**

```bash
git add control-room.html
git commit -m "feat: add watermark UI section to Control Room bottom bar"
```

---

## Task 2: Add Watermark State Management

**Files:**
- Modify: `control-room.html` (JavaScript section, before existing `initAudio()` function)

**Step 1: Add global watermark state**

Near the top of the `<script>` section (after other global variables like `currentViz`), add:

```javascript
// ═══════════════════════════════════════════════════════════════
// WATERMARK STATE
// ═══════════════════════════════════════════════════════════════

let watermarkState = null;
```

**Step 2: Add helper function to load default logo**

Before `initWatermark()`, add:

```javascript
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
```

**Step 3: Add initWatermark function**

```javascript
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
```

**Step 4: Add syncWatermarkUI function**

```javascript
function syncWatermarkUI() {
  const sizeSlider = $id('watermark-size');
  const sizeVal = $id('watermark-size-val');
  const opacitySlider = $id('watermark-opacity');
  const opacityVal = $id('watermark-opacity-val');
  const toggleBtn = $id('btn-watermark-toggle');

  if (!sizeSlider || !sizeVal || !opacitySlider || !opacityVal || !toggleBtn) {
    console.warn('Watermark UI elements not found');
    return;
  }

  sizeSlider.value = watermarkState.size;
  sizeVal.textContent = watermarkState.size;
  opacitySlider.value = watermarkState.opacity;
  opacityVal.textContent = watermarkState.opacity;

  const icon = toggleBtn.querySelector('i');
  icon.setAttribute('data-lucide', watermarkState.visible ? 'eye' : 'eye-off');
  lucide.createIcons();  // Re-render Lucide icons
}
```

**Step 5: Add sendWatermarkToViz function**

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

**Step 6: Call initWatermark on page load**

Find the existing init code (look for `initAudio()` or similar). After audio initialization, add:

```javascript
// After initAudio() or in DOMContentLoaded
initWatermark();
```

**Step 7: Test initialization**

Open browser console, refresh page, verify:
- `watermarkState` object is defined
- Default logo loads (check Network tab for `icon.svg`)
- No console errors

**Step 8: Commit**

```bash
git add control-room.html
git commit -m "feat: add watermark state management and initialization"
```

---

## Task 3: Add Upload Handler

**Files:**
- Modify: `control-room.html` (add function after `initWatermark`)

**Step 1: Add uploadWatermarkLogo function**

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

**Step 2: Add event listener for upload button**

Find the section where other event listeners are attached (search for `document.getElementById('btn-overlay')`).

Add after overlay listeners:

```javascript
// Watermark upload
$id('btn-watermark-upload').addEventListener('click', () => {
  $id('watermark-file-input').click();
});

$id('watermark-file-input').addEventListener('change', (e) => {
  if (e.target.files[0]) {
    uploadWatermarkLogo(e.target.files[0]);
  }
});
```

**Step 3: Test upload**

- Open Control Room
- Click upload button, select an image
- Check browser console: no errors
- Check localStorage (DevTools > Application > Local Storage): `watermark_logo` key exists with base64 data

**Step 4: Commit**

```bash
git add control-room.html
git commit -m "feat: add watermark logo upload handler with size validation"
```

---

## Task 4: Add Slider Handlers

**Files:**
- Modify: `control-room.html` (add after upload listeners)

**Step 1: Add size slider handler**

```javascript
// Watermark size slider
$id('watermark-size').addEventListener('input', (e) => {
  watermarkState.size = parseInt(e.target.value);
  localStorage.setItem('watermark_size', watermarkState.size);
  $id('watermark-size-val').textContent = watermarkState.size;
  sendWatermarkToViz();
});
```

**Step 2: Add opacity slider handler**

```javascript
// Watermark opacity slider
$id('watermark-opacity').addEventListener('input', (e) => {
  watermarkState.opacity = parseInt(e.target.value);
  localStorage.setItem('watermark_opacity', watermarkState.opacity);
  $id('watermark-opacity-val').textContent = watermarkState.opacity;
  sendWatermarkToViz();
});
```

**Step 3: Test sliders**

- Move size slider, verify value updates (label shows new value)
- Move opacity slider, verify value updates
- Refresh page, verify values persist

**Step 4: Commit**

```bash
git add control-room.html
git commit -m "feat: add watermark size and opacity slider handlers"
```

---

## Task 5: Add Toggle and Reset Handlers

**Files:**
- Modify: `control-room.html` (add after slider handlers)

**Step 1: Add visibility toggle handler**

```javascript
// Watermark visibility toggle
$id('btn-watermark-toggle').addEventListener('click', () => {
  watermarkState.visible = !watermarkState.visible;
  localStorage.setItem('watermark_visible', watermarkState.visible);
  syncWatermarkUI();
  sendWatermarkToViz();
});
```

**Step 2: Add reset handler**

```javascript
// Watermark reset to default
$id('btn-watermark-reset').addEventListener('click', async () => {
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
```

**Step 3: Test toggle and reset**

- Click eye icon, verify icon changes (eye ↔ eye-off)
- Click reset, verify sliders return to 40px/50%, icon to sheep logo
- Refresh page, verify state persists

**Step 4: Commit**

```bash
git add control-room.html
git commit -m "feat: add watermark visibility toggle and reset handlers"
```

---

## Task 6: Send Watermark on Visualizer Switch

**Files:**
- Modify: `control-room.html` (find `loadVisualizer` function)

**Step 1: Find iframe load event in loadVisualizer**

Search for `iframe.addEventListener('load'` in `loadVisualizer()` function.

**Step 2: Add watermark send after existing postMessage calls**

After the existing `sendToViz` calls for audio, overlay, etc., add:

```javascript
// Send watermark config to new visualizer
setTimeout(() => {
  sendWatermarkToViz();
}, 100);  // Small delay to ensure visualizer is ready
```

**Step 3: Test visualizer switching**

- Upload custom logo, adjust size/opacity
- Switch visualizers in Control Room
- Verify watermark appears in new visualizer with same settings

**Step 4: Commit**

```bash
git add control-room.html
git commit -m "feat: send watermark config when switching visualizers"
```

---

## Task 7: Add Watermark Listener to Embed Adapter

**Files:**
- Modify: `lib/embed-adapter.js` (find existing message listener)

**Step 1: Find existing message listener**

Search for `window.addEventListener('message'` in embed-adapter.js.

**Step 2: Add watermark case to message handler**

Inside the message event listener, after existing cases for `overlay`, `audio`, etc., add:

```javascript
if (msg.type === 'watermark') {
  applyWatermarkSettings(msg);
}
```

**Step 3: Add applyWatermarkSettings function**

After the message listener, add:

```javascript
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

**Step 4: Test watermark display**

- Open any visualizer directly (e.g., `visualizers/starfield.html`)
- Should show default sheep logo watermark
- Open Control Room, load same visualizer
- Upload custom logo, adjust size/opacity
- Verify watermark updates in visualizer iframe

**Step 5: Commit**

```bash
git add lib/embed-adapter.js
git commit -m "feat: add watermark message listener to embed adapter"
```

---

## Task 8: Add CSS Transitions

**Files:**
- Modify: `lib/hardware-controls.css` (find `.sheep-watermark` rules)

**Step 1: Update .sheep-watermark CSS**

Find the `.sheep-watermark` rule and add transitions:

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
    transition: opacity 0.2s ease;  /* ADD THIS */
}
```

**Step 2: Update .sheep-watermark img CSS**

Find `.sheep-watermark img` rule and add transitions:

```css
.sheep-watermark img {
    max-height: 40px;      /* Dynamic, overridden by JS */
    max-width: 120px;      /* Dynamic, overridden by JS */
    opacity: 0.5;          /* Dynamic, overridden by JS */
    filter: grayscale(30%);
    transition: opacity 0.2s ease, max-height 0.2s ease, max-width 0.2s ease;  /* ADD THIS */
}
```

**Step 3: Test smooth transitions**

- Adjust size slider, verify smooth size change (not instant)
- Adjust opacity slider, verify smooth fade
- Toggle visibility, verify smooth fade in/out

**Step 4: Commit**

```bash
git add lib/hardware-controls.css
git commit -m "feat: add smooth transitions for watermark size and opacity"
```

---

## Task 9: Integration Testing

**Files:**
- None (manual testing)

**Step 1: Test full workflow**

**Upload custom logo:**
- [ ] Click upload button
- [ ] Select image file (< 500KB)
- [ ] Verify logo appears in visualizer
- [ ] Verify logo stored in localStorage

**Adjust controls:**
- [ ] Move size slider (20-100px) - logo resizes
- [ ] Move opacity slider (20-100%) - logo fades
- [ ] Click eye icon - logo toggles visibility
- [ ] Transitions are smooth (not instant)

**Persistence:**
- [ ] Refresh page - settings persist
- [ ] All controls show saved values

**Visualizer sync:**
- [ ] Switch visualizers - watermark appears in all
- [ ] Settings stay consistent across visualizers

**Modes:**
- [ ] Fullscreen - watermark visible bottom-right
- [ ] Popout - watermark in fullscreen viz window
- [ ] Controls popout - sliders work in popout

**Reset:**
- [ ] Upload custom logo, adjust settings
- [ ] Click reset button
- [ ] Verify returns to sheep logo, 40px, 50%, visible

**Edge cases:**
- [ ] Upload file > 500KB - shows error message
- [ ] Upload invalid file (not image) - shows error
- [ ] Large localStorage - handles QuotaExceededError

**Step 2: Test on multiple visualizers**

Test with at least 3 visualizers:
- [ ] Starfield
- [ ] Fluid Flow
- [ ] Control Room iframe

**Step 3: Cross-browser testing**

- [ ] Chrome/Edge - all features work
- [ ] Firefox - all features work
- [ ] Safari - all features work

**Step 4: Document any issues**

If any tests fail, create bug fix commits before final commit.

---

## Task 10: Final Polish and Documentation

**Files:**
- Modify: `control-room.html` (comments)
- Create: Session notes (optional)

**Step 1: Add code comments**

Ensure watermark section has clear comments:

```javascript
// ═══════════════════════════════════════════════════════════════
// WATERMARK SYSTEM
// Upload custom logo, adjust size/opacity, toggle visibility
// Syncs to all visualizers via postMessage
// ═══════════════════════════════════════════════════════════════
```

**Step 2: Final verification**

- All 4 localStorage keys exist when configured
- No console errors
- No memory leaks (watermark updates don't accumulate listeners)
- postMessage only sent when iframe ready

**Step 3: Create session notes (optional)**

Create `docs/sessions/2026-02-15-watermark-feature.md`:

```markdown
# Session: YouTube-Style Watermark Feature

**Date:** 2026-02-15
**Feature:** Customizable band logo watermark

## Implementation

Added watermark upload UI to Control Room bottom bar with:
- Upload button (file picker)
- Visibility toggle (eye icon)
- Size slider (20-100px)
- Opacity slider (20-100%)
- Reset button (back to sheep logo)

Settings persist via localStorage and sync to visualizers via postMessage.
embed-adapter.js listens for watermark messages and updates hardware-controls dynamically.

## Files Modified

- `control-room.html` - Added UI, state management, event handlers
- `lib/embed-adapter.js` - Added watermark message listener
- `lib/hardware-controls.css` - Added smooth transitions

## Testing

All features tested in Chrome, Firefox, Safari. Works in fullscreen, popout, and controls popout modes.
```

**Step 4: Final commit**

```bash
git add .
git commit -m "docs: add watermark feature session notes"
```

---

## Summary

**Tasks completed:**
1. ✅ Added watermark UI to Control Room bottom bar
2. ✅ Implemented state management and localStorage persistence
3. ✅ Added upload handler with file size validation
4. ✅ Implemented size and opacity sliders
5. ✅ Added visibility toggle and reset functionality
6. ✅ Integrated with visualizer switching
7. ✅ Updated embed-adapter to listen for watermark messages
8. ✅ Added smooth CSS transitions
9. ✅ Comprehensive integration testing
10. ✅ Final polish and documentation

**Feature complete:** Customizable YouTube-style watermark with full Control Room integration.

---

## Troubleshooting

**Watermark doesn't appear:**
- Check browser console for errors
- Verify `hardware-controls.js` loaded
- Verify `.sheep-watermark` element exists in DOM
- Check `watermarkState` is initialized

**Watermark doesn't persist:**
- Check localStorage in DevTools
- Verify no QuotaExceededError in console
- Try smaller logo file

**Watermark doesn't update:**
- Verify `sendToViz()` is called
- Check iframe is loaded before sending message
- Verify `applyWatermarkSettings()` is executed

**Sliders don't work:**
- Check event listeners are attached
- Verify `$id()` helper finds elements (check main doc + popout)
- Check console for errors

---

**Implementation plan complete.**
