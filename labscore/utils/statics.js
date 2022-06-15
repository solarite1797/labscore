const { Hosts } = require('../api/endpoints')

// Add static brand icons here
// Update the revision id to break discord cache
const Statics = Object.freeze({
  brands: {
    bing: {
      file: "brands/bing.png",
      revision: 0
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
  }
})

function staticAsset(static) {
  return Hosts.statics + `assets/` + static.file + "?r=" + static.revision
}

module.exports.STATICS = Object.freeze({
  bing: staticAsset(Statics.brands.bing),
  genius: staticAsset(Statics.brands.genius),
  google: staticAsset(Statics.brands.google),
  inferkit: staticAsset(Statics.brands.inferkit),
  makesweet: staticAsset(Statics.brands.makesweet),
  photofunia: staticAsset(Statics.brands.photofunia),
  tineye: staticAsset(Statics.brands.tineye),
  urbandictionary: staticAsset(Statics.brands.urbandictionary),
  wikihow: staticAsset(Statics.brands.wikihow),
  wolframalpha: staticAsset(Statics.brands.wolframalpha),
  youtube: staticAsset(Statics.brands.youtube)
})