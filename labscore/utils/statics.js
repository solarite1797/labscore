const { Hosts } = require('../api/endpoints')

// Add static brand icons here
// Update the revision id to break discord cache
const Statics = Object.freeze({
  assets: {
    chat_loading: {
      file: "loading/05_chat_loading.7y2ji893rho0.gif",
      revision: 0
    },
    image_loading: {
      file: "loading/image_loading_splash.2elegsql1j8k.png",
      revision: 1
    },
    embed_invite_spacer: {
      file: "misc/embed-spacer-botinvite.png",
      revision: 0
    },
    emoji_placeholder: {
      file: "misc/emoji-placeholder.png",
      revision: 0
    },
  },
  brands: {
    anthropic: {
      file: "brands/anthropic.png",
      revision: 1
    },
    applemaps: {
      file: "brands/applemaps.png",
      revision: 2
    },
    bard: {
      file: "brands/bard.png",
      revision: 1
    },
    bing: {
      file: "brands/bing.png",
      revision: 1
    },
    chatgpt: {
      file: "brands/chatgpt.png",
      revision: 1
    },
    emojipedia: {
      file: "brands/emojipedia.png",
      revision: 3
    },
    genius: {
      file: "brands/genius.png",
      revision: 1
    },
    google: {
      file: "brands/google.png",
      revision: 2
    },
    inferkit: {
      file: "brands/inferkit.png",
      revision: 1
    },
    inspirobot: {
      file: "brands/inspirobot.png",
      revision: 1
    },
    labscore: {
      file: "brands/labscore.png",
      revision: 2
    },
    makesweet: {
      file: "brands/makesweet.png",
      revision: 1
    },
    musixmatch: {
      file: "brands/musixmatch.png",
      revision: 1
    },
    openai: {
      file: "brands/openai.png",
      revision: 1
    },
    openweathermap: {
      file: "brands/openweathermap.png",
      revision: 1
    },
    perspectiveapi: {
      file: "brands/perspectiveapi.png",
      revision: 2
    },
    photofunia: {
      file: "brands/photofunia.png",
      revision: 2
    },
    quora: {
      file: "brands/quora.png",
      revision: 3
    },
    reddit: {
      file: "brands/reddit.png",
      revision: 2
    },
    tineye: {
      file: "brands/tineye.png",
      revision: 2
    },
    urbandictionary: {
      file: "brands/urbandictionary.png",
      revision: 3
    },
    weather: {
      file: "brands/weather.png",
      revision: 4
    },
    wikihow: {
      file: "brands/wikihow.png",
      revision: 2
    },
    wikipedia: {
      file: "brands/wikipedia.png",
      revision: 2
    },
    wolframalpha: {
      file: "brands/wolframalpha.png",
      revision: 4
    },
    youtube: {
      file: "brands/youtube.png",
      revision: 4
    }
  },
  icons: {
    adult: {
      file: "icons/core/ico_notice_nsfw.png",
      revision: 3
    },
    error: {
      file: "icons/core/ico_notice_error.png",
      revision: 3
    },
    loading: {
      file: "icons/core/ico_notice_loading.gif",
      revision: 0
    },
    ai: {
      file: "icons/core/ico_notice_ai_spark.gif",
      revision: 0
    },
    ai_bard: {
      file: "_gemini/sparkle_loading.1vyhrt70l.gif",
      revision: 2
    },
    ai_bard_idle: {
      file: "_gemini/sparkle_idle.f69fp0vrp.gif",
      revision: 1
    },
    ai_clyde: {
      file: "brands/_clyde/clyde_generating.gif",
      revision: 0
    },
    ai_clyde_idle: {
      file: "brands/_clyde/clyde.png",
      revision: 0
    },
    ai_gemini: {
      file: "icons/aiv2/gemini_spark.png",
      revision: 0
    },
    ai_palm_idle: {
      file: "icons/core/ico_notice_palm_idle.png",
      revision: 0
    },
    ai_summary: {
      file: "icons/flamingo/web_summary.png",
      revision: 1
    },
    ai_image: {
      file: "icons/flamingo/image_generation.png",
      revision: 2
    },
    ai_image_processing: {
      file: "icons/flamingo/image_processing.gif",
      revision: 0
    },
    warning: {
      file: "icons/core/ico_notice_warning.png",
      revision: 3
    }
  }
})

function staticAsset(static) {
  return Hosts.statics + `assets/` + static.file + "?r=" + static.revision
}

module.exports.STATICS = Object.freeze({
  anthropic: staticAsset(Statics.brands.anthropic),
  applemaps: staticAsset(Statics.brands.applemaps),
  bard: staticAsset(Statics.brands.bard),
  bing: staticAsset(Statics.brands.bing),
  chatgpt: staticAsset(Statics.brands.chatgpt),
  genius: staticAsset(Statics.brands.genius),
  google: staticAsset(Statics.brands.google),
  emojipedia: staticAsset(Statics.brands.emojipedia),
  inferkit: staticAsset(Statics.brands.inferkit),
  inspirobot: staticAsset(Statics.brands.inspirobot),
  labscore: staticAsset(Statics.brands.labscore),
  makesweet: staticAsset(Statics.brands.makesweet),
  musixmatch: staticAsset(Statics.brands.musixmatch),
  openai: staticAsset(Statics.brands.openai),
  openweathermap: staticAsset(Statics.brands.openweathermap),
  perspectiveapi: staticAsset(Statics.brands.perspectiveapi),
  photofunia: staticAsset(Statics.brands.photofunia),
  quora: staticAsset(Statics.brands.quora),
  reddit: staticAsset(Statics.brands.reddit),
  tineye: staticAsset(Statics.brands.tineye),
  urbandictionary: staticAsset(Statics.brands.urbandictionary),
  weather: staticAsset(Statics.brands.weather),
  wikihow: staticAsset(Statics.brands.wikihow),
  wikipedia: staticAsset(Statics.brands.wikipedia),
  wolframalpha: staticAsset(Statics.brands.wolframalpha),
  youtube: staticAsset(Statics.brands.youtube)
})

module.exports.STATIC_ICONS = Object.freeze({
  adult: staticAsset(Statics.icons.adult),
  error: staticAsset(Statics.icons.error),
  loading: staticAsset(Statics.icons.loading),
  ai: staticAsset(Statics.icons.ai),
  ai_bard: staticAsset(Statics.icons.ai_bard),
  ai_bard_idle: staticAsset(Statics.icons.ai_bard_idle),
  ai_clyde: staticAsset(Statics.icons.ai_clyde),
  ai_clyde_idle: staticAsset(Statics.icons.ai_clyde_idle),
  ai_gemini: staticAsset(Statics.icons.ai_gemini),
  ai_palm_idle: staticAsset(Statics.icons.ai_palm_idle),
  ai_summary: staticAsset(Statics.icons.ai_summary),
  ai_image: staticAsset(Statics.icons.ai_image),
  ai_image_processing: staticAsset(Statics.icons.ai_image_processing),
  warning: staticAsset(Statics.icons.warning)
})

module.exports.STATIC_ASSETS = Object.freeze({
  chat_loading: staticAsset(Statics.assets.chat_loading),
  image_loading: staticAsset(Statics.assets.image_loading),
  embed_invite_spacer: staticAsset(Statics.assets.embed_invite_spacer),
  emoji_placeholder: staticAsset(Statics.assets.emoji_placeholder)
})