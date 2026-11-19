---
name: health-video
description: Use when the user says "হেলথ ভিডিও" / "health video" (often followed by a health topic, sometimes with their own images). Research the topic from current, reliable sources and make two Bengali 9:16 motion-graphics reels (Facebook + YouTube Shorts) in the fixed Medinest Digital style, each ending with its platform call-to-action.
---

# হেলথ ভিডিও (keyword: "হেলথ ভিডিও" / "health video")

The user writes in Bengali and lives in West Bengal, India. Reply in Bengali. They give only a topic
(and sometimes images, with notes on where they go). Everything below is the fixed house style and is
ALWAYS done without being asked — do not ask about style, length, voice, music or CTAs. Check your own
work before sending; the user should not have to report the same problem twice.

Reference look: `assets/template.html` (a finished thyroid reel). Every new video is that page with new
scenes for the new topic.

## Always, in every video (non-negotiable)
1. **Two MP4s**, identical except the CTA: `<topic>_health_facebook.mp4` and `<topic>_health_youtube.mp4`
   (topic in English, lowercase, e.g. `thyroid`). 1080x1920, 30 fps, H.264 CRF 18, AAC 192k, ~ -14 LUFS.
2. **Bengali voiceover** (ElevenLabs) synced word-by-word with the on-screen animation.
3. **Platform CTA, on screen AND as voice, at the end** — the user will never repeat these lines:
   - Facebook voice: "ভিডিওটি ভালো লাগলে লাইক, কমেন্ট ও শেয়ার করুন। এবং এরকম আরও ভিডিও পেতে পেজটি ফলো করুন।"
   - YouTube voice: "ভিডিওটি ভালো লাগলে লাইক, কমেন্ট ও শেয়ার করুন। এবং এরকম আরও ভিডিও পেতে চ্যানেলটি সাবস্ক্রাইব করুন।"
   - On-screen card text is built into the template (`PLATFORM` = `facebook` → "ফলো করুন" button,
     `youtube` → "সাবস্ক্রাইব করুন" button). Never draw real Facebook/YouTube logos.
4. **Medinest Digital header** (green rounded square with a plus + "Medinest **Digital**") top-left on
   every frame, the thin progress bar on top, and the footer note "শুধু সচেতনতার জন্য। চিকিৎসার জন্য
   ডাক্তারের পরামর্শ নিন।" in the last scene. Soft background music under everything, ducking under the voice.

## Step 1 — Research (current, reliable)
- Use WebSearch (mode "extended" for medical facts, guidelines and statistics; send several searches in
  one turn). Prefer, in this order: Indian sources (ICMR, NFHS-5/6, AIIMS, Indian specialist societies,
  MoHFW), then WHO, NHS, NIH/NIDDK/CDC, Mayo Clinic, Cleveland Clinic, peer-reviewed studies. Check the
  date: use the latest guideline or figure you can find, and note the year.
- Every number on screen must come from a source you actually found in this session. Prefer an
  India-specific figure (say the region if it is one state or city). If no reliable figure exists, drop
  the stat scene's number rather than inventing one.
- No drug doses, no brand names unless asked, never promise a cure, no fear-mongering. Point to the right
  test and the right kind of doctor. Emergency signs → "নিকটস্থ হাসপাতালে যান / ১১২ নম্বরে কল করুন".
- West Bengal wording: জল (not পানি), ডাক্তারবাবু, রক্তপরীক্ষা, ₹. Short, everyday sentences.
- Keep a list of the sources (title + site + year) to give the user at the end.

## Step 2 — Script (≈ 60 s main voice + CTA)
- About 110–130 Bengali words for the main voice → ~55–62 s with Rakib. 7–9 scenes, 12–20 words each.
- Default arc (adapt to the topic): hook with 3 relatable symptoms/questions → what it is (simple
  anatomy/mechanism) → type/cause A → type/cause B (or risk factors) → India statistic → the test that
  finds it → treatment / prevention habits (3 checklist items) → closing line "আজই … করান / ডাক্তার দেখান".
- Write English test names as they are said (TSH, HbA1c, ECG). Use eleven_v4 tags sparingly:
  `[warmly]` at the start and the closing line, `[pause]` at the end of every scene (it creates the
  scene gaps), `[short pause]` inside the hook.
- The CTA lines are NOT in the main script — they are two separate generations (below).

## Step 3 — Voice (ElevenLabs)
- Voice "Rakib — Deep, Confident" `VizHiwkPO7hXc967v4tE`, model `eleven_v4`, `generations_count: 1`.
- `creative_create_flow` named "হেলথ ভিডিও – <topic>", then in that flow: (1) main script,
  (2) Facebook CTA voice, (3) YouTube CTA voice. Never re-run a generation to retry (each costs credits).
  Tell the user the credits used (main ≈ 850 credits per minute; each CTA ≈ 80).
- Getting the MP3s here: this sandbox's network normally blocks `elevenlabsusercontent.com`. First try
  `curl` on the `content_url`; if it is refused, give the user the flow link and ask them to download the
  three MP3s and upload them in the chat. Do not propose network changes unless the user asks.
- While waiting, build and preview the scenes with estimated timings (proportional to word counts).

