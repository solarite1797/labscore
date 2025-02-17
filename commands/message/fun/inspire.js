const { createEmbed } = require('#utils/embed');
const { editOrReply } = require('#utils/message');
const { STATICS } = require('#utils/statics');

// TODO: Turn this into a general purpose permissions constant
const { Permissions } = require("detritus-client/lib/constants");

const superagent = require('superagent');

module.exports = {
  name: 'inspire',
  metadata: {
    description: 'Generates a random inspirational quote.',
    description_short: 'Inspirational Quotes',
    category: 'fun',
    usage: `inspire`
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.ATTACH_FILES, Permissions.READ_MESSAGE_HISTORY],
  run: async (context) => {
    await context.triggerTyping();
    try {
      let res = await superagent.get(`https://inspirobot.me/api?generate=true`)
        .set("User-Agent", "labscore/2.0")

      return await editOrReply(context, createEmbed("image", context, {
        url: res.text,
        provider: {
          icon: STATICS.inspirobot,
          text: "Inspirobot"
        }
      }))
    } catch (e) {
      return editOrReply(context, createEmbed("error", context, `Unable to fetch inspirational quote.`))
    }
  }
};