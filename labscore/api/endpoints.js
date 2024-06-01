const Hosts = Object.freeze({
  prod: "https://labscore-v2.vercel.app",
  local: "http://localhost",
  statics: "https://bignutty.gitlab.io/webstorage4/v2/"
})

const Api = Object.freeze({
  HOST: Hosts.prod,

  GOOGLE_PERSPECTIVE: '/google/perspective/analyze',
  GOOGLE_SPEECH_RECOGNIZE: '/google/speech/recognize',
  GOOGLE_SPEECH_RECOGNIZE_LABELS: '/google/speech/multirecognize',
  GOOGLE_TRANSLATE: '/google/translate/text',
  GOOGLE_VISION_COLORS: '/google/vision/colors',
  GOOGLE_VISION_FACES: '/google/vision/faces',
  GOOGLE_VISION_LABELS: '/google/vision/labels',
  GOOGLE_VISION_OCR: '/google/vision/ocr',
  GOOGLE_VISION_SAFETY_LABELS: '/google/vision/safety',
  GOOGLE_VISION_WEBDETECTION: '/google/vision/webdetection',

  IMAGE_INHOUSE_PRIDE: '/image/inhouse/pride',

  IMAGE_DEEPDREAM: '/image/deepai/deepdream',
  IMAGE_IMAGEEDITOR: '/image/deepai/imageedit',
  IMAGE_SUPERRESOLUTION: '/image/deepai/superresolution',
  IMAGE_TEXT2IMAGE: '/image/deepai/text2image',
  IMAGE_WAIFU2X: '/image/deepai/waifu2x',

  PHOTOFUNIA_RETRO_WAVE: '/photofunia/retro-wave',
  PHOTOFUNIA_YACHT: '/photofunia/yacht',

  SEARCH_BING: '/search/bing',
  SEARCH_BING_IMAGES: '/search/bing-images',
  SEARCH_GOOGLE: '/search/google',
  SEARCH_GOOGLE_IMAGES: '/search/google-images',
  SEARCH_LYRICS: '/search/lyrics-v2',
  SEARCH_QUORA: '/search/quora',
  SEARCH_QUORA_RESULT: '/search/quora-result',
  SEARCH_REDDIT: '/search/reddit',
  SEARCH_REVERSE_IMAGE: '/search/reverse-image',
  SEARCH_RULE34: '/search/booru',
  SEARCH_URBANDICTIONARY: '/search/urbandictionary',
  SEARCH_WEATHER: '/search/weather',
  SEARCH_WIKIHOW: '/search/wikihow',
  SEARCH_WOLFRAM_ALPHA: '/search/wolfram-alpha',
  SEARCH_YOUTUBE: '/search/youtube',

  TTS_IMTRANSLATOR: '/tts/imtranslator',
  TTS_MOONBASE: '/tts/moonbase',
  TTS_PLAYHT: '/tts/playht',
  TTS_POLLY: '/tts/polly',
  TTS_SAPI4: '/tts/sapi4',
  TTS_TIKTOK: '/tts/tiktok',

  UTILS_DICTIONARY: '/utils/dictionary-v2',
  UTILS_EMOJIPEDIA: '/utils/emojipedia',
  UTILS_GARFIELD: '/utils/garfield',
  UTILS_INFERKIT: '/utils/inferkit',
  UTILS_MAPKIT: '/utils/mapkit',
  UTILS_OTTER: '/utils/otter',
  UTILS_PERSPECTIVE: '/utils/perspective',
  UTILS_SCREENSHOT: '/utils/screenshot',
  UTILS_TEXTGENERATOR: '/utils/text-generator',
  UTILS_WEATHER: '/utils/weather',
})

module.exports = {
  Api,
  Hosts
}