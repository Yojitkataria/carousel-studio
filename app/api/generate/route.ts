import { NextRequest, NextResponse } from 'next/server'

type Slide = {
  title: string
  body: string
  slideType: 'Hook' | 'Content' | 'CTA'
}

type Tone = 'Educational' | 'Emotional' | 'Storytelling'
type QualityLabel = 'weak' | 'ok' | 'great'
type RequestTemplate = {
  id?: string
  name?: string
  structure?: string
}
const isDev = process.env.NODE_ENV !== 'production'
const debugLog = (...args: unknown[]) => {
  if (isDev) console.log(...args)
}

const stopWords = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'how', 'in', 'is', 'it', 'of',
  'on', 'or', 'that', 'the', 'this', 'to', 'with', 'why', 'what', 'when', 'where', 'who', 'will',
  'you', 'your', 'their', 'they', 'them', 'we', 'our'
])

const toTitleCase = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const hashString = (value: string) => {
  let hash = 0
  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}

const pick = <T>(items: T[], seed: number, offset: number) => items[(seed + offset) % items.length]

const normalizeTone = (tone: string): Tone => {
  const value = tone.toLowerCase()
  if (value === 'emotional') return 'Emotional'
  if (value === 'storytelling') return 'Storytelling'
  return 'Educational'
}

const extractKeywords = (idea: string) => {
  const cleaned = idea.toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
  const tokens = cleaned.split(/\s+/).filter(Boolean)
  const unique = Array.from(
    new Set(tokens.filter((token) => token.length > 2 && !stopWords.has(token)))
  )
  return unique
}

