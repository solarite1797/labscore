const ObeliskHosts = Object.freeze({
  prod: process.env.OBELISK_HOST,
  local: "http://localhost"
})

const ObeliskApi = Object.freeze({
  HOST: ObeliskHosts.prod,

  GOOGLE_BARD: "/parrot/v1/google:bard",
  GOOGLE_GEMINI_PRO: "/parrot/v1/google:gemini",
  GOOGLE_GEMINI_PRO_VISION: "/parrot/v1/google:geminiVision",
  GOOGLE_PALM2: "/parrot/v1/google:palm2",

  OPENAI_CHATGPT: "/parrot/v1/openai:chatgpt",
  OPENAI_GPT4: "/parrot/v1/openai:gpt4",

  WEB_ASK: "/flamingo/v1/web:ask",
  SUMMARIZE_WEBPAGES: "/flamingo/v1/web:summarize",
  
  AI_WALLPAPER: "/robin/v1/wallpaper:generate",
  
  WEBSHOT: "/peacock/v1/screenshot",
})

module.exports = {
  ObeliskApi,
  ObeliskHosts
}