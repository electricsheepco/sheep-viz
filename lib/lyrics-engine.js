/**
 * LyricsEngine - Parse, sync, and manage lyrics for sheep-viz Control Room
 *
 * Supports:
 *   - LRC format ([mm:ss.xx] text)
 *   - Plain text (one line per line, no timestamps)
 *   - Tap-sync: assign timestamps interactively
 *   - Export to .lrc format
 */

class LyricsEngine {
  constructor() {
    this._lines = [];       // [{ time: number|null, text: string }]
    this._tapIndex = 0;
    this._tapSyncing = false;
    this._source = null;    // 'lrc' | 'plain' | null
  }

  /**
   * Parse LRC format text.
   * Handles [mm:ss.xx] and [mm:ss.xxx] timestamps.
   * Skips metadata tags like [ar:], [ti:], [al:], etc.
   */
  parseLRC(text) {
    this._lines = [];
    this._source = 'lrc';
    const metaTags = ['ar', 'ti', 'al', 'au', 'by', 'offset', 're', 've', 'length'];

    const lines = text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Match [mm:ss.xx] or [mm:ss.xxx] or [mm:ss]
      const match = trimmed.match(/^\[(\d{1,3}):(\d{2})(?:\.(\d{2,3}))?\]\s*(.*)/);
      if (match) {
        const min = parseInt(match[1], 10);
        const sec = parseInt(match[2], 10);
        const ms = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0;
        const time = min * 60 + sec + ms / 1000;
        const text = match[4];
        if (text) {
          this._lines.push({ time, text });
        }
        continue;
      }

      // Skip metadata tags
      const metaMatch = trimmed.match(/^\[(\w+):(.*)\]$/);
      if (metaMatch && metaTags.includes(metaMatch[1].toLowerCase())) {
        continue;
      }

      // Non-timestamp line with text — treat as unsynced
      if (trimmed && !trimmed.startsWith('[')) {
        this._lines.push({ time: null, text: trimmed });
      }
    }

    // Sort by time (unsynced lines at start)
    this._lines.sort((a, b) => {
      if (a.time === null && b.time === null) return 0;
      if (a.time === null) return -1;
      if (b.time === null) return 1;
      return a.time - b.time;
    });

    this._tapIndex = 0;
    this._tapSyncing = false;
  }

  /**
   * Load plain text lyrics (one line per line, no timestamps).
   */
  loadPlainText(text) {
    this._lines = [];
    this._source = 'plain';

    const lines = text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        this._lines.push({ time: null, text: trimmed });
      }
    }

    this._tapIndex = 0;
    this._tapSyncing = false;
  }

  /**
   * Auto-detect format and load.
   * If any line matches LRC timestamp pattern, parse as LRC.
   */
  load(text) {
    if (/\[\d{1,3}:\d{2}/.test(text)) {
      this.parseLRC(text);
    } else {
      this.loadPlainText(text);
    }
  }

  /**
   * Enter tap-sync mode. Resets all timestamps.
   */
  startTapSync() {
    this._tapSyncing = true;
    this._tapIndex = 0;
    for (const line of this._lines) {
      line.time = null;
    }
  }

  /**
   * Mark the current unsynced line's timestamp.
   * Returns the index that was just synced, or -1 if done.
   */
  tapLine(currentTime) {
    if (!this._tapSyncing || this._tapIndex >= this._lines.length) return -1;

    this._lines[this._tapIndex].time = currentTime;
    const synced = this._tapIndex;
    this._tapIndex++;

    if (this._tapIndex >= this._lines.length) {
      this._tapSyncing = false;
    }

    return synced;
  }

  /** Whether tap-sync is active */
  get isTapSyncing() {
    return this._tapSyncing;
  }

  /** Current tap-sync index */
  get tapIndex() {
    return this._tapIndex;
  }

  /**
   * Get the current lyrics state for a given playback time.
   * Returns { prev, current, next, currentIndex, progress }
   */
  getState(currentTime) {
    if (this._lines.length === 0) return null;

    // Find the current line: last line where time <= currentTime
    let currentIndex = -1;
    for (let i = 0; i < this._lines.length; i++) {
      if (this._lines[i].time !== null && this._lines[i].time <= currentTime) {
        currentIndex = i;
      }
    }

    if (currentIndex === -1) {
      // Before first synced line
      const firstSynced = this._lines.findIndex(l => l.time !== null);
      return {
        prev: null,
        current: null,
        next: firstSynced >= 0 ? this._lines[firstSynced].text : this._lines[0].text,
        currentIndex: -1,
        progress: 0
      };
    }

    const current = this._lines[currentIndex];
    const prev = currentIndex > 0 ? this._lines[currentIndex - 1] : null;
    const next = currentIndex < this._lines.length - 1 ? this._lines[currentIndex + 1] : null;

    // Calculate progress through current line
    let progress = 0;
    if (next && next.time !== null && current.time !== null) {
      const duration = next.time - current.time;
      if (duration > 0) {
        progress = Math.min(1, (currentTime - current.time) / duration);
      }
    } else {
      // Last line or no next timestamp — estimate 5s duration
      if (current.time !== null) {
        progress = Math.min(1, (currentTime - current.time) / 5);
      }
    }

    return {
      prev: prev ? prev.text : null,
      current: current.text,
      next: next ? next.text : null,
      currentIndex,
      progress
    };
  }

  /**
   * Export lyrics as LRC text.
   */
  exportLRC() {
    const lines = [];
    for (const line of this._lines) {
      if (line.time !== null) {
        const min = Math.floor(line.time / 60);
        const sec = Math.floor(line.time % 60);
        const ms = Math.floor((line.time % 1) * 100);
        lines.push(`[${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(ms).padStart(2, '0')}] ${line.text}`);
      } else {
        lines.push(line.text);
      }
    }
    return lines.join('\n');
  }

  /** Clear all lyrics */
  clear() {
    this._lines = [];
    this._tapIndex = 0;
    this._tapSyncing = false;
    this._source = null;
  }

  /** Whether any lyrics are loaded */
  get hasLyrics() {
    return this._lines.length > 0;
  }

  /** All lines */
  get allLines() {
    return this._lines;
  }

  /** Whether all lines have timestamps */
  get isFullySynced() {
    return this._lines.length > 0 && this._lines.every(l => l.time !== null);
  }
}

// Make available globally
window.LyricsEngine = LyricsEngine;
