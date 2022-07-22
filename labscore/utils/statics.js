const { Hosts } = require('../api/endpoints')

// Add static brand icons here
// Update the revision id to break discord cache
const Statics = Object.freeze({
  brands: {
    bing: {
      file: "brands/bing.png",
      revision: 0
    },
    emojipedia: {
      file: "brands/emojipedia.png",
      revision: 1
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
    makesweet: {
      file: "brands/makesweet.png",
      revision: 0
    },
    photofunia: {
      file: "brands/photofunia.png",
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
    wolframalpha: {
      file: "brands/wolframalpha.png",
      revision: 1
    },
    youtube: {
      file: "brands/youtube.png",
      revision: 1
    }
  },
  icons: {
    adult: {
      file: "icons/ico_nsfw_small.png",
      revision: 0
    },
    error: {
      file: "icons/ico_error_small.png",
      revision: 0
    },
    loading: {
      file: "icons/ico_loading_small.gif",
      revision: 0
    },
    warning: {
      file: "icons/ico_warning_small.png",
      revision: 0
    }
  }
})

function staticAsset(static) {
  return Hosts.statics + `assets/` + static.file + "?r=" + static.revision
}

module.exports.STATICS = Object.freeze({
  bing: staticAsset(Statics.brands.bing),
  genius: staticAsset(Statics.brands.genius),
  google: staticAsset(Statics.brands.google),
  emojipedia: staticAsset(Statics.brands.emojipedia),
  inferkit: staticAsset(Statics.brands.inferkit),
  makesweet: staticAsset(Statics.brands.makesweet),
  photofunia: staticAsset(Statics.brands.photofunia),
  reddit: staticAsset(Statics.brands.reddit),
  tineye: staticAsset(Statics.brands.tineye),
  urbandictionary: staticAsset(Statics.brands.urbandictionary),
  wikihow: staticAsset(Statics.brands.wikihow),
  wolframalpha: staticAsset(Statics.brands.wolframalpha),
  youtube: staticAsset(Statics.brands.youtube)
})

module.exports.STATIC_ICONS = Object.freeze({
  adult: staticAsset(Statics.icons.adult),
  error: staticAsset(Statics.icons.error),
  loading: staticAsset(Statics.icons.loading),
  warning: staticAsset(Statics.icons.warning)
})