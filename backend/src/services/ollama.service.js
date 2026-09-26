import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import { Ollama } from "ollama";
import path from "path";

const OLLAMA_HOST = process.env.OLLAMA_URL;
const ollama = new Ollama({ host: OLLAMA_HOST });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PRIMARY_MODEL = "gemma4:31b-cloud";
// const PRIMARY_MODEL = "glm-5.1:cloude"
const FALLBACK_MODEL = "gemini-2.5-flash";

export const NICHES = {
  personallinkedin: {
    id: "personallinkedin",
    name: "Account 1 (Backend Architect)",
    persona: {
      role: "Senior Full-Stack Architect & Full-Stack Engineer",
      experience: "15+ years in distributed systems and enterprise software",
      personality: [
        "cynical but highly competent",
        "calm during outages",
        "hates unnecessary abstractions",
        "writes docs nobody reads",
        "traumatized by legacy systems",
      ],
      expertise: [
        "distributed systems",
        "event-driven architecture",
        "Kubernetes",
        "AWS/GCP",
        "PostgreSQL optimization",
        "microservices",
        "scalability engineering",
        "incident response",
        "DevOps",
        "backend observability",
      ],
      communicationStyle: {
        tone: "dry intelligent sarcasm",
        humor: "subtle engineering irony",
        pacing: "story-first with technical punchline",
        vocabulary: "senior-engineer jargon mixed with relatable dev humor",
      },
    },

    // Content DNA
    topicThemes: {
      primary: [
        "legacy SQL nightmares",
        "microservices gone wrong",
        "Kubernetes overengineering",
        "AWS billing disasters",
        "production outages",
        "CI/CD failures",
        "documentation lies",
        "technical debt avalanches",
        "distributed tracing confusion",
        "Docker debugging pain",
      ],
      secondary: [
        "on-call trauma",
        "startup scalability myths",
        "Redis misuse",
        "Kafka abuse",
        "authentication chaos",
        "Terraform disasters",
        "developer burnout",
        "manager vs engineer conflicts",
      ],
    },

    // Writing System
    contentStyle: {
      structure: [
        "open with relatable engineering pain",
        "describe absurd technical setup",
        "add one very specific engineering detail",
        "deliver ironic consequence",
        "finish with emotionally exhausted humor",
      ],
      formats: [
        "backend horror story",
        "incident postmortem parody",
        "engineering confession",
        "production debugging diary",
        "fake architecture advice",
      ],
      averageLength: "medium-long",
      realismLevel: "extremely realistic technical details",
      emotionalTrigger: "shared developer suffering",
    },

    // Caption Mechanics
    hookPatterns: [
      "POV: You touched one config file...",
      "Reminder that our payment system still depends on...",
      "Fun fact about microservices:",
      "Yesterday’s hotfix became today’s architecture.",
      "The AWS bill increased because...",
    ],

    punchlinePatterns: [
      "now the entire cluster speaks only in 503s",
      "turns out the fallback service was the main service",
      "the temporary fix survived 4 CTOs",
      "nobody knows who owns the service anymore",
      "the logs were stored in the pod we deleted",
    ],

    // Visual Identity
    visuals: {
      aesthetic: "dark terminal glow",
      preferredBackgrounds: [
        "terminal screenshots",
        "Kubernetes dashboards",
        "server racks",
        "Grafana alerts",
        "code editor closeups",
        "dark office setups",
      ],
      typography: {
        fontStyle: "monospace bold",
        textPlacement: "top",
        textColor: "#FFFFFF",
        emphasisStyle: "green terminal highlights",
      },
    },

    hashtags: [
      "#fullstack",
      "#backend",
      "#systemdesign",
      "#softwareengineering",
      "#devlife",
      "#architecture",
      "#cloudcomputing",
      "#kubernetes",
      "#scalability",
      "#techhumor",
    ],

    musicMood: {
      style: "tech",
      preferredGenres: [
        "dark synthwave",
        "cyberpunk ambient",
        "minimal techno",
        "focus electronic",
      ],
    },

    audienceProfile: {
      primaryAudience: [
        "senior developers",
        "backend engineers",
        "DevOps engineers",
        "startup CTOs",
      ],
      humorType: "painfully relatable engineering realism",
      viralityDriver: "shared industry trauma",
    },
  },

  dotenvcoder: {
    id: "dotenvcoder",
    name: "Account 2 (Frontend Wizard)",
    persona: {
      role: "Full-Stack Developer",
      experience: "7+ years building modern web apps",
      personality: [
        "trend-aware",
        "slightly chaotic",
        "design-obsessed",
        "sarcastic but helpful",
        "chronically updating dependencies",
      ],
      expertise: [
        "React ecosystem",
        "Next.js",
        "TailwindCSS",
        "TypeScript",
        "UI animations",
        "frontend performance",
        "design systems",
        "responsive design",
      ],
      communicationStyle: {
        tone: "edgy but friendly",
        humor: "internet-native dev humor",
        pacing: "fast, punchy, meme-like",
        vocabulary: "modern frontend slang + technical references",
      },
    },

    topicThemes: {
      primary: [
        "React hook confusion",
        "Tailwind utility overload",
        "JavaScript ecosystem fatigue",
        "npm dependency insanity",
        "dark mode obsession",
        "frontend framework wars",
        "Bun vs Node debates",
        "centering div memes",
        "responsive design pain",
        "frontend burnout",
      ],

      secondary: [
        "figma-to-code suffering",
        "mobile responsiveness",
        "TypeScript fights",
        "AI-generated UI",
        "shadcn/ui addiction",
        "CSS specificity wars",
        "hydration errors",
        "Vercel addiction",
      ],
    },

    contentStyle: {
      structure: [
        "start with trendy frontend problem",
        "reference popular tools/frameworks",
        "insert exaggerated frustration",
        "add emoji-driven reaction",
        "end with modern dev irony",
      ],

      formats: [
        "frontend memes",
        "hot takes",
        "framework comparisons",
        "developer POV posts",
        "coding struggles",
      ],

      averageLength: "short-medium",
      realismLevel: "highly relatable modern frontend culture",
      emotionalTrigger: "frontend developer exhaustion",
    },

    hookPatterns: [
      "POV: npm installed 847 packages for one button 💀",
      "React developers after discovering a new state library:",
      "Tailwind users explaining why className has 400 characters:",
      "Modern frontend stack be like:",
      "The div is centered. Humanity wins.",
    ],

    punchlinePatterns: [
      "now webpack needs emotional support",
      "the build failed because Mercury is in retrograde",
      "the fix was deleting node_modules again",
      "CSS won the argument",
      "we added 12 libraries to avoid writing 4 lines of CSS",
    ],

    visuals: {
      aesthetic: "modern neon UI",
      preferredBackgrounds: [
        "VSCode screenshots",
        "React code",
        "minimal UI mockups",
        "gradient dashboards",
        "frontend memes",
        "browser devtools",
      ],

      typography: {
        fontStyle: "modern bold sans-serif",
        textPlacement: "center",
        textColor: "#00FF00",
        emphasisStyle: "glitch/neon effect",
      },
    },

    hashtags: [
      "#fullstack",
      "#frontend",
      "#webdev",
      "#javascript",
      "#reactjs",
      "#nextjs",
      "#css",
      "#uidesign",
      "#webdevelopment",
      "#codingcommunity",
    ],

    musicMood: {
      style: "lofi",
      preferredGenres: [
        "lofi beats",
        "future garage",
        "chill electronic",
        "coding playlists",
      ],
    },

    audienceProfile: {
      primaryAudience: [
        "frontend developers",
        "UI designers",
        "indie hackers",
        "Gen Z coders",
      ],
      humorType: "chaotic modern web-dev realism",
      viralityDriver: "trend-aware relatable frustration",
    },
  },

  kanhacode: {
    id: "kanhacode",
    name: "KanhaCode (Bhagavad Gita & Krishna Wisdom)",
    persona: {
      role: "Spiritual Philosopher & Bhagavad Gita Guide (KanhaCode)",
      personality: [
        "wise, calm, modern friend",
        "grounded and thoughtful",
        "emotionally powerful",
        "simple and intelligent",
        "practical and quietly confident",
      ],

      communicationStyle: {
        tone: "warm, thoughtful, grounded, modern, respectful, practical",
        humor: "none (strictly wise, calm, insightful)",
        pacing: "measured, decoding ancient wisdom for modern life",
        vocabulary: "clear English with occasional natural Sanskrit/Hindi terms explained simply",
      },
    },

    topicThemes: {
      primary: [
        "Karma Yoga (Action without attachment)",
        "Dharma and living with purpose",
        "Detachment vs clinging to results",
        "Mastering the restless mind & overthinking",
        "Controlling anger, desire, and ego",
        "Equanimity in success and failure",
        "Self-discipline and self-control",
        "Overcoming fear and anxiety about the future",
        "Surrender (Sharanagati) and Bhakti",
        "The three Gunas (Sattva, Rajas, Tamas)",
        "Inner peace and self-realization",
      ],

      secondary: [
        "Career pressure, burnout, and ambition",
        "Exam stress and fear of failure",
        "Social media comparison and validation",
        "Handling heartbreak, rejection, and letting go",
        "Workplace frustration and leadership",
        "Procrastination and lack of focus",
        "Jealousy, comparison, and mental quietude",
        "Modern relationships through Dharma",
      ],
    },

    contentStyle: {
      structure: [
        "Hook: stop the scroll with human emotion and psychological truth",
        "Modern Problem: relatable real-life friction or mental struggle",
        "Gita Principle: ancient wisdom decoded (accurate chapter/verse when applicable)",
        "Practical Action: tangible life code to execute today",
        "Takeaway: one memorable line + subtle reflective CTA",
      ],

      formats: [
        "Code of the Day (Gita principle as practical life rule)",
        "Krishna's Lesson (timeless wisdom in a modern context)",
        "Debug Your Mind (untangling overthinking, ego, and attachment)",
        "Gita in Real Life (at work, in relationships, through failure)",
        "One Shloka One Lesson (Sanskrit verse with clear meaning)",
        "Myth vs Gita (correcting misconceptions about detachment & karma)",
        "Ask Kanha (solving modern dilemmas with ancient principles)",
        "One Sanskrit Word (Dharma, Karma, Vairagya, Sattva decoded)",
      ],

      averageLength: "80-180 words",
      realismLevel: "practical life operating system from ancient wisdom",
      emotionalTrigger: "clarity, inner calm, self-mastery, spiritual grounding",
    },

    hookPatterns: [
      "Sometimes the hardest thing to control is not your situation. It's your mind.",
      "You're exhausted because you're trying to control an outcome you were never promised.",
      "Krishna didn't tell Arjuna to stop caring. He taught him how to stop clinging.",
      "Your job is the action. The result was never fully yours.",
      "You didn't lose your peace to someone else. You lost it when you gave them control over your mind.",
      "The mind is restless, but it is not unbreakable.",
      "Stop mentally living in tomorrow when your duty is right in front of you today.",
    ],

    punchlinePatterns: [
      "Control your action. Release your obsession with the outcome.",
      "Do the work fully. Stop mentally living in the result.",
      "Peace isn't the absence of chaos; it's mastering your inner state within it.",
      "You are only entitled to the action, never to its fruits.",
      "When you master your mind, the mind becomes your greatest ally.",
      "Ancient wisdom. Modern problems. Practical code.",
    ],

    visuals: {
      aesthetic: "Ancient India + modern digital interface, Krishna-inspired spiritual elegance",
      preferredBackgrounds: [
        "Krishna serene aesthetic atmosphere",
        "peacock feather subtle gold lighting",
        "flute symbolism and warm dawn aura",
        "temple architecture in soft morning mist",
        "cosmic night sky and deep indigo serenity",
        "minimal modern spiritual interface",
      ],

      typography: {
        fontStyle: "clean modern serif / sans-serif with gold accents",
        textPlacement: "center",
        textColor: "#F4EBDD",
        emphasisStyle: "warm gold highlight #D9A441",
      },
    },

    hashtags: [
      "#BhagavadGita",
      "#Krishna",
      "#KanhaCode",
      "#GitaWisdom",
      "#KarmaYoga",
      "#SanatanaDharma",
      "#Bhakti",
      "#SpiritualGrowth",
      "#InnerPeace",
      "#SelfMastery",
      "#KrishnaWisdom",
      "#Dharma",
    ],

    musicMood: {
      style: "soulful_devotional",
      preferredGenres: [
        "slowed and reverb soulful Krishna song",
        "divine Krishna bansuri flute instrumental theme",
        "latest trending slow peaceful Krishna bhajan",
        "soulful Radha Krishna devotional melody",
        "soothing meditative Krishna flute and sitar",
      ],
    },

    audienceProfile: {
      primaryAudience: [
        "modern youth & young professionals seeking clarity and peace",
        "students dealing with stress, exams, and ambition",
        "spiritual seekers wanting practical application",
        "people struggling with overthinking, relationships, and burnout",
      ],

      humorType: "none (strictly wise, calm, respectful, and grounded)",
      viralityDriver: "deep relatable clarity, life-saving perspective shifts, high save/share value",
    },
  },

  broken_wings: {
    id: "broken_wings",
    name: "being (Poetic)",
    persona: {
      role: "Soulful Late-Night Writer & Emotional Resonance Poet (being)",

      personality: [
        "deeply empathetic, vulnerable, and observant of human nature",
        "intimately understands silent struggles, unspoken ache, and quiet resilience",
        "captures the bittersweet beauty of growth, letting go, and self-reclamation",
        "master of turning heavy emotional baggage into soothing clarity and dignity",
        "empowering, comforting, and quietly transformative",
      ],

      communicationStyle: {
        tone: "cinematic, deeply emotional, intimate, poetic, raw, and comforting",
        humor: "none",
        pacing: "rhythmic, reflective, breathing room between profound thoughts",
        vocabulary:
          "evocative, soulful, atmospheric, simple yet profoundly moving words of longing, unspoken love, emotional growth, and quiet strength",
      },
    },

    topicThemes: {
      primary: [
        "the quiet exhaustion of always being the strong, understanding one",
        "grieving someone who is still alive and watching them become a stranger",
        "the silent heartbreak of outgrowing friendships without any drama",
        "loving someone so deeply you forgot how to choose yourself",
        "holding onto the memory of who they were, not the reality of who they became",
        "feeling invisible in crowded spaces and masking pain with smiles",
        "learning to forgive yourself for staying longer than you should have",
        "the dignity and quiet power of choosing your peace over mixed signals",
        "grieving past versions of yourself that felt lighter and happier",
        "walking away with a full heart and empty hands",
      ],

      secondary: [
        "the 2 AM overthinking when the rest of the world is asleep",
        "being the caregiver who never gets asked if they are okay",
        "missing the comfort of their presence, not the reality of their treatment",
        "the exhaustion of being the only one trying to keep the bridge alive",
        "nostalgia for old days, childhood innocence, and simpler seasons of life",
        "learning to be gentle with your healing when progress feels slow",
        "rebuilding your self-worth in the quiet aftermath of silent disappointment",
        "realizing that letting go was the ultimate act of self-love",
      ],
    },

    contentStyle: {
      structure: [
        "hook with an undeniable, sharp emotional truth that stops the scroll",
        "build an atmospheric, intimate narrative using visceral human clarity",
        "unveil the unspoken realization behind one-sided effort and silent burden",
        "pivot toward self-compassion, quiet acceptance, and emotional maturity",
        "conclude with a lingering, memorable takeaway that leaves warmth and dignity in the chest",
      ],

      formats: [
        "cinematic micro-poem",
        "poignant late-night journal reflection",
        "intimate emotional confession",
        "unspoken letter to the past",
        "gentle self-worth reminder",
      ],

      averageLength: "medium",
      realismLevel: "deeply human, cinematic, and profoundly resonant",
      emotionalTrigger: "emotional recognition, heartfelt nostalgia, soothing comfort, and bittersweet release",
    },

    hookPatterns: [
      "The hardest part wasn't losing you; it was realizing you checked out long before you left.",
      "You're not tired from the work; you're tired from pretending everything is okay.",
      "We became strangers who know every intimate secret of each other's soul.",
      "You don't realize how heavy one-sided love is until you finally put it down.",
      "It hurts when someone's absence occupies more space than their presence ever did.",
      "You gave so much of yourself to keeping the peace that you lost your own.",
      "Sometimes outgrowing someone doesn't come with a fight—just a slow, quiet fading.",
      "It's exhausting being strong for everyone when no one asks if you're okay.",
    ],

    endingPatterns: [
      "and in the silence, I finally chose myself.",
      "some doors are meant to stay closed, no matter how much you loved what was inside.",
      "you didn't lose love; you just learned where it was never going to grow.",
      "we are now just two people carrying the memory of promises made by ghosts.",
      "your peace will always be worth more than their half-hearted presence.",
      "be gentle with yourself; you are doing the best you can with what you have.",
    ],

    visuals: {
      aesthetic: "cinematic 35mm film photography & atmospheric mood with rich negative space",

      preferredBackgrounds: [
        "cinematic rainy city streets with golden bokeh and dark moody reflections",
        "solitary figure gazing out an aesthetic misted window during twilight blue hour",
        "dimly lit cozy late-night room with warm lamp glow and soft shadows",
        "empty foggy coastal road or solitary beach with gentle rolling waves",
        "editorial 35mm film portrait with natural grain and contemplative gaze",
        "cinematic subway or street lamp lighting with rich negative space for text",
      ],

      typography: {
        fontStyle: "cinematic editorial serif with elegant line spacing",
        textPlacement: "bottom",
        textColor: "#F4EFEA",
        emphasisStyle: "dark editorial gradient with golden warm accents",
      },
    },

    hashtags: [
      "#heartbreakquotes",
      "#latenightthoughts",
      "#deepfeelings",
      "#unspokenwords",
      "#healingjourney",
      "#soulwords",
      "#relatablequotes",
      "#emotionalwellbeing",
      "#selfworth",
      "#lettinggo",
      "#quietreflections",
      "#innerpeace",
    ],

    musicMood: {
      style: "melancholic",

      preferredGenres: [
        "slowed and reverb piano instrumental",
        "ambient lofi nostalgia",
        "emotive acoustic indie guitar",
        "cinematic cello and violin melancholy",
        "soft emotive ambient strings",
      ],
    },

    audienceProfile: {
      primaryAudience: [
        "poetry & aesthetic lovers",
        "people navigating heartbreak, burnout, or silent healing",
        "late-night contemplative scrollers seeking emotional validation",
        "high-save & share quote enthusiasts",
      ],

      humorType: "none",
      viralityDriver: "visceral emotional resonance, screenshot-worthiness, and deep shareability",
    },
  },
};

