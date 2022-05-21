const Hosts = Object.freeze({
  prod: "https://vercel-router-test.vercel.app",
  local: "http://localhost:3000",
  emoji: "https://derpystuff.gitlab.io/webstorage3/container/",
  statics: "https://derpystuff.gitlab.io/webstorage4/v2/"
})

const Api = Object.freeze({
  HOST: Hosts.prod,
  
  SEARCH_LYRICS: '/search/lyrics',

  SEARCH_GOOGLE: '/search/google',
  SEARCH_GOOGLE_IMAGES: '/search/google-images',
  SEARCH_BING: '/search/bing',
  SEARCH_BING_IMAGES: '/search/bing-images',

  PHOTOFUNIA_YACHT: '/photofunia/yacht'
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