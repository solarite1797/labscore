const ObeliskHosts = Object.freeze({
  prod: process.env.OBELISK_HOST,
  local: "http://localhost"
})

const ObeliskApi = Object.freeze({
  HOST: ObeliskHosts.prod,

  // monolith2
  LLM_PRIVATE_BARD: "/llm/v1/_private:bard",
  LLM_MODELS_GENERATE: "/llm/v1/generate",

  GENERATIVEIMAGES_MODELS_IMAGEN: "/generativeimages/v1/models/imagen",

  GOOGLE_BARD: "/parrot/v1/google:bard",
  GOOGLE_GEMINI_PRO: "/parrot/v1/google:gemini",
  GOOGLE_GEMINI_PRO_VISION: "/parrot/v1/google:geminiVision",
  GOOGLE_PALM2: "/parrot/v1/google:palm2",

  OPENAI_CHATGPT: "/parrot/v1/openai:chatgpt",
  OPENAI_GPT4: "/parrot/v1/openai:gpt4",

  WEB_ASK: "/flamingo/v1/web:ask",
  SUMMARIZE_WEBPAGES: "/flamingo/v1/web:summarize",
  
  GENERATE_IMAGEN: "/robin/v1/generate:imagen",
  GENERATE_WALLPAPER: "/robin/v1/generate:wallpaper",
  
  WEBSHOT: "/peacock/v1/screenshot",
  TRANSCRIBE: "/peacock/v1/transcribe",

  WOLFRAM_QUERY: "/wolfram/v1/wolframalpha:query",
})

module.exports = {
  ObeliskApi,
  ObeliskHosts
}