const createFallbackSlides = (idea: string, tone: string, seedSalt = 0): Slide[] => {
  const safeIdea = idea.trim() || 'How to improve learning outcomes'
  const seed = (hashString(`${safeIdea}|${tone}`) + seedSalt) >>> 0
  const keywords = extractKeywords(safeIdea)
  const toneMode = normalizeTone(tone)

  const k1 = toTitleCase(keywords[0] || 'Smart Students')
  const k2 = toTitleCase(keywords[1] || 'Exam Results')
  const k3 = toTitleCase(keywords[2] || 'Study Habits')
  const toneValue = toneMode
  const hookOpeners =
    toneMode === 'Emotional'
      ? ['This hurts more than people admit.', 'You are not broken.', 'This can feel frustrating.', 'It feels unfair, but fixable.', 'You are closer than you think.']
      : toneMode === 'Storytelling'
        ? ['It starts quietly, then grows fast.', 'Here is what usually happens first.', 'Most journeys begin with this mistake.', 'This is the turning point.', 'One small pattern changes everything.']
        : ['This pattern is predictable.', 'There is a clear reason behind this.', 'Most results follow the same structure.', 'This can be measured and improved.', 'The cause is usually systematic.']
  const toneTip = pick(
    toneMode === 'Emotional'
      ? [
          'Be kind to yourself while improving.',
          'Progress is built one calm step at a time.',
          'Confidence grows through small wins.',
          'Consistency beats pressure every time.',
          'Simple routines reduce stress fast.',
        ]
      : toneMode === 'Storytelling'
        ? [
            'Start with one scene and one action.',
            'Use a clear beginning, middle, and shift.',
            'Keep your narrative practical and real.',
            'Anchor each step to one lesson learned.',
            'Let each slide build momentum.',
          ]
        : [
            'Name one measurable action and a clear timeline.',
            'Use one habit you can track daily.',
            'Pick high-impact changes, not motivational fluff.',
            'Anchor progress to real weekly checkpoints.',
            'Turn insight into a repeatable routine.',
          ],
    seed,
    1
  )

  const hookTitle = pick(
    [
      `${k1} Still Struggle?`,
      `The Truth About ${k1}`,
      `Why ${k1} Happens`,
      `${k1}: What Most Miss`,
      `Stuck With ${k1}?`,
    ],
    seed,
    2
  )

  const hookBody = pick(
    [
      `${hookOpeners[0]} People forget up to 70% of new learning in 24 hours without retrieval.`,
      `If ${safeIdea.toLowerCase()} feels familiar, here is the surprising part: effort alone rarely fixes it.`,
      `${hookOpeners[1]} Most students feel busy, but their study method quietly kills recall.`,
      `The gap is rarely intelligence. It is usually poor recall practice and timing.`,
      `${hookOpeners[2]} This starts with small misses, then shows up as low confidence before tests.`,
    ],
    seed,
    3
  )

  const content2Body = pick(
    [
      `Reason 1: passive review. Reading notes feels productive, but recall barely improves.`,
      `Reason 1: no retrieval. If they cannot answer without looking, learning has not stuck yet.`,
      `Reason 1: fake fluency. Familiarity during rereading gets mistaken for real understanding.`,
      `Reason 1: cramming illusion. High effort the night before creates fast forgetting after.`,
      `Reason 1: no spaced checks. One long session loses to three short recall rounds.`,
    ],
    seed,
    4
  )

  const content3Body = pick(
    [
      `Reason 2: shallow practice. Solved examples look clear until a new question appears.`,
      `Reason 2: weak transfer. Students ace classwork but freeze when the question format shifts.`,
      `Reason 2: no error log. The same 3-4 mistakes repeat because nobody tracks them.`,
      `Reason 2: distraction switching. 20 minutes of multitasking can erase deep focus quality.`,
      `Reason 2: wrong sequence. Hard topics pushed to the end get rushed and half-learned.`,
    ],
    seed,
    5
  )

  const content4Body = pick(
    [
      `Reason 3: no system for ${k3.toLowerCase()}. Try 10-10-10: recall, practice, review. ${toneTip}`,
      `Reason 3: no reflection step. End study by writing 2 mistakes and 1 fix for tomorrow.`,
      `Reason 3: no priority filter. Start with one hard concept before easy revision tasks.`,
      `Reason 3: no momentum tracker. Use a visible streak board for daily recall reps.`,
      `Reason 3: no consistency trigger. Pair study with a fixed daily cue (time/place/music).`,
    ],
    seed,
    6
  )

  const ctaTitle = pick(
    [
      'Ready to Fix This?',
      `Try a Better ${k1} Strategy`,
      'Start Your New Plan Today',
      'Take Action This Week',
      'Build Smarter Results',
    ],
    seed,
    7
  )

  const ctaBody = pick(
    [
      `Choose one tactic tonight, run it for 7 days, and track score + confidence changes.`,
      `Turn this into action: pick one weak chapter, do recall first, then timed practice.`,
      toneMode === 'Emotional'
        ? 'Start with one promise: no passive rereading this week. Keep it simple and real.'
        : `Start small, but specific: 15 minutes recall before any reading block.`,
      `Use this now: recall -> practice -> review. Repeat daily, adjust weekly.`,
      `Take one focused step today, then repeat it tomorrow at the same time.`,
    ],
    seed,
    8
  )

  return [
    { title: hookTitle, body: hookBody, slideType: 'Hook' },
    { title: `Reason 1: ${k1}`, body: content2Body, slideType: 'Content' },
    { title: `Reason 2: ${k2}`, body: content3Body, slideType: 'Content' },
    { title: `Reason 3: ${k3}`, body: content4Body, slideType: 'Content' },
    { title: ctaTitle, body: ctaBody, slideType: 'CTA' },
  ]
}

const createHookVariations = (idea: string, tone: string, seedSalt = 0): string[] => {
  const safeIdea = idea.trim() || 'Learning breakthrough for parents'
  const seed = (hashString(`${safeIdea}|${tone}|hooks`) + seedSalt) >>> 0
  const keywords = extractKeywords(safeIdea)
  const k1 = toTitleCase(keywords[0] || 'Kids')
  const k2 = toTitleCase(keywords[1] || 'Learning')

  const options = [
    `${k1} Forget This Fast?`,
    `Why ${k1} Lose ${k2}`,
    `${k1} Study, Scores Still Drop`,
    `The ${k2} Myth Parents Believe`,
    `${k1} Learn, Then Forget`,
    `What Parents Miss About ${k2}`,
  ]

  return [pick(options, seed, 0), pick(options, seed, 2), pick(options, seed, 4)]
}