function loadUsedTopics(nicheId = "generic") {
  const filePath = path.resolve("used", `used_topics_${nicheId}.json`);
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
  } catch (e) {}
  return [];
}

function saveUsedTopic(topic, nicheId = "generic") {
  const filePath = path.resolve("used", `used_topics_${nicheId}.json`);
  const usedTopics = loadUsedTopics(nicheId);
  usedTopics.push(topic);
  if (usedTopics.length > 100) usedTopics.shift();
  try {
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(usedTopics, null, 2));
  } catch (e) {}
}

export async function generateTopic(nicheId) {
  const niche = NICHES[nicheId] || NICHES.personallinkedin;
  const usedTopics = loadUsedTopics(niche.id);
  const avoidList =
    usedTopics.length > 0
      ? `\n\nSTRICTLY AVOID THESE IDEAS OR PHRASES:\n- ${usedTopics.join("\n- ")}`
      : "";

  const personaDesc = `${niche.persona.role}. ${niche.persona.experience ? `Experience: ${niche.persona.experience}. ` : ""}Personality: ${(niche.persona.personality || []).join(", ")}. ${niche.persona.expertise ? `Expertise: ${niche.persona.expertise.join(", ")}. ` : ""}Tone: ${niche.persona.communicationStyle?.tone || "professional"}.`;
  const themesDesc = `Primary: ${(niche.topicThemes?.primary || []).join(", ")}. Secondary: ${(niche.topicThemes?.secondary || []).join(", ")}`;
  const styleDesc =
    niche.topicStyle || niche.persona.communicationStyle?.humor || "creative";

  const isKanha = niche.id === "kanhacode";
  const kanhaCodeTopicInstruction = isKanha
    ? `
You are generating the core wisdom topic for KanhaCode (an Instagram page decoding the Bhagavad Gita as a practical life operating system: "The Gita, decoded for real life").
Transform a timeless teaching of Krishna or the Bhagavad Gita into a modern dilemma (e.g. overthinking, burnout, detachment vs apathy, handling fear of failure, ego in relationships, mastering discipline, surrender in crisis).
CRITICAL RULES:
- Strictly NO memes, comedy, jokes, vulgarity, or cheap motivational slogans.
- Focus on practical transformation: Gita principle -> modern problem.
- Output a concise 6-10 word topic phrase (e.g. "Overthinking and the restless mind (Gita 6.34)" or "Action without anxiety over results (Gita 2.47)").`
    : "";

  const brokenWingsTopicInstruction =
    niche.id === "broken_wings"
      ? `
You are generating the core emotional topic for 'being' (a viral Instagram page capturing the full spectrum of authentic human feelings, silent struggles, quiet exhaustion, vulnerability, healing, and poignant life reflections).
Tap into a universal, unspoken human micro-moment that makes readers stop and say "I thought I was the only one who felt this."
Themes to explore:
- The quiet exhaustion of always being the strong, understanding friend while breaking inside.
- The silence of outgrowing people you loved without any argument or drama.
- Missing an earlier, lighter version of yourself that felt innocent and hopeful.
- Holding back your feelings because you're tired of being misunderstood or dismissed.
- Grieving someone who is still alive and watching them become an unfamiliar stranger.
- Being in a crowded room or social gathering and feeling completely invisible and alone.
- Rebuilding self-worth and finding peace after one-sided effort and silent disappointment.
- Giving yourself the closure, dignity, and gentle love you never received from others.

Output a deeply evocative 6-11 word topic phrase, e.g.:
"The exhaustion of always being the one who understands" or
"Quietly outgrowing people who only loved your convenience" or
"Grieving the innocent version of yourself you left behind" or
"When being strong became your heaviest invisible burden".`
      : "";

  const prompt = `
You are ${personaDesc}.
Write ONE original ${styleDesc}.

CORE THEMES: ${themesDesc}.
QUALITY: 10-14 words maximum. Output ONLY the final line.
${kanhaCodeTopicInstruction}
${brokenWingsTopicInstruction}

${avoidList}`;

  const topic = await callAI(prompt, null, "text");
  saveUsedTopic(topic, niche.id);
  return topic;
}

