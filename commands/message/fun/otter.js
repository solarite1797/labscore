const { otter } = require('#api');

const { createEmbed } = require('#utils/embed')
const { editOrReply } = require('#utils/message')

// TODO: Turn this into a general purpose permissions constant
const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'otter',
  metadata: {
    description: 'Displays a random image containing otters.',
    description_short: 'Otter images',
    category: 'fun',
    usage: `otter`,
    slashCommand: "otter"
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.ATTACH_FILES, Permissions.READ_MESSAGE_HISTORY],
  run: async (context) => {
    await context.triggerTyping();
    try{
      const ott = (await otter()).response.body
    
      return editOrReply(context, createEmbed("default", context, {
        image: {
          url: ott.url
        }
      }))
    }catch(e){
      console.log(e)
      return editOrReply(context, createEmbed("error", context, `Unable to fetch otter.`))
    }
  }
};