## Step 4 — Exact timing
- Word timestamps: `creative_attach_reference_file` with `url` = the main voice `content_url` and the
  same `flow_id`, then `creative_transcribe_audio` (`eleven_scribe_v1`, `connect_from` = that node), then
  `creative_get_flow_run_status` → `transcripts[0].words` (start/end per word). This cost ~830 credits for
  60 s — mention it. (If the user wants to save credits: `ffmpeg -af silencedetect=noise=-30dB:d=0.18`
  on the MP3 + the script's scene order gives scene cuts, but element cues are then approximate.)
- Check the uploaded MP3 matches the transcript (silences line up with gaps between words; offset 0).
- Scene k starts at (first word of scene k).start − 0.04 s; scene 1 starts at 0.
- Inside each scene, every element pops in at the moment its word is spoken (local time = word.start −
  scene start, a few hundredths early). This word-sync is the signature of the style — do it for every
  chip, list item, number, label and heading.
- CTA: `cta_start` = main voice end (last word end) + 0.4 s. In the last scene `CTA_AT` = cta_start −
  last scene start. `total` = cta_start + CTA clip length + 2.5 s (round up to 0.5). The last scene's
  end = total. Same `total` for both platforms (use the longer CTA clip).

## Step 5 — Build the page
Work in the scratchpad: copy `assets/template.html` to `<work>/page.html` and change only what the
template comment says:
- Scenes `s1..sN` markup + the `S{}` cue functions + one `TINTS` entry per scene + the `scenes`/`S`
  index list (`scenes = [1..N]`). Reuse the template's components: `.chip` row, `.list` + `.item` with
  coloured `.dot`, `.tag` pill (cold blue = low/less, hot red = high/more), people grid for "১০ জনে ১ জন",
  comparison bars, gauge with needle, test tube filling, checklist with drawn ticks, big glowing organ.
- Replace the `#thy` symbol with a simple, original SVG of the topic's organ or symbol (heart, kidneys,
  lungs, pancreas, liver, blood drop, bone, tooth, eye…): flat shapes, the coral→pink `#gland` gradient,
  one white highlight stroke. Never copy third-party artwork.
- **User images:** copy them next to `page.html`, show them with `<img>` inside a rounded card
  (border-radius 28px, 4px border rgba(255,255,255,.15), object-fit cover) in the scene the user named,
  popping in on the matching word. If they gave no placement, use them in the scene they fit best and say where.
- Keep the last scene's layout: organ on top, small lead line, big 2-line action headline, CTA card,
  footer note. Text must stay between y≈220 and y≈1720 (Reels/Shorts UI covers the edges).
- Fonts load from Google Fonts (Baloo Da 2 for headings, Hind Siliguri for text); Bengali digits (০-৯)
  on screen.

## Step 6 — Check, render, mix
Scripts are in `scripts/` (run with absolute paths; Playwright and ffmpeg are preinstalled):
```bash
SK=<this skill dir>; W=<work dir>
# config per platform
echo '{"scenes":[[0,8.0],...,[53.58,68.5]],"total":68.5,"platform":"facebook","ctaAt":6.62,"fps":30}' > $W/fb.json
# 1. preview at each scene's key words → contact sheet → LOOK at it (fonts loaded, no overlap/clipping,
#    every cue visible at its word, CTA card correct). Fix and re-check.
node $SK/scripts/preview.js $W/page.html $W/fb.json $W/prev 2.0,7.6,...
# 2. frames, 4 parallel workers (≈45 s per minute of video)
N=$(python3 -c "import math;print(math.ceil(68.5*30))"); C=$(( (N+3)/4 ))
for k in 0 1 2 3; do node $SK/scripts/render.js $W/page.html $W/fb.json $W/fb_frames $((k*C)) $(((k+1)*C)) & done; wait
# 3. audio: voice bus (main at 0 + platform CTA at cta_start) and music of exactly `total`
python3 $SK/scripts/voice.py $W/fb_voice.wav 68.5 $W/main.mp3 $W/cta_facebook.mp3 60.2
python3 $SK/scripts/music.py $W/music.wav 68.5
# 4. encode
bash $SK/scripts/mix.sh $W/fb_frames $W/fb_voice.wav $W/music.wav 68.5 $W/<topic>_health_facebook.mp4
```
Repeat 2–4 for YouTube with `"platform":"youtube"` and `cta_youtube.mp3` (only the last scene differs;
re-render all frames anyway, it is fast).

Before sending, for BOTH files: ffprobe 1080x1920, 30 fps, h264+aac, duration == total; loudness
≈ -14 LUFS; a tile of 4 frames from the last 8 s shows the right platform card; volumedetect on the
CTA window shows speech (mean above -25 dB); last word ends ≥ 2 s before the end.

## Step 7 — Deliver
SendUserFile both MP4s (display "render"). Short Bengali message: length, scene list in one line each,
the research sources (with year), credits used, anything to double-check (e.g. a statistic that is only
from one city). Offer changes; a re-render takes about a minute. No step-by-step recap.

## Related
"Medinest video" / "মেডিনেস্ট ভিডিও" is a different, older skill (static PIL slides with transitions).
"হেলথ ভিডিও" always means this motion-graphics style.