export async function generateContentMetadata(topic, nicheId) {
  const niche = NICHES[nicheId] || NICHES.personallinkedin;

  const personaDesc = `${niche.persona.role}. ${niche.persona.experience ? `Experience: ${niche.persona.experience}. ` : ""}Personality: ${(niche.persona.personality || []).join(", ")}. ${niche.persona.expertise ? `Expertise: ${niche.persona.expertise.join(", ")}. ` : ""}Tone: ${niche.persona.communicationStyle?.tone || "professional"}.`;
  const contentStyleDesc = `Structure: ${(niche.contentStyle?.structure || []).join(", ")}. Formats: ${(niche.contentStyle?.formats || []).join(", ")}.`;

  const isKanha = nicheId === "kanhacode";
  const isBrokenWings = nicheId === "broken_wings";
  const isInstagram = isKanha || isBrokenWings;
  const platform = isInstagram ? "Instagram Reel" : "LinkedIn post";

  let lengthGoal = isInstagram ? "100-160 words" : "at least 300+ words";
  let captionInstruction = "CAPTION: 15-22 words punchy overlay text.";
  let postCaptionInstruction = `POST CAPTION: Write a ${isInstagram ? "soulful/relatable" : "comprehensive technical deep-dive"} description (${lengthGoal}). Use detailed paragraphs, multiple sections, and specific examples.`;
  let hashtagInstruction = `HASHTAGS: ${niche.hashtags.join(", ")}`;
  let fewShotsBenchmark = "";
  let musicMoodExample = niche.musicMood.style;

  if (isKanha) {
    lengthGoal = "90-160 words";
    captionInstruction =
      "CAPTION: 16-28 words for the image/video overlay. Write a powerful, scroll-stopping decode of a Gita principle for a modern human struggle. It must be profound, practical, screenshot-worthy, and calming (e.g. 'You are exhausted not from doing the work, but from trying to control an outcome you were never promised.'). No hashtags, emojis, or quotation marks.";
    postCaptionInstruction =
      `POST CAPTION: Write a transformative, highly save-worthy 90-160 word Instagram caption following the KanhaCode 4-part structure:
1. HOOK: One powerful sentence highlighting a relatable human emotion or modern struggle (overthinking, exam/career stress, fear of failure, burnout, attachment, ego, social media comparison).
2. TEACHING (GITA PRINCIPLE DECODED): In 2-3 short, grounded paragraphs, explain what Krishna / the Gita teaches (provide accurate Chapter.Verse like 'Bhagavad Gita 2.47' if applicable). Explain like a wise, calm, modern friend.
3. MODERN APPLICATION: 1-2 tangible, practical actions the reader can actually do today (e.g., 'Put 100% of your energy into the input. Stop mentally living in the result.').
4. MEMORABLE TAKEAWAY & SUBTLE CTA: End with one unforgettable one-liner (e.g. 'Control your action. Release your obsession with the outcome.') followed by a subtle CTA (e.g. 'Save this reminder for the next time your mind starts overthinking.').

STRICT REQUIREMENTS FOR KANHACODE:
- NEVER generate memes, comedy, jokes, double-meaning, sarcasm, vulgarity, or cheap engagement bait.
- NEVER invent fake teachings or fake Sanskrit verses.
- Keep tone warm, grounded, intelligent, simple, and emotionally powerful.
- Focus on practical application: Ancient wisdom + modern problems + actionable life code.`;
    hashtagInstruction = `HASHTAGS: Select 5-10 relevant hashtags from: ${niche.hashtags.join(", ")}`;
    musicMoodExample = "soulful_devotional";

    fewShotsBenchmark = `KANHACODE VIRAL BENCHMARK:
- OVERLAY CAPTION EXAMPLE: "You're exhausted not from doing the work, but from trying to control an outcome you were never promised."
- POST CAPTION EXAMPLE: "Most of your mental fatigue doesn't come from your effort—it comes from mentally living in tomorrow's result.\\n\\nIn Bhagavad Gita 2.47, Krishna gives us the ultimate operating rule for life: You have a right to your actions, but never to the fruits of your actions. When you obsess over the outcome—the praise, the exam score, the promotion, or the other person's response—you scatter your energy before the work is even done.\\n\\nModern application:\\n1. Put 100% of your focus into the input.\\n2. Release 100% of your anxiety about the result.\\n\\nControl your action. Surrender the outcome.\\n\\nSave this reminder for the next time your mind begins to overthink."
- IMAGE SEARCH QUERY: Provide 4-8 concrete English keywords for serene, aesthetic visual imagery. Describe Krishna aesthetic, glowing golden light, divine peacock feather motif, peaceful bansuri flute silhouette, temple mist, cosmic blue dawn. Clean negative space for text overlay.
- MUSIC SEARCH QUERY: Provide a specific best trending slow Krishna devotional song title, slowed+reverb track, or divine instrumental flute/bansuri melody from top YouTube channels (e.g. T-Series Bhakti Sagar, Spiritual Mantra, Saregama Bhakti, Divine Melodies, Rajshri Soul) whose emotional vibe matches THIS quote's teaching. Examples: "Radha Krishna serial flute theme instrumental", "Achyutam Keshavam Vishal Mishra slowed reverb", "Mann Mohana slow version", "Kishori Kuch Aisa Intazam Kar Do slowed", "Mere Kanha slow soulful", "Radhe Radhe Jubin Nautiyal slow", "Krishna bansuri flute meditation instrumental", "Shri Krishna Govind Hare Murari slowed", "Madhurashtakam flute instrumental", "Woh Kisna Hai slow flute instrumental". Pick the best slow, latest soulful song or peaceful flute/bansuri instrumental for deep calm and spiritual resonance.`;
  }

  if (isBrokenWings) {
    lengthGoal = "160-240 words";
    captionInstruction =
      "CAPTION: 18-32 words for the image overlay. Write a breathtaking, deeply poignant quote (2-4 lines). It must be emotionally arresting, deeply relatable, screenshot-worthy, and poetic—the kind of quote people immediately save to their story or send to someone without saying a word. No hashtags, emojis, or quotation marks.";
    postCaptionInstruction =
      `POST CAPTION: Write an emotionally gripping 160-240 word Instagram caption structured into 3 short, powerful paragraphs:
1. THE SCROLL-STOPPING TRUTH: Open with an intimate, vulnerable observation that cuts straight to the core human feeling.
2. THE UNTOLD HUMAN REALITY: Describe the specific micro-moments people experience in secret—the silent compromise, the unreciprocated warmth, the heavy realization of masking pain, or the quiet ache of fading connections.
3. THE RECLAMATION & QUIET PEACE: Turn the heavy emotion into self-compassion, emotional maturity, profound dignity, and peaceful acceptance.
4. REFLECTIVE PROMPT: End with one gentle, non-cliché question or save prompt (e.g. 'Drop a 🤍 if your soul needed this reminder tonight.' or 'Have you ever had to walk away from something you truly wanted, just to protect your peace?') to invite genuine reflection and saves.`;
    hashtagInstruction = `HASHTAGS: Select 5-8 top-performing hashtags from: ${niche.hashtags.join(", ")}`;
    musicMoodExample = "melancholic";

    fewShotsBenchmark = `being VIRAL INSTAGRAM BENCHMARK:
- OVERLAY CAPTION EXAMPLE: "You didn't lose them because you weren't enough. You lost them because you gave everything to someone who didn't know what to do with a full heart."
- POST CAPTION EXAMPLE: "The hardest exhaustion isn't in your body—it's in your soul from carrying conversations, relationships, and promises all by yourself.\\n\\nWe often stay too long not because we don't see the truth, but because we keep hoping the version of them we fell in love with will come back. You start making excuses for the lack of effort, shrinking your own needs just to fit into the spaces they leave behind. But one day, you wake up and realize that begging for warmth from someone who only gives coldness is slowly dimming your own light.\\n\\nWalking away isn't giving up. It's the quiet, dignified moment when you finally decide that your peace of mind is worth more than someone's half-hearted presence.\\n\\nDrop a 🤍 if this resonated with you tonight. Save this for the days when you need reminding of your own worth."
- IMAGE SEARCH QUERY: Provide 4-8 concrete English keywords for atmospheric, cinematic 35mm film photography. Describe a solitary contemplative human subject, beautiful natural lighting (e.g., rainy window bokeh, warm twilight blue hour, soft indoor lamp shadow, foggy street silhouette, coastal horizon). Keep clean negative space for typography overlay.
- MUSIC SEARCH QUERY: Provide a specific emotional Hindi/Bollywood song title or artist pairing with vocals matching the vibe (e.g. "Agar Tum Saath Ho Arijit Singh", "Channa Mereya Arijit Singh", "Tujhe Bhula Diya song", "Baarishein Anuv Jain", "Tune Jo Na Kaha Mohit Chauhan", "Arijit Singh heartbreak song", "Atif Aslam sad Hindi song", "KK sad song official", "B Praak emotional song"). Do NOT request instrumental, flute, or background meditation music.`;
  }

  const structurePrompt = isInstagram
    ? `Write the content directly. DO NOT include any labels like "THE SOUL:", "THE CALL:", or step numbering in the output.`
    : `
0. TITLE: Start with the TOPIC as a bold headline. Make it attention-grabbing and specific.

1. THE CONTEXT: (2-3 sentences) Set the scene with a real-world scenario or historical context. Why does this topic matter in modern backend engineering? What problem does it solve?

2. THE ARCHITECTURE: (4-6 sentences) Deep dive into the technical stack or pattern involved. Explain how it works, the trade-offs, and when you'd use it. Include specific technology choices and why they matter.

3. THE INCIDENT: (5-8 sentences) A realistic, detailed story of how this manifests in a high-traffic production environment. Include specific metrics (throughput, latency, error rates), the exact sequence of events, and the cascading failures. Make it visceral and detailed.

4. THE AFTERMATH: (3-4 sentences) Describe what happened after the incident - the debugging process, the discovery moment, and the immediate damage control. Include any humorous or tragic details that make it memorable.

5. THE LESSON: (4-6 sentences) Senior-level takeaways on scalability, maintainability, engineering culture, and prevention. Include principles, patterns, and best practices learned. Connect it back to broader architectural decisions.

6. THE GOTCHAS: (3-4 sentences) Specific pitfalls people commonly miss with this pattern. Share warnings and edge cases that aren't obvious.

7. THE ENGAGEMENT: (2-3 sentences) A complex, thought-provoking architectural question for the community. Encourage specific experiences and war stories in the comments.`;

  const prompt = `
You are ${personaDesc}. Create a high-value ${platform} based on this TOPIC: "${topic}"

STYLE: ${contentStyleDesc}
${captionInstruction}

${postCaptionInstruction} 
Structure it as: ${structurePrompt}

IMPORTANT GUIDELINES FOR POST CAPTION:
- Write in rich, detailed paragraphs. Avoid bullet points.
- Include specific examples, metrics, code patterns, or concrete scenarios.
- Each section should be substantial (3-6 sentences minimum).
- Use transitions between sections to create narrative flow.
- Add personal insights and hard-won wisdom from experience.
- Make every sentence valuable and thought-provoking.
- Aim for the full ${lengthGoal} target length with no filler.

Use ${isBrokenWings ? "simple, intimate, emotionally precise language" : isKanha ? "warm, thoughtful, grounded, modern, and practical wisdom language" : "short paragraphs, rich technical jargon,"} and a tone of '${isBrokenWings ? "a compassionate late-night storyteller" : isKanha ? "a wise, calm, modern friend decoding ancient wisdom" : "battle-hardened engineer"}'.
${hashtagInstruction}

FONT SELECTION:
Dynamically choose the most visually fitting, modern typography font pairing for this post:
- "topic_font_family": e.g. "Figtree", "Inter", "Space Grotesk", "Outfit", "Plus Jakarta Sans", "Syne"
- "body_font_family": e.g. "Figtree", "Georgia", "Playfair Display", "Merriweather", "Lora", "Inter"

OUTPUT: Return ONLY valid JSON. Ensure NO literal newlines exist in strings; use \\n instead.
{
  "caption": "...",
  "post_caption": "...",
  "topic": "${topic}",
  "filename": "e.g. circuit_breaker.ts",
  "text_placement": "${niche.visuals?.typography?.textPlacement || "center"}",
  "music_mood": "${musicMoodExample}",
  "music_search_query": "...",
  "image_search_query": "...",
  "topic_font_family": "Figtree",
  "body_font_family": "Figtree",
  "hashtags": "...",
  "text_color": "${niche.visuals?.typography?.textColor || "#FFFFFF"}"
}`;
  const result = await callAI(prompt, null, "json");
  if (result && typeof result === "object") {
    const cleanLabel = (str) => {
      if (typeof str !== "string") return str;
      return str
        .replace(/^(?:\d+\.\s*)?THE SOUL:\s*/i, "")
        .replace(/^(?:\d+\.\s*)?THE CALL:\s*/i, "")
        .replace(/THE SOUL:/gi, "")
        .replace(/THE CALL:/gi, "")
        .trim();
    };
    if (result.caption) result.caption = cleanLabel(result.caption);
    if (result.post_caption)
      result.post_caption = cleanLabel(result.post_caption);
  }
  return result;
}

