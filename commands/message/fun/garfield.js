
const { garfield } = require('../../../labscore/api');
const { createEmbed } = require('../../../labscore/utils/embed');
const { timestamp } = require('../../../labscore/utils/markdown');
const { editOrReply } = require('../../../labscore/utils/message')

const { Permissions } = require("detritus-client/lib/constants");

const FUNNY_CAT_EMOJI = [
  "<:gm:878401411556196352>",
  "<:gn:878401411392606258>",
  "<:funnycat:899419360748261396>"
]

module.exports = {
  name: 'garfield',
  aliases: ['garf'],
  metadata: {
    description: 'Returns a random garfield comic strip.',
    description_short: 'Random garfield comic',
    category: 'fun',
    usage: `garfield`
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context) => {
    context.triggerTyping();
    
    const garf = (await garfield()).response.body

    return editOrReply(context, createEmbed("default", context, {
      description: `${FUNNY_CAT_EMOJI[Math.floor(Math.random() * FUNNY_CAT_EMOJI.length)]} Garfield Comic Strip for ${timestamp(new Date(garf.date), "D")}`,
      image: {
        url: garf.comic
      }
    }))
  }
};