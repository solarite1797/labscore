const { Hosts } = require('../api/endpoints')

// Add static brand icons here
// Update the revision id to break discord cache
const Statics = Object.freeze({
  brands: {
    applemaps: {
      file: "brands/applemaps.png",
      revision: 1
    },
    bing: {
      file: "brands/bing.png",
      revision: 0
    },
    emojipedia: {
      file: "brands/emojipedia.png",
      revision: 2
    },
    genius: {
      file: "brands/genius.png",
      revision: 0
    },
    google: {
      file: "brands/google.png",
      revision: 0
    },
    inferkit: {
      file: "brands/inferkit.png",
      revision: 0
    },
    inspirobot: {
      file: "brands/inspirobot.png",
      revision: 0
    },
    labscore: {
      file: "brands/labscore.png",
      revision: 0
    },
    makesweet: {
      file: "brands/makesweet.png",
      revision: 0
    },
    openai: {
      file: "brands/openai.png",
      revision: 0
    },
    openweathermap: {
      file: "brands/openweathermap.png",
      revision: 0
    },
    perspectiveapi: {
      file: "brands/perspectiveapi.png",
      revision: 0
    },
    photofunia: {
      file: "brands/photofunia.png",
      revision: 1
    },
    quora: {
      file: "brands/quora.png",
      revision: 1
    },
    reddit: {
      file: "brands/reddit.png",
      revision: 0
    },
    tineye: {
      file: "brands/tineye.png",
      revision: 1
    },
    urbandictionary: {
      file: "brands/urbandictionary.png",
      revision: 2
    },
    wikihow: {
      file: "brands/wikihow.png",
      revision: 1
    },
    wikipedia: {
      file: "brands/wikipedia.png",
      revision: 1
    },
    wolframalpha: {
      file: "brands/wolframalpha.png",
      revision: 2
    },
    youtube: {
      file: "brands/youtube.png",
      revision: 2
    }
  },
  icons: {
    adult: {
      file: "icons/core/ico_notice_nsfw.png",
      revision: 0
    },
    error: {
      file: "icons/core/ico_notice_error.png",
      revision: 0
    },
    loading: {
      file: "icons/core/ico_notice_loading.gif",
      revision: 0
    },
    warning: {
      file: "icons/core/ico_notice_warning.png",
      revision: 0
    }
  }
})

function staticAsset(static) {
  return Hosts.statics + `assets/` + static.file + "?r=" + static.revision
}

module.exports.STATICS = Object.freeze({
  applemaps: staticAsset(Statics.brands.applemaps),
  bing: staticAsset(Statics.brands.bing),
  genius: staticAsset(Statics.brands.genius),
  google: staticAsset(Statics.brands.google),
  emojipedia: staticAsset(Statics.brands.emojipedia),
  inferkit: staticAsset(Statics.brands.inferkit),
  inspirobot: staticAsset(Statics.brands.inspirobot),
  labscore: staticAsset(Statics.brands.labscore),
  makesweet: staticAsset(Statics.brands.makesweet),
  openai: staticAsset(Statics.brands.openai),
  openweathermap: staticAsset(Statics.brands.openweathermap),
  perspectiveapi: staticAsset(Statics.brands.perspectiveapi),
  photofunia: staticAsset(Statics.brands.photofunia),
  quora: staticAsset(Statics.brands.quora),
  reddit: staticAsset(Statics.brands.reddit),
  tineye: staticAsset(Statics.brands.tineye),
  urbandictionary: staticAsset(Statics.brands.urbandictionary),
  wikihow: staticAsset(Statics.brands.wikihow),
  wikipedia: staticAsset(Statics.brands.wikipedia),
  wolframalpha: staticAsset(Statics.brands.wolframalpha),
  youtube: staticAsset(Statics.brands.youtube),
  embedSpacerInvite: staticAsset({
    file: "misc/embed-spacer-botinvite.png",
    revision: 0
  })
})

module.exports.STATIC_ICONS = Object.freeze({
  adult: staticAsset(Statics.icons.adult),
  error: staticAsset(Statics.icons.error),
  loading: staticAsset(Statics.icons.loading),
  warning: staticAsset(Statics.icons.warning)
})