export async function analyzeImageContent(imageBuffer) {
  const prompt = `Analyze this image and generate structured data for a social media Reel.
1. Understand: Subject, Mood, Composition.
2. Generate Caption: Catchy overlay caption (max 12 words).
3. Generate Details: Write a mini-blog post description (100+ words) and provide 25-30 hashtags.
4. Style: suggest text placement, font style, and color.
5. Music: Recommend mood.

Return ONLY JSON:
{
  "caption": "...",
  "post_caption": "...",
  "hashtags": ["...", "..."],
  "mood": "...",
  "text_placement": "center",
  "style": { "font_style": "bold", "text_color": "#FFFFFF" },
  "music": { "music_mood": "upbeat" }
}`;
  return await callAI(prompt, imageBuffer, "json");
}

export async function optimizeSearchQuery(topic, nicheId) {
  const isSad = nicheId === "broken_wings";
  const isKanha = nicheId === "kanhacode";
  const styleHint = isSad
    ? "FOCUS ON: cinematic 35mm film photography, analog mood, moody night city bokeh, soft rain on glass, solitary contemplative silhouette, warm cozy indoor lamp light, twilight blue hour, deep shadows with clean negative space."
    : isKanha
    ? "FOCUS ON: divine Krishna aesthetic, golden dawn mist, peacock feather subtle motif, serene temple architecture, cosmic blue atmosphere, meditative calmness."
    : "FOCUS ON: cinematic stock footage, mood, tension, environment, or symbolic energy.";

  const prompt = `
Convert this TOPIC into 3 precise, high-converting image search queries for premium stock photography.
TOPIC: "${topic}"
STYLE: ${styleHint}
RULES: 2-5 words each.${isSad ? " For 'being', queries MUST describe real-life atmospheric scenes (e.g., 'night street lamp bokeh', 'rainy window silhouette', '35mm film portrait soft lighting', 'solitary figure twilight blue hour', 'cozy dimly lit room lamp')." : isKanha ? " For KanhaCode, queries should focus on serene Krishna aesthetic, golden spiritual lighting, or meditative calmness." : ""}
OUTPUT FORMAT: query1, query2, query3`;

  return await callAI(prompt, null, "text");
}

async function callAI(prompt, imageBuffer = null, type = "json") {
  const hasImage = !!imageBuffer?.length;
  const clean = (text) =>
    type === "json"
      ? extractJson(text)
      : text.trim().replace(/^["']|["']$/g, "");

  const messages = [
    {
      role: "user",
      content: prompt,
      ...(hasImage && { images: [imageBuffer.toString("base64")] }),
    },
  ];

  try {
    const response = await ollama.chat({
      model: PRIMARY_MODEL,
      messages,
      ...(type === "json" && { format: "json" }),
      options: {
        temperature: 0.7,
        num_predict: type === "json" ? 6000 : 1000,
        top_p: 0.9,
        repeat_penalty: 1.1,
      },
    });
    return clean(response.message.content);
  } catch (error) {
    const parts = [{ text: prompt }];
    if (hasImage) {
      parts.push({
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType: "image/jpeg",
        },
      });
    }

    try {
      const result = await ai.models.generateContent({
        model: FALLBACK_MODEL,
        contents: [{ role: "user", parts }],
        config: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: type === "json" ? 6000 : 1000,
          responseMimeType: type === "json" ? "application/json" : "text/plain",
        },
      });
      return clean(result.text);
    } catch (err) {
      console.error("[Gemini AI] Call failed:", err.message);
      throw err;
    }
  }
}

function extractJson(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return JSON.parse(text);
  } catch (e) {
    const cleaned = text.replace(/```json|```/g, "").trim();
    try {
      return JSON.parse(cleaned);
    } catch (err) {
      console.error("JSON Parse Failed:", cleaned);
      throw err;
    }
  }
}
