#!/usr/bin/env bash
# Encode frames + voice bus + music into the final MP4.
# Usage: mix.sh <frames_dir> <voice.wav> <music.wav> <total_seconds> <out.mp4>
# Music ducks under the voice (sidechain); result is ~ -14 LUFS, good for Reels/Shorts.
set -euo pipefail
FR=$1; VO=$2; MU=$3; T=$4; OUT=$5
ffmpeg -hide_banner -loglevel error -y -framerate 30 -i "$FR/f%05d.jpg" -i "$VO" -i "$MU" -filter_complex \
 "[1:a]aformat=sample_rates=44100:channel_layouts=stereo,acompressor=threshold=0.1:ratio=3:attack=5:release=120,volume=1.6,asplit=2[v][sc];\
  [2:a]volume=0.32[m];[m][sc]sidechaincompress=threshold=0.04:ratio=5:attack=30:release=500[md];\
  [v][md]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.95:level=disabled,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=44100[a]" \
 -map 0:v -map "[a]" -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r 30 \
 -c:a aac -b:a 192k -ar 44100 -t "$T" -movflags +faststart "$OUT"
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height -of compact=p=0 "$OUT"
ffmpeg -hide_banner -i "$OUT" -af ebur128=framelog=quiet -f null - 2>&1 | grep -E " I:" | head -1
