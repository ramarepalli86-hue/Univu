/**
 * Veo 3 Video Generation API
 *
 * POST /api/veo-story  — kick off a Veo 3 generation job for a story scene
 * GET  /api/veo-story?op=<operationName>  — poll for completion
 *
 * Uses the same GEMINI_API_KEY already in .env.local — Veo 3 is available
 * through the Gemini API (Google AI Studio free tier).
 *
 * Free tier limits (as of 2026):
 *   • ~10 video generations / day
 *   • Max 8 s per clip, 9:16 or 16:9
 *   • ~60–120 s generation time (async long-running operation)
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiGuard } from '@/lib/apiGuard';

// Try veo-3.0-generate-preview first; fall back to stable veo-3.0
const VEO_MODELS = [
  'veo-3.0-generate-preview',
  'veo-3.0',
];
const GEN_AI = 'https://generativelanguage.googleapis.com/v1beta';

// ─── Prompt builder — South Indian dharmic aesthetics ────────────────────────

const STAGE_VISUALS: Record<string, string> = {
  'The Arrival': [
    'A newborn resting on a silk pillow inside a South Indian stone-temple home.',
    'Brass kuthuvilakku oil lamp glowing gold in dim warmth.',
    'Marigold garlands on doorway, sandalwood incense smoke curling upward.',
    'Mother in silk saree cradling the infant, grandmother behind her, sacred thread on doorframe.',
  ].join(' '),

  'The Unfolding': [
    'A curious child running barefoot through a Dravidian temple courtyard at dawn.',
    'Ancient stone pillars carved with deities, a lotus pond reflecting gopuram.',
    'Morning sunlight filtering through banana and neem trees, birds scattering.',
    'The child chases a butterfly past a deepam lamp burning at the temple entrance.',
  ].join(' '),

  'The Awakening': [
    'A young adult sitting under a banyan tree with a palm-leaf manuscript.',
    'Distant temple bells, rice fields glowing amber in early morning light.',
    'A silk-bordered dhoti or saree, expression alert with quiet determination.',
    'Peacock watching from a stone wall, monsoon clouds gathering on the horizon.',
  ].join(' '),

  'The Forge': [
    'A determined adult striding through a bustling South Indian bazaar.',
    'Silk and spice stalls, temple spires silhouetted against dramatic ochre sky.',
    'Resolve in the face, monsoon wind pushing cloth and market awnings.',
    'Gold weighing scales in a jeweller shop visible behind, prosperity imagery.',
  ].join(' '),

  'The Union': [
    'A traditional South Indian wedding beneath a panchaloha deepam.',
    'Bride in Kanjivaram silk, groom in white dhoti and angavastram.',
    'Sacred fire (homam), turmeric hands joined, jasmine flowers everywhere.',
    'Nagaswaram music implied by the joyful crowd, brass vessels, banana-leaf setting.',
  ].join(' '),

  'The Deepening': [
    'An elder seated in padmasana at a riverfront ghat at twilight.',
    'Temple bells faintly audible, prayer beads (rudraksha) in weathered hands.',
    'Grandchildren nearby, warm lamps lit along stone steps.',
    'Wisdom in the eyes, white or silver hair, saffron shawl, the river mirror-calm.',
  ].join(' '),

  'The Eternal': [
    'A radiant silhouette ascending ancient temple steps into a cosmic night sky.',
    'Milky Way arcing above, planets visibly orbiting, Sanskrit mandalas dissolving into starlight.',
    'Sacred geometry — Sri Yantra — glowing in the sky like a constellation.',
    'Peace and completion, the soul merging with the infinite.',
  ].join(' '),
};

const PLANET_MOOD: Record<string, string> = {
  Sun:     'golden triumphant light, radiant dawn, warm amber tones, heroic',
  Moon:    'silver moonlight, reflective stillness, rippling sacred tank water, introspective',
  Mars:    'fiery ochre-red sunset, intense and bold, warrior energy, crackling fire',
  Mercury: 'quick movement, fresh green emerald, dappled light, lively and curious',
  Jupiter: 'expansive golden skies, festive temple celebration, elephant procession, blessing and abundance',
  Venus:   'rose-gold and jasmine softness, romantic, gentle breeze through silk, lotus blooms',
  Saturn:  'deep indigo dusk, austere ancient stone, slow and contemplative, weight of time',
  Rahu:    'dramatic eclipse shadow over temple, smoke and mystery, eclipse light, shadow play',
  Ketu:    'ethereal saffron mist, renunciation and release, smoke from sacred fire, dissolution',
};

function buildVeoPrompt(params: {
  title: string;
  planet: string;
  lagnaSign: string;
  gender?: string;
}): string {
  const { title, planet, lagnaSign, gender } = params;
  const visuals = STAGE_VISUALS[title]
    || 'Ancient South Indian temple setting, oil lamps, carved stone pillars, sacred atmosphere.';
  const mood = PLANET_MOOD[planet] || 'warm golden temple light, serene and spiritual';

  return [
    `Cinematic 8-second short film. South Indian Dravidian temple aesthetic.`,
    visuals,
    `Mood and lighting: ${mood}.`,
    `Visual style: aged film stock of a 1930s Indian mythological silent film brought to life —`,
    `rich terracotta earth tones, kumkum red, turmeric gold, sacred maroon, deep forest green.`,
    `Slow majestic dolly or pull-back camera movement. Warm amber grain texture on image.`,
    `Stone temple architecture with intricate carvings visible. Brass and copper ritual vessels.`,
    `${lagnaSign} rising sign energy expressed through the environment.`,
    `No text, no captions, no watermarks. 9:16 vertical cinematic. Ultra-detailed.`,
    `Deeply spiritual, timeless, dharmic.`,
  ].join(' ');
}

// ─── POST — start a Veo generation job ───────────────────────────────────────

export async function POST(req: NextRequest) {
  const blocked = apiGuard(req);
  if (blocked) return blocked;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Veo not configured — add GEMINI_API_KEY' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const {
      title = 'The Arrival',
      planet = 'Moon',
      lagnaSign = 'Aries',
      gender = 'male',
    } = body;

    const prompt = buildVeoPrompt({ title, planet, lagnaSign, gender });

    let lastError: string = 'No models available';
    for (const model of VEO_MODELS) {
      try {
        const res = await fetch(
          `${GEN_AI}/models/${model}:predictLongRunning?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              instances: [{ prompt }],
              parameters: {
                aspectRatio: '9:16',
                durationSeconds: 8,
                enhancePrompt: true,
                personGeneration: 'allow_adult',
              },
            }),
          }
        );

        if (res.status === 404) {
          console.warn(`[Veo] Model ${model} not found, trying next`);
          continue;
        }

        if (!res.ok) {
          const err = await res.text();
          lastError = `${model}: ${res.status} — ${err.slice(0, 200)}`;
          console.warn('[Veo] Start failed:', lastError);
          // 429 rate limit or 403 quota — stop trying
          if (res.status === 429 || res.status === 403) break;
          continue;
        }

        const data = await res.json();
        const operationName: string = data.name; // "operations/xxxx"

        console.log(`[Veo] Job started: ${operationName} (model: ${model})`);
        return NextResponse.json({ operationName, model, prompt: prompt.slice(0, 120) + '…' });
      } catch (e) {
        lastError = e instanceof Error ? e.message : String(e);
        console.warn(`[Veo] ${model} threw:`, lastError);
      }
    }

    return NextResponse.json({ error: lastError }, { status: 503 });
  } catch (e) {
    console.error('[Veo] POST error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// ─── GET — poll a Veo job for completion ─────────────────────────────────────

export async function GET(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

  const { searchParams } = new URL(req.url);
  const opName = searchParams.get('op');
  if (!opName) return NextResponse.json({ error: 'op param required' }, { status: 400 });

  try {
    // opName is e.g. "operations/12345" — prepend the base
    const pollUrl = opName.startsWith('http')
      ? opName
      : `${GEN_AI}/${opName}?key=${apiKey}`;

    const res = await fetch(pollUrl.includes('?') ? pollUrl : `${pollUrl}?key=${apiKey}`);

    if (!res.ok) {
      return NextResponse.json({ done: false, error: `Poll returned ${res.status}` });
    }

    const data = await res.json();

    if (!data.done) {
      return NextResponse.json({ done: false });
    }

    // Extract video — handle multiple possible response shapes
    const samples =
      data.response?.generateVideoResponse?.generatedSamples ||
      data.response?.generatedSamples ||
      data.generateVideoResponse?.generatedSamples ||
      [];

    if (samples.length === 0) {
      return NextResponse.json({ done: true, error: 'No video samples in response' });
    }

    const videoEntry = samples[0]?.video;
    const mimeType = videoEntry?.mimeType || 'video/mp4';

    // Google AI Studio can return either a GCS URI or base64 bytes
    if (videoEntry?.videoBytes) {
      return NextResponse.json({
        done: true,
        videoUrl: `data:${mimeType};base64,${videoEntry.videoBytes}`,
      });
    }

    if (videoEntry?.uri) {
      return NextResponse.json({ done: true, videoUrl: videoEntry.uri });
    }

    return NextResponse.json({ done: true, error: 'Video URI not found in response' });
  } catch (e) {
    console.error('[Veo] GET error:', e);
    return NextResponse.json({ done: false, error: 'Poll error' }, { status: 500 });
  }
}
