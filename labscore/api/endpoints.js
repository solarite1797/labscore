const Hosts = Object.freeze({
  prod: "https://labscore-v2.vercel.app",
  local: "http://localhost:3000",
  emoji: "https://derpystuff.gitlab.io/webstorage3/container/",
  statics: "https://derpystuff.gitlab.io/webstorage4/v2/"
})

const Api = Object.freeze({
  HOST: Hosts.prod,

  GOOGLE_PERSPECTIVE: '/google/perspective/analyze',
  GOOGLE_TRANSLATE: '/google/translate/text',
  GOOGLE_VISION_COLORS: '/google/vision/colors',
  GOOGLE_VISION_FACES: '/google/vision/faces',
  GOOGLE_VISION_LABELS: '/google/vision/labels',
  GOOGLE_VISION_OCR: '/google/vision/ocr',
  GOOGLE_VISION_SAFETY_LABELS: '/google/vision/safety',
  GOOGLE_VISION_WEBDETECTION: '/google/vision/webdetection',

  IMAGE_DEEPDREAM: '/image/deepdream',
  IMAGE_SUPERRESOLUTION: '/image/superresolution',
  IMAGE_TEXT2IMAGE: '/image/text2image',
  IMAGE_WAIFU2X: '/image/waifu2x',

  PHOTOFUNIA_RETRO_WAVE: '/photofunia/retro-wave',
  PHOTOFUNIA_YACHT: '/photofunia/yacht',

  SEARCH_AUDIO: '/search/audio',
  SEARCH_BING: '/search/bing',
  SEARCH_BING_IMAGES: '/search/bing-images',
  SEARCH_DICTIONARY: '/search/dictionary',
  SEARCH_GOOGLE: '/search/google',
  SEARCH_GOOGLE_IMAGES: '/search/google-images',
  SEARCH_LYRICS: '/search/lyrics',
  SEARCH_REDDIT: '/search/reddit',
  SEARCH_RULE34: '/search/booru',
  SEARCH_TINEYE: '/search/tineye',
  SEARCH_URBANDICTIONARY: '/search/urbandictionary',
  SEARCH_WIKIHOW: '/search/wikihow',
  SEARCH_WOLFRAM_ALPHA: '/search/wolfram-alpha',
  SEARCH_YOUTUBE: '/search/youtube',

  TTS_IMTRANSLATOR: '/tts/imtranslator',
  TTS_POLLY: '/tts/polly',
  TTS_TIKTOK: '/tts/tiktok',
  TTS_VOICEFORGE: '/tts/voiceforge',

  UTILS_INFERKIT: '/utils/inferkit',
  UTILS_SCREENSHOT: '/utils/screenshot',
})

const Static = Object.freeze({
  HOST: Hosts.emoji,

  TWITTER: (codepoint) => { return `twemoji-JedKxRr7RNYrgV9Sauy8EGAu/${codepoint}.png` },
  FLUENT: (codepoint) => { return `fluent-6vbne6euaxy2y9f98iub2xtr/${codepoint}.png` },
  //APPLE: (codepoint) => { return `twemoji-JedKxRr7RNYrgV9Sauy8EGAu/${codepoint}.png` }, // TODO: host these in-house
  MICROSOFT: (codepoint) => { return `microsoft-ZzRAzYE6LgxVTrQ5rvL7nLyC/${codepoint}.png` },
  EMOJIONE: (codepoint) => { return `emojione-XghVAypW8jttjFL2tQFb2z7n/${codepoint}.png` },
  GOOGLE: (codepoint) => { return `google-tqzSNjYw8MVMYfSBLTLTFgmw/${codepoint}.png` },
  BLOBS: (codepoint) => { return `blobs-KpDmEXYD3VTC2VT6PSQAc99y/${codepoint}.png` }
})

module.exports = {
  Api,
  Static,
  Hosts
}