const sanitizeRegeneratedText = (text: string) =>
  text
    .replace(/in today's world/gi, '')
    .replace(/it is important to/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

const improveSlideLocally = (
  currentSlide: Slide,
  slideIndex: number,
  carousel: Slide[],
  qualityLabel: QualityLabel
): Slide => {
  const previousSlide = slideIndex > 0 ? carousel[slideIndex - 1] : null
  const previousContext = previousSlide
    ? ` Builds on: ${previousSlide.title.replace(/[.!?]$/, '')}.`
    : ''
  const title = sanitizeRegeneratedText(currentSlide.title).replace(/[:]/g, '')
  let body = sanitizeRegeneratedText(currentSlide.body)

  if (!/\d/.test(body)) {
    body = `${body} Example: a Grade 6 student did 10 minutes of retrieval daily and improved test accuracy in two weeks.`
  } else if (!/example:/i.test(body)) {
    body = `${body} Example: use this in your next study session tonight.`
  }

  if (!/[!?]$/.test(body)) {
    body = `${body} Try this today.`
  }

  if (qualityLabel === 'weak') {
    body = `Upgrade this now: ${body}`
  } else if (qualityLabel === 'ok') {
    body = `Polish this idea: ${body}`
  }

  return {
    title: title || currentSlide.title,
    body: `${body}${previousContext}`.slice(0, 320).trim(),
    slideType: currentSlide.slideType,
  }
}

const truncateWords = (value: string, maxWords: number) => {
  const words = value.trim().split(/\s+/).filter(Boolean)
  return words.slice(0, maxWords).join(' ')
}

const enforceStorySlideStyle = (slide: Slide): Slide => {
  const compactTitle = truncateWords(slide.title, 10)
  const compactBody = truncateWords(slide.body, 10)

  if (slide.slideType === 'CTA') {
    const urgentCta = compactBody || 'Act now. DM us today.'
    return {
      ...slide,
      title: compactTitle || "Don't Wait",
      body: truncateWords(urgentCta, 10),
    }
  }

  const cliffhangerBody = compactBody
    ? compactBody.replace(/[.!?]+$/, '') + '...'
    : 'Wait till next slide...'

  return {
    ...slide,
    title: compactTitle,
    body: cliffhangerBody,
  }
}

export async function POST(req: NextRequest) {
  let inputIdea = ''
  let inputTone = 'Educational'
  let inputFormat = 'carousel'
  let inputTemplateStructure = ''
  let shouldReturnHooks = false
  let shouldRegenerate = false
  let regenSlideIndex = 0
  let regenCarousel: Slide[] = []
  let regenCurrentSlide: Slide | null = null
  let regenQualityLabel: QualityLabel = 'ok'
  try {
    const {
      idea,
      tone,
      format,
      template,
      regenerate,
      slideIndex,
      nonce,
      hookVariations,
      carousel,
      currentSlide,
      qualityLabel
    } = await req.json() as {
      idea?: string
      tone?: string
      format?: string
      template?: RequestTemplate
      regenerate?: boolean
      slideIndex?: number
      nonce?: number
      hookVariations?: boolean
      carousel?: Slide[]
      currentSlide?: Slide
      qualityLabel?: QualityLabel
    }
    inputIdea = String(idea || '')
    inputTone = String(tone || 'Educational')
    inputFormat = String(format || 'carousel')
    inputTemplateStructure =
      template && typeof template.structure === 'string'
        ? template.structure.trim()
        : ''
    shouldReturnHooks = Boolean(hookVariations)
    shouldRegenerate = Boolean(regenerate)
    regenSlideIndex = Number.isInteger(slideIndex) ? Number(slideIndex) : 0
    regenCarousel = Array.isArray(carousel) ? carousel : []
    regenCurrentSlide =
      currentSlide &&
      typeof currentSlide.title === 'string' &&
      typeof currentSlide.body === 'string' &&
      (currentSlide.slideType === 'Hook' || currentSlide.slideType === 'Content' || currentSlide.slideType === 'CTA')
        ? currentSlide
        : regenCarousel[regenSlideIndex] ?? null
    regenQualityLabel =
      qualityLabel === 'weak' || qualityLabel === 'ok' || qualityLabel === 'great'
        ? qualityLabel
        : 'ok'
    const regenSalt = regenerate ? hashString(`${slideIndex ?? 0}|${nonce ?? Date.now()}`) : 0
    const fallbackSlides = createFallbackSlides(inputIdea, inputTone, regenSalt)
    const fallbackHooks = createHookVariations(inputIdea, inputTone, regenSalt)
    const fallbackImprovedSlide = regenCurrentSlide
      ? improveSlideLocally(regenCurrentSlide, regenSlideIndex, regenCarousel, regenQualityLabel)
      : null
    const fallbackSlidesForFormat =
      inputFormat === 'story' ? fallbackSlides.map((slide) => enforceStorySlideStyle(slide)) : fallbackSlides
    const fallbackImprovedSlideForFormat =
      inputFormat === 'story' && fallbackImprovedSlide
        ? enforceStorySlideStyle(fallbackImprovedSlide)
        : fallbackImprovedSlide
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      debugLog('No API key, returning local fallback')
      if (hookVariations) {
        return NextResponse.json({ hooks: fallbackHooks }, {
          headers: { 'x-generator-source': 'local' },
        })
      }
      if (shouldRegenerate && fallbackImprovedSlide) {
        return NextResponse.json([fallbackImprovedSlideForFormat], {
          headers: { 'x-generator-source': 'local' },
        })
      }
      return NextResponse.json(fallbackSlidesForFormat, {
        headers: { 'x-generator-source': 'local' },
      })
    }

    const formatRules: Record<string, string> = {
      post: `FORMAT: Single Instagram Post (1:1)
- This is ONE standalone image, not a series
- Slide 1 is the only slide that matters — make it self-contained
- Title: max 5 words, punchy headline
- Body: max 20 words — one clear insight, no cliffhangers
- CTA on slide 5: "Save this post"
- Content must work without context — viewer sees only this one image`,

      story: `FORMAT: Instagram Story (9:16 vertical)
- Stories are fast and emotional — viewers tap through in 2 seconds
- Title: max 4 words — big, bold, immediate
- Body: max 15 words — short punchy sentences, one idea per slide
- Use emotional/curiosity hooks — stories feel personal, not educational
- CTA on slide 5: "Swipe up" or "DM us"
- Pacing: each slide should feel like a fast reveal`,

      carousel: `FORMAT: Instagram Carousel (multi-slide)
- Carousels reward depth — viewers swipe because they want more
- Slide 1 (Hook): Counterintuitive or surprising statement that stops the scroll
- Slides 2-4 (Content): Each teaches ONE specific insight with data/examples
- Slide 5 (CTA): Warm summary + clear next step
- Title: max 7 words
- Body: max 30 words — conversational, parent-friendly
- Use "Swipe →" on slide 1 body`
    }

    const activeFormatRule = formatRules[inputFormat as string] || formatRules.carousel
    const storyRule =
      inputFormat === 'story'
        ? `For story format:
- short, punchy lines
- max 2 lines per slide
- emotional hooks
- no long explanations
- max 8-10 words per slide
- one idea per slide only
- use a clearly emotional tone
- add cliffhanger momentum between slides
- CTA must be strong and urgent
- use faster pacing than carousel`
        : ''
    const templateRule = inputTemplateStructure
      ? `Follow this structure strictly: ${inputTemplateStructure}`
      : ''

    const prompt = hookVariations
      ? `You are an expert Instagram content creator for Cuemath.

Create 3 hook title variations for slide 1 only.
Topic: "${idea}"
Tone: ${tone}

Rules:
- Each title max 6 words
- Scroll-stopping, emotional or surprising
- Parent-friendly language
- No numbering, no colon
- Keep each option clearly different

Return ONLY valid JSON:
["hook option 1","hook option 2","hook option 3"]`
      : shouldRegenerate && regenCurrentSlide
        ? `You are an expert Instagram carousel editor for Cuemath.

Improve this slide.
Fix weaknesses:
- Remove generic phrases
- Add a concrete example
- Make it more engaging
- Keep consistency with previous slides

Context:
- Topic: "${idea}"
- Tone: ${tone}
- Slide index: ${regenSlideIndex}
- Quality label: ${regenQualityLabel}
- Full carousel JSON:
${JSON.stringify(regenCarousel)}
- Current slide JSON:
${JSON.stringify(regenCurrentSlide)}

Rules:
- Keep slideType unchanged.
- Keep title max 6 words.
- Keep body max 30 words.
- Return an improved version of the current slide, not a random rewrite.
- Keep language parent-friendly and specific.
- Avoid "in today's world" and "it is important to".

Return ONLY valid JSON:
{"title":"string","body":"string","slideType":"Hook|Content|CTA"}`
      : `You are an expert Instagram content creator for Cuemath, an ed-tech platform for parents of K-12 students.

${activeFormatRule}
${templateRule ? `\n${templateRule}` : ''}
${storyRule ? `\n${storyRule}` : ''}

Create content about: "${idea}"
Tone: ${inputFormat === 'story' ? 'Emotional' : tone}

UNIVERSAL WRITING RULES:
- Never start titles with "Reason 1:" or use colons in titles
- Never use "in today's world" or "it is important to"
- Write like a smart friend, not a textbook
- Parents are the audience — warm, clear, trustworthy voice

Return ONLY a valid JSON array of exactly 5 objects:
[{"title":"string","body":"string","slideType":"Hook|Content|CTA"}]

No markdown. No code blocks. Raw JSON only.`

    const requestGemini = async (retryCount = 0): Promise<unknown | null> => {
      debugLog(`Fetching Gemini (attempt ${retryCount + 1})...`)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      try {
        const res = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: shouldRegenerate ? 0.2 : 0.7,
                maxOutputTokens: 700,
                responseMimeType: "application/json",
                thinkingConfig: {
                  thinkingBudget: 0,
                },
              }
            }),
            signal: controller.signal
          }
        )
        clearTimeout(timeoutId)
        debugLog('Gemini response status:', res.status)

        if (!res.ok) {
          const errorText = await res.text()
          console.error('Gemini HTTP error:', res.status, errorText.slice(0, 200))
          if (retryCount < 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            return requestGemini(retryCount + 1)
          }
          return null
        }

        return await res.json()
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          console.error(`Gemini request timed out on attempt ${retryCount + 1}`)
        } else {
          console.error(`Gemini request failed on attempt ${retryCount + 1}:`, error)
        }
        if (retryCount < 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          return requestGemini(retryCount + 1)
        }
        return null
      }
    }

    const data = await requestGemini()
    if (!data) {
      return NextResponse.json(hookVariations ? { hooks: fallbackHooks } : fallbackSlidesForFormat, {
        headers: { 'x-generator-source': 'local' },
      })
    }

    const text = (data as any)?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      console.error('No text in response')
      return NextResponse.json(hookVariations ? { hooks: fallbackHooks } : fallbackSlidesForFormat, {
        headers: { 'x-generator-source': 'local' },
      })
    }

    // Clean the text - remove markdown code blocks if present
    const cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    if (shouldRegenerate && regenCurrentSlide) {
      let improved: unknown
      try {
        improved = JSON.parse(cleaned)
      } catch {
        const objectMatch = cleaned.match(/\{[\s\S]*\}/)
        if (!objectMatch) {
          return NextResponse.json([fallbackImprovedSlideForFormat ?? regenCurrentSlide], {
            headers: { 'x-generator-source': 'local' },
          })
        }
        try {
          improved = JSON.parse(objectMatch[0])
        } catch {
          return NextResponse.json([fallbackImprovedSlideForFormat ?? regenCurrentSlide], {
            headers: { 'x-generator-source': 'local' },
          })
        }
      }

      if (!improved || typeof improved !== 'object') {
        return NextResponse.json([fallbackImprovedSlideForFormat ?? regenCurrentSlide], {
          headers: { 'x-generator-source': 'local' },
        })
      }

      const improvedSlide = improved as Partial<Slide>
      const normalizedSlide: Slide = {
        title: typeof improvedSlide.title === 'string' ? improvedSlide.title : regenCurrentSlide.title,
        body: typeof improvedSlide.body === 'string' ? improvedSlide.body : regenCurrentSlide.body,
        slideType:
          improvedSlide.slideType === 'Hook' || improvedSlide.slideType === 'CTA' || improvedSlide.slideType === 'Content'
            ? improvedSlide.slideType
            : regenCurrentSlide.slideType,
      }
      const finalSlide = inputFormat === 'story' ? enforceStorySlideStyle(normalizedSlide) : normalizedSlide

      return NextResponse.json([finalSlide], {
        headers: { 'x-generator-source': 'gemini' },
      })
    }

    const jsonMatch = cleaned.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.error('Could not extract JSON array from Gemini text')
      debugLog('Gemini text snippet:', text.slice(0, 300))
      return NextResponse.json(hookVariations ? { hooks: fallbackHooks } : fallbackSlidesForFormat, {
        headers: { 'x-generator-source': 'local' },
      })
    }

    let slides: unknown
    try {
      slides = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      debugLog('Gemini text snippet:', text.slice(0, 300))
      return NextResponse.json(hookVariations ? { hooks: fallbackHooks } : fallbackSlidesForFormat, {
        headers: { 'x-generator-source': 'local' },
      })
    }

    if (!Array.isArray(slides)) {
      return NextResponse.json(hookVariations ? { hooks: fallbackHooks } : fallbackSlidesForFormat, {
        headers: { 'x-generator-source': 'local' },
      })
    }

    debugLog('Parsed slides length:', Array.isArray(slides) ? slides.length : 0)
    if (hookVariations) {
      const hooks = slides
        .filter((item): item is string => typeof item === 'string')
        .slice(0, 3)
      if (hooks.length === 3) {
        return NextResponse.json({ hooks }, {
          headers: { 'x-generator-source': 'gemini' },
        })
      }
      return NextResponse.json({ hooks: fallbackHooks }, {
        headers: { 'x-generator-source': 'local' },
      })
    }
    const finalSlides = inputFormat === 'story'
      ? (slides as Slide[]).map((slide) => enforceStorySlideStyle(slide))
      : slides
    return NextResponse.json(finalSlides, {
      headers: { 'x-generator-source': 'gemini' },
    })

  } catch (e) {
    console.error('Full error:', e)
    if (shouldRegenerate && regenCurrentSlide) {
      const localImproved = improveSlideLocally(regenCurrentSlide, regenSlideIndex, regenCarousel, regenQualityLabel)
      return NextResponse.json(
        [inputFormat === 'story' ? enforceStorySlideStyle(localImproved) : localImproved],
        {
          headers: { 'x-generator-source': 'local' },
        }
      )
    }
    return NextResponse.json(shouldReturnHooks
      ? { hooks: createHookVariations(inputIdea, inputTone) }
      : (inputFormat === 'story'
          ? createFallbackSlides(inputIdea, inputTone).map((slide) => enforceStorySlideStyle(slide))
          : createFallbackSlides(inputIdea, inputTone)),
    {
      headers: { 'x-generator-source': 'local' },
    })
  }
}
