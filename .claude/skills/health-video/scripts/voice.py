"""Build the voice bus: main narration at 0 s, platform CTA voice at cta_start, both levelled.

Usage: python3 voice.py <out.wav> <total_seconds> <main.mp3> <cta.mp3> <cta_start_seconds>
Each clip is decoded to 44.1 kHz mono, scaled to the same speech RMS (~ -17 dBFS),
placed in a silent array of the full video length, peak-capped at 0.9.
(Do not chain ffmpeg loudnorm + adelay for this: it can silently drop the CTA clip.)
"""
import subprocess, sys, wave
import numpy as np

SR = 44100

def decode(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float64) / 32768.0

def level(x, target_db=-17.0):
    frame = SR // 20
    n = len(x) // frame
    rms = np.sqrt(np.mean(x[: n * frame].reshape(n, frame) ** 2, axis=1))
    speech = rms[rms > np.percentile(rms, 40)]  # ignore pauses
    cur = 20 * np.log10(np.sqrt(np.mean(speech ** 2)) + 1e-9)
    return x * 10 ** ((target_db - cur) / 20)

out, total, main, cta, cta_start = sys.argv[1], float(sys.argv[2]), sys.argv[3], sys.argv[4], float(sys.argv[5])
bus = np.zeros(int(total * SR))
for clip, at in ((level(decode(main)), 0.0), (level(decode(cta)), cta_start)):
    i = int(at * SR)
    seg = clip[: max(0, len(bus) - i)]
    bus[i:i + len(seg)] += seg
    if len(seg) < len(clip):
        print(f"WARNING: clip starting at {at:.2f}s cut by {(len(clip) - len(seg)) / SR:.2f}s; raise total")
peak = np.max(np.abs(bus))
if peak > 0.9:
    bus *= 0.9 / peak
with wave.open(out, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((bus * 32767).astype(np.int16).tobytes())
print(f"voice bus {total:.2f}s, CTA at {cta_start:.2f}s, CTA length {len(decode(cta)) / SR:.2f}s")
