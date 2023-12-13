const ObeliskHosts = Object.freeze({
  prod: process.env.OBELISK_HOST,
  local: "http://localhost"
})

const ObeliskApi = Object.freeze({
  HOST: ObeliskHosts.prod,

  GOOGLE_BARD: "/parrot/v1/google:bard",
  GEMINI_PRO_VISION: "/parrot/v1/google:geminiVision",

  SUMMARIZE_WEBPAGES: "/flamingo/v1/web:summarize"
})

module.exports = {
  ObeliskApi,
  ObeliskHosts
}