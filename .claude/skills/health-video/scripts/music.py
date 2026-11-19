"""Soft ambient pad + gentle pluck arpeggio, written as a 16-bit stereo WAV."""
import sys, wave
import numpy as np

sr = 44100
dur = float(sys.argv[2]) if len(sys.argv) > 2 else 62.0
n = int(sr * dur)
t = np.arange(n) / sr
out = np.zeros((n, 2))

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)

# I - vi - IV - V in C, 4 s per chord, voiced warmly
chords = [[48, 55, 64, 67, 71], [45, 52, 60, 64, 67], [41, 53, 57, 60, 64], [43, 50, 59, 62, 67]]
bar = 4.0
for k in range(int(dur / bar) + 1):
    notes = chords[k % 4]
    s0 = int(k * bar * sr); s1 = min(n, int((k * bar + bar + 1.2) * sr))
    if s0 >= n: break
    tt = np.arange(s1 - s0) / sr
    env = np.minimum(tt / 1.2, 1) * np.clip((bar + 1.2 - tt) / 1.2, 0, 1)
    for j, m in enumerate(notes):
        f = hz(m)
        sig = 0.6 * np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * f * 2.003 * tt) + 0.12 * np.sin(2 * np.pi * f * 0.5 * tt)
        pan = 0.3 + 0.4 * (j / 4)
        out[s0:s1, 0] += sig * env * (1 - pan) * 0.06
        out[s0:s1, 1] += sig * env * pan * 0.06
    # pluck arpeggio, eighth notes
    arp = [notes[2] + 12, notes[3] + 12, notes[4] + 12, notes[3] + 12]
    for q in range(8):
        st = int((k * bar + q * 0.5) * sr)
        if st >= n: break
        L = min(int(1.4 * sr), n - st)
        tq = np.arange(L) / sr
        f = hz(arp[q % 4])
        pl = (np.sin(2 * np.pi * f * tq) + 0.3 * np.sin(2 * np.pi * 2 * f * tq)) * np.exp(-tq * 4.5)
        pan = 0.25 if q % 2 else 0.75
        out[st:st + L, 0] += pl * (1 - pan) * 0.05
        out[st:st + L, 1] += pl * pan * 0.05

# simple stereo delay for space
d = int(0.32 * sr)
wet = np.zeros_like(out); wet[d:] = out[:-d] * 0.35
out = out + wet[:, ::-1]
# fade in/out
fade = np.minimum(t / 1.5, 1) * np.clip((dur - t) / 2.5, 0, 1)
out *= fade[:, None]
out /= np.max(np.abs(out)) + 1e-9
out *= 0.8
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print("music", dur)
