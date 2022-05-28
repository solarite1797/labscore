const { Hosts } = require('../api/endpoints')

// Add static brand icons here
// Update the revision id to break discord cache
const Statics = Object.freeze({
  brands: {
    photofunia: {
      file: "brands/photofunia.png",
      revision: 1
    },
    genius: {
      file: "brands/genius.png",
      revision: 0
    },
    bing: {
      file: "brands/bing.png",
      revision: 0
    },
    google: {
      file: "brands/google.png",
      revision: 0
    },
    wolframalpha: {
      file: "brands/wolframalpha.png",
      revision: 1
    },
    inferkit: {
      file: "brands/inferkit.png",
      revision: 0
    },
    youtube: {
      file: "brands/youtube.png",
      revision: 1
    },
    urbandictionary: {
      file: "brands/urbandictionary.png",
      revision: 2
    }
  }
})

function staticAsset(static){
  return Hosts.statics + `assets/` + static.file + "?r=" + static.revision
}

module.exports.STATICS = Object.freeze({
  photofunia: staticAsset(Statics.brands.photofunia),
  genius: staticAsset(Statics.brands.genius),
  bing: staticAsset(Statics.brands.bing),
  google: staticAsset(Statics.brands.google),
  wolframalpha: staticAsset(Statics.brands.wolframalpha),
  inferkit: staticAsset(Statics.brands.inferkit),
  youtube: staticAsset(Statics.brands.youtube),
  urbandictionary: staticAsset(Statics.brands.urbandictionary)
})