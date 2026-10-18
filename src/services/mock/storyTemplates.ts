import { durationOption } from '@/domain/durations';
import type { ArtTheme, Scene, StoryRequest } from '@/domain/types';

/**
 * PROTOTYPE ONLY. Stories are assembled from hand-written templates so the UI can be
 * reviewed without paid AI providers. They are labelled as templates throughout the UI.
 */

interface ThemeTemplate {
  keywords: string[];
  heroes: Record<string, string>;
  defaultHero: string;
  title: (hero: string) => string;
  /** Eight beats; shorter stories use the opening beats plus the ending. */
  beats: ((hero: string, child: string) => string)[];
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "a small, friendly dragon" → "The Small, Friendly Dragon" */
export function heroTitle(hero: string): string {
  const words = hero.replace(/^an? /, '').split(' ').map((w) => w.split('-').map(cap).join('-'));
  return ['The', ...words].join(' ');
}

export const THEME_TEMPLATES: Record<ArtTheme, ThemeTemplate> = {
  'moonlit-forest': {
    keywords: ['forest', 'wood', 'woods', 'tree', 'trees', 'fox', 'owl', 'bear', 'deer', 'hedgehog', 'badger', 'squirrel'],
    heroes: { fox: 'a little fox', owl: 'a wise young owl', bear: 'a cuddly bear cub', hedgehog: 'a tiny hedgehog', deer: 'a gentle deer' },
    defaultHero: 'a little fox',
    title: (h) => `${heroTitle(h)} and the Silver Moon`,
    beats: [
      (h, c) => `Deep in the Whispering Wood, where the trees hummed lullabies, lived ${h}. One evening, ${c} wandered down the mossy path and heard a soft, friendly hello.`,
      (h) => `“The moon has dropped her silver button,” said ${h}. “Without it, her nightgown won’t stay closed, and she’ll be chilly all night!”`,
      () => `So off they went, past mushrooms that glowed like tiny lanterns and a stream that giggled over its pebbles.`,
      () => `A family of fireflies blinked a trail through the ferns. “Follow the twinkles,” they whispered, “and you’ll find what you’re looking for.”`,
      () => `At the top of Thistle Hill sat an old, kind tortoise, polishing something round and bright. “I was keeping it safe,” she smiled.`,
      (_h, c) => `${c} held the silver button up high, and a moonbeam reached down like a ribbon to carry it home.`,
      () => `The moon fastened her nightgown, and the whole forest glowed softly silver. Every leaf seemed to sigh, “Thank you.”`,
      (h, c) => `Back at the mossy path, ${h} yawned a big, round yawn. “Goodnight, ${c},” it whispered, and the trees hummed their sleepiest song.`,
    ],
  },
  ocean: {
    keywords: ['ocean', 'sea', 'beach', 'whale', 'fish', 'mermaid', 'octopus', 'dolphin', 'turtle', 'shell', 'boat', 'underwater', 'crab'],
    heroes: { whale: 'a gentle blue whale', mermaid: 'a curious mermaid', octopus: 'a clever octopus', dolphin: 'a playful dolphin', turtle: 'a wise old turtle', crab: 'a cheerful crab' },
    defaultHero: 'a gentle blue whale',
    title: (h) => `${heroTitle(h)} and the Song of the Sea`,
    beats: [
      (h, c) => `Where the sea is the colour of blueberries, ${c} met ${h} who had lost the tune of the ocean’s evening song.`,
      () => `“Every night the sea sings the fish to sleep,” it explained, “but tonight the notes have floated away.”`,
      () => `They swam past coral castles in pink and peach, where seahorses bobbed like little question marks.`,
      () => `A shy clam opened just a crack and hummed the very first note — low and warm, like a hug.`,
      () => `A shoal of silver fish swirled into a spiral and sang the middle of the song, bright as bubbles.`,
      (_h, c) => `${c} found the last note tucked inside a seashell, and when they listened closely, it sounded like home.`,
      () => `Together they sang the whole song, and the waves rocked gently, back and forth, back and forth.`,
      (h, c) => `The fish drifted into dreams, and ${h} carried ${c} to the moonlit shore. “Same time tomorrow?” it smiled.`,
    ],
  },
  'sky-castle': {
    keywords: ['dragon', 'castle', 'princess', 'prince', 'knight', 'king', 'queen', 'cloud', 'clouds', 'unicorn', 'wizard', 'magic', 'fairy'],
    heroes: { dragon: 'a small, friendly dragon', unicorn: 'a sparkly unicorn', knight: 'a brave young knight', wizard: 'an apprentice wizard', fairy: 'a tiny fairy', princess: 'a kind princess' },
    defaultHero: 'a small, friendly dragon',
    title: (h) => `${heroTitle(h)} of the Cloud Castle`,
    beats: [
      (h, c) => `High above the hills, on a castle made of clouds, lived ${h} who could only breathe warm, cosy bubbles instead of fire. One morning, ${c} climbed the rainbow stairs to visit.`,
      (h) => `“It’s the Great Cloud Fair today,” said ${h}, “and I’d love to win a ribbon — but everyone else breathes fireworks!”`,
      () => `They practised in the courtyard. The bubbles floated up, shimmering pink and gold, and a passing sparrow gave a little cheer.`,
      () => `At the fair, the cloud-folk gathered. Sparklers fizzed and fireworks popped, and the sky grew very loud indeed.`,
      () => `Then a baby cloud began to cry — all that noise was too much. Nobody knew how to help.`,
      (h, c) => `${c} had an idea. ${cap(h.replace(/^an? /, 'the '))} took a deep breath and blew the softest, warmest bubbles of all.`,
      () => `The bubbles wrapped the baby cloud like a blanket, and its crying turned into a tiny, happy hiccup.`,
      (h, c) => `That evening, ${h} wore a golden ribbon that said “Kindest Breath in the Sky,” and ${c} floated home on a bubble, smiling all the way.`,
    ],
  },
  space: {
    keywords: ['space', 'rocket', 'moon', 'star', 'stars', 'planet', 'planets', 'alien', 'astronaut', 'galaxy', 'comet', 'robot'],
    heroes: { robot: 'a helpful little robot', alien: 'a friendly green alien', astronaut: 'a brave astronaut', rocket: 'a tiny rocket with big dreams', comet: 'a cheerful comet' },
    defaultHero: 'a helpful little robot',
    title: (h) => `${heroTitle(h)} Who Counted the Stars`,
    beats: [
      (h, c) => `Ten, nine, eight… blast off! ${c} zoomed into space with ${h} whose job was to count every single star.`,
      () => `“There are so many,” it beeped, “that I keep losing my place. Will you help me?”`,
      () => `They floated past a planet with rings like a spinning skirt and a moon that smelled faintly of cheese.`,
      () => `A comet whooshed by, waving its sparkly tail. “Try grouping them into pictures!” it called.`,
      () => `So they joined the stars with glowing lines — a teapot here, a sleepy cat there, a kite with a long, wiggly string.`,
      (_h, c) => `${c} drew the brightest picture of all: a heart, right in the middle of the sky.`,
      () => `Now the stars were easy to count, and the whole galaxy twinkled as if it were laughing.`,
      (h, c) => `The rocket floated gently home, and ${h} tucked a tiny star into ${c}’s pocket — a night-light for sweet dreams.`,
    ],
  },
  garden: {
    keywords: ['garden', 'flower', 'flowers', 'bee', 'bees', 'butterfly', 'bunny', 'rabbit', 'ladybird', 'ladybug', 'snail', 'caterpillar', 'picnic'],
    heroes: { bunny: 'a fluffy bunny', rabbit: 'a fluffy bunny', bee: 'a busy bumblebee', butterfly: 'a brand-new butterfly', snail: 'a slow and steady snail', ladybird: 'a spotty ladybird' },
    defaultHero: 'a fluffy bunny',
    title: (h) => `${heroTitle(h)} and the Rainbow Seeds`,
    beats: [
      (h, c) => `In a garden where the sunflowers waved hello, ${c} met ${h} holding a packet of very mysterious seeds.`,
      () => `“The label says Rainbow Seeds,” it whispered, “but nobody knows what will grow!”`,
      () => `They dug a little hole, popped the seeds inside and patted the soil — pat, pat, pat.`,
      () => `A ladybird brought a raindrop, and a bumblebee hummed a growing song: bzzz-bzzz, grow-grow.`,
      () => `By the afternoon, a tiny green shoot poked up and stretched like it had just woken from a nap.`,
      () => `Then — pop, pop, pop! — flowers bloomed in red, orange, yellow, green, blue and purple.`,
      (_h, c) => `Butterflies came from every corner of the garden to see, and ${c} counted them all: one, two, three, a hundred!`,
      (h, c) => `As the sun went down, ${h} and ${c} sat beside the rainbow flowers, which glowed softly, keeping watch all night.`,
    ],
  },
  snow: {
    keywords: ['snow', 'snowman', 'penguin', 'polar', 'ice', 'winter', 'christmas', 'sledge', 'sled', 'arctic', 'reindeer', 'igloo'],
    heroes: { penguin: 'a waddly penguin', polar: 'a polar bear cub', reindeer: 'a young reindeer', snowman: 'a cheerful snowman' },
    defaultHero: 'a waddly penguin',
    title: (h) => `${heroTitle(h)} and the Northern Lights`,
    beats: [
      (h, c) => `In a land where the snow sparkled like sugar, ${c} met ${h} who had never, ever seen the Northern Lights.`,
      () => `“Grandma says they dance across the sky,” it said, “but only for those who look with their whole heart.”`,
      () => `They bundled up in scarves and mittens and crunched across the snow — crunch, crunch, crunch.`,
      () => `A snowy owl showed them the way to Frosty Hill, the highest, quietest place in all the land.`,
      () => `They built a snug snow-seat and shared a flask of warm cocoa that tasted like marshmallow clouds.`,
      () => `They waited, and waited, and looked with their whole hearts…`,
      () => `Then the sky shimmered green and violet and pink, swooping and swirling like ribbons in the wind.`,
      (h, c) => `${cap(h.replace(/^an? /, 'the '))} snuggled close to ${c}. “Now I’ll always remember,” it whispered, as the lights waved goodnight.`,
    ],
  },
};

export const ART_THEMES = Object.keys(THEME_TEMPLATES) as ArtTheme[];

function tokens(text: string): string[] {
  return text.toLowerCase().match(/[a-z]+/g) ?? [];
}

export function pickTheme(prompt: string): ArtTheme {
  const words = tokens(prompt);
  let best: ArtTheme = 'moonlit-forest';
  let bestScore = 0;
  for (const theme of ART_THEMES) {
    const score = words.filter((w) => THEME_TEMPLATES[theme].keywords.includes(w)).length;
    if (score > bestScore) {
      best = theme;
      bestScore = score;
    }
  }
  return best;
}

export function pickHero(prompt: string, theme: ArtTheme): string {
  const t = THEME_TEMPLATES[theme];
  for (const w of tokens(prompt)) {
    const hero = t.heroes[w];
    if (hero) return hero;
  }
  return t.defaultHero;
}

export interface ComposedStory {
  title: string;
  theme: ArtTheme;
  scenes: Scene[];
}

export function composeStory(request: StoryRequest, childName: string, idPrefix: string): ComposedStory {
  const theme = pickTheme(request.prompt);
  const hero = pickHero(request.prompt, theme);
  const template = THEME_TEMPLATES[theme];
  const { sceneCount } = durationOption(request.durationMinutes);
  const beats = template.beats;
  const chosen = sceneCount >= beats.length ? beats : [...beats.slice(0, sceneCount - 1), beats[beats.length - 1]!];
  const sceneSeconds = Math.round((request.durationMinutes * 60) / chosen.length);
  const child = childName.trim() || 'our friend';
  return {
    title: template.title(hero),
    theme,
    scenes: chosen.map((beat, i) => ({
      id: `${idPrefix}_scene_${i + 1}`,
      text: beat(hero, child),
      artVariant: i % 4,
      durationSec: sceneSeconds,
    })),
  };
}
