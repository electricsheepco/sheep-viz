#!/bin/bash
#
# Full render pipeline: Audio analysis → Frame render → FFmpeg compile
# Usage: ./render-video.sh input.mp3 output.mp4 [options]
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Defaults
FPS=60
WIDTH=1920
HEIGHT=1080
SEED=42
CRF=18
OVERLAY=""
OVERLAY_SIZE=20
OVERLAY_POS="bottom-right"
PRESET=""

# Parse args
if [ $# -lt 2 ]; then
    echo "Usage: $0 <input-audio> <output-video> [options]"
    echo ""
    echo "Options:"
    echo "  --fps 60              Frame rate"
    echo "  --res <preset>        Resolution preset (see below)"
    echo "  --width 1920          Video width (custom)"
    echo "  --height 1080         Video height (custom)"
    echo ""
    echo "Resolution presets:"
    echo "  youtube, hd           1920x1080 (horizontal)"
    echo "  youtube2k, 2k         2560x1440"
    echo "  youtube4k, 4k         3840x2160"
    echo "  tiktok, reels, shorts 1080x1920 (vertical)"
    echo "  instagram, square     1080x1080"
    echo "  portrait              1080x1350"
    echo "  --seed 42             Random seed"
    echo "  --crf 18              Video quality (lower = better, 15-23 recommended)"
    echo "  --preset file.json    Load visualizer preset"
    echo "  --overlay logo.png    Overlay image (logo, album art)"
    echo "  --overlay-size 20     Overlay size as % of canvas"
    echo "  --overlay-pos         Position: center, bottom-right, bottom-left, top-right, top-left"
    echo ""
    echo "Example:"
    echo "  $0 song.mp3 video.mp4 --preset presets/neon.json --overlay logo.png"
    exit 1
fi

INPUT_AUDIO="$1"
OUTPUT_VIDEO="$2"
shift 2

while [[ $# -gt 0 ]]; do
    case $1 in
        --fps) FPS="$2"; shift 2 ;;
        --res)
            case $2 in
                youtube|hd) WIDTH=1920; HEIGHT=1080 ;;
                youtube2k|2k) WIDTH=2560; HEIGHT=1440 ;;
                youtube4k|4k) WIDTH=3840; HEIGHT=2160 ;;
                tiktok|reels|shorts) WIDTH=1080; HEIGHT=1920 ;;
                instagram|square) WIDTH=1080; HEIGHT=1080 ;;
                portrait) WIDTH=1080; HEIGHT=1350 ;;
                *) echo "Unknown resolution preset: $2"; exit 1 ;;
            esac
            shift 2 ;;
        --width) WIDTH="$2"; shift 2 ;;
        --height) HEIGHT="$2"; shift 2 ;;
        --seed) SEED="$2"; shift 2 ;;
        --crf) CRF="$2"; shift 2 ;;
        --preset) PRESET="$2"; shift 2 ;;
        --overlay) OVERLAY="$2"; shift 2 ;;
        --overlay-size) OVERLAY_SIZE="$2"; shift 2 ;;
        --overlay-pos) OVERLAY_POS="$2"; shift 2 ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# Validate input
if [ ! -f "$INPUT_AUDIO" ]; then
    echo -e "${RED}Error: Audio file not found: $INPUT_AUDIO${NC}"
    exit 1
fi

# Setup paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORK_DIR=$(mktemp -d)
AUDIO_JSON="$WORK_DIR/audio-data.json"
FRAMES_DIR="$WORK_DIR/frames"

echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}  Sheep Video Render Pipeline${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
echo "Input:  $INPUT_AUDIO"
echo "Output: $OUTPUT_VIDEO"
echo "Size:   ${WIDTH}x${HEIGHT} @ ${FPS}fps"
echo "Seed:   $SEED"
echo "Work:   $WORK_DIR"
echo ""

# Check dependencies
echo -e "${YELLOW}Checking dependencies...${NC}"
command -v node >/dev/null 2>&1 || { echo -e "${RED}Node.js required${NC}"; exit 1; }
command -v ffmpeg >/dev/null 2>&1 || { echo -e "${RED}FFmpeg required${NC}"; exit 1; }

# Install npm deps if needed
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    cd "$SCRIPT_DIR"
    npm install
    cd -
fi

# Step 1: Analyze audio
echo ""
echo -e "${YELLOW}Step 1/3: Analyzing audio...${NC}"
node "$SCRIPT_DIR/analyze-audio.js" "$INPUT_AUDIO" "$AUDIO_JSON" "$FPS"

# Step 2: Render frames
echo ""
echo -e "${YELLOW}Step 2/3: Rendering frames...${NC}"
mkdir -p "$FRAMES_DIR"

RENDER_ARGS="--width $WIDTH --height $HEIGHT --seed $SEED"
if [ -n "$PRESET" ] && [ -f "$PRESET" ]; then
    RENDER_ARGS="$RENDER_ARGS --preset $PRESET"
fi
if [ -n "$OVERLAY" ] && [ -f "$OVERLAY" ]; then
    RENDER_ARGS="$RENDER_ARGS --overlay $OVERLAY --overlay-size $OVERLAY_SIZE --overlay-pos $OVERLAY_POS"
fi

node "$SCRIPT_DIR/render-frames.js" "$AUDIO_JSON" "$FRAMES_DIR" $RENDER_ARGS

# Step 3: Compile with FFmpeg
echo ""
echo -e "${YELLOW}Step 3/3: Compiling video...${NC}"
ffmpeg -y \
    -framerate "$FPS" \
    -i "$FRAMES_DIR/frame_%06d.png" \
    -i "$INPUT_AUDIO" \
    -c:v libx264 \
    -crf "$CRF" \
    -preset slow \
    -pix_fmt yuv420p \
    -c:a aac \
    -b:a 320k \
    -shortest \
    "$OUTPUT_VIDEO"

# Cleanup
echo ""
echo -e "${YELLOW}Cleaning up...${NC}"
rm -rf "$WORK_DIR"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}  Done! Output: $OUTPUT_VIDEO${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
