//https://resources.jetbrains.com/cai/eidos_231/goland/999.png

const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const { Permissions } = require("detritus-client/lib/constants");

const APPS = [
  "appcode",
  "aqua",
  "big-data-tools",
  "clion",
  "cwm",
  "datagrip",
  "datalore",
  "dataspell",
  "dotcover",
  "dotmemory",
  "dotpeek",
  "dottrace",
  "fleet",
  "gateway",
  "goland",
  "grazie",
  "hub",
  "intellij-idea",
  "intellij-idea-community",
  "intellij-idea-edu",
  "intellij-rust",
  "jetbrains",
  "jb-academy",
  "kotlin",
  "license-vault",
  "marketplace",
  "mono",
  "mps",
  "phpstorm",
  "pycharm",
  "pycharm-community",
  "pycharm-edu",
  "qa-tools",
  "qodana",
  "resharper",
  "resharper-cpp",
  "rider",
  "riderflow",
  "rubymine",
  "space",
  "teamcity",
  "toolbox",
  "upsource",
  "webstorm",
  "youtrack",
]

module.exports = {
  name: 'art2',
  aliases: ['wallpaper2'],
  metadata: {
    description: 'Returns a random colorful wallpaper from JetBrains Eidos.',
    description_short: 'AI wallpapers',
    category: 'fun',
    usage: `art2`
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context) => {
    context.triggerTyping();
    return editOrReply(context, createEmbed("default", context, {
      image: {
        url: `https://resources.jetbrains.com/cai/eidos_231/${APPS[Math.floor(Math.random()*APPS.length)]}/${Math.floor(1 + Math.random()*999)}.png`
      }
    }))
  }
};