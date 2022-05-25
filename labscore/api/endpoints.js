const Hosts = Object.freeze({
  prod: "https://vercel-router-test.vercel.app",
  local: "http://localhost:3000",
  emoji: "https://derpystuff.gitlab.io/webstorage3/container/",
  statics: "https://derpystuff.gitlab.io/webstorage4/v2/"
})

const Api = Object.freeze({
  HOST: Hosts.prod,
  
  GOOGLE_VISION_OCR: '/google/vision/ocr',

  SEARCH_LYRICS: '/search/lyrics',

  SEARCH_GOOGLE: '/search/google',
  SEARCH_GOOGLE_IMAGES: '/search/google-images',
  SEARCH_BING: '/search/bing',
  SEARCH_BING_IMAGES: '/search/bing-images',
  SEARCH_WOLFRAM_ALPHA: '/search/wolfram-alpha',
  SEARCH_YOUTUBE: '/search/youtube',

  PHOTOFUNIA_YACHT: '/photofunia/yacht',
  PHOTOFUNIA_RETRO_WAVE: '/photofunia/retro-wave',
  
  IMAGE_DEEPDREAM: '/image/deepdream',
  IMAGE_WAIFU2X: '/image/waifu2x',
  IMAGE_SUPERRESOLUTION: '/image/superresolution',

  INFERKIT: '/utils/inferkit',
})

const Static = Object.freeze({
  HOST: Hosts.emoji,

  TWITTER: (codepoint) => {
    return `twemoji-JedKxRr7RNYrgV9Sauy8EGAu/${codepoint}.png`
  }
})

module.exports = {
  Api,
  Static,
  Hosts
}