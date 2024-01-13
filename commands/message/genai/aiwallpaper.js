const { geminiVision, aiWallpaper } = require("../../../labscore/api/obelisk");
const { getRecentImage } = require("../../../labscore/utils/attachment");
const { createEmbed } = require("../../../labscore/utils/embed");
const { editOrReply } = require("../../../labscore/utils/message");
const { getUser } = require("../../../labscore/utils/users");

const { Permissions } = require("detritus-client/lib/constants");

const { STATIC_ICONS } = require("../../../labscore/utils/statics");
const { iconPill, stringwrap } = require("../../../labscore/utils/markdown");
const { hasFeature } = require("../../../labscore/utils/testing");

module.exports = {
  name: 'aiwallpaper',
  label: 'text',
  aliases: ['wallpaper'],
  metadata: {
    description: `${iconPill("generative_ai", "LIMITED TESTING")}\n\nCreate Wallpapers`,
    description_short: 'Create Wallpapers',
    examples: ['aiwp northern lights -style art'],
    category: 'limited',
    usage: 'aiwallpaper <prompt>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.ATTACH_FILES, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    if(!await hasFeature(context, "ai/wallpapers")) return;
    context.triggerTyping();

    if(!args.text) return editOrReply(context, createEmbed("warning", context, `Missing Parameter (prompt).`))

    let input = args.text;

    try{
      await editOrReply(context, createEmbed("ai", context, "Generating Image..."))

      let res = await aiWallpaper(context, args.text, "translucent");
      let imgName = `lcwp.${Date.now().toString(36)}.jpeg`;
      
      return editOrReply(context, {
        embeds:[createEmbed("defaultNoFooter", context, {
          author: {
            iconUrl: STATIC_ICONS.ai_image,
            name: stringwrap(args.text, 50, false),
          },
          image: {
            url: `attachment://${imgName}`
          },
          footer: {
            text: `Generative AI is experimental • Use AI Images responsibly.`
          }
        })],
        files: [{
          filename: imgName,
          value: res.response.body
        }]
      })
    } catch(e){
      console.log(e)
      if(e.response?.body?.message) return editOrReply(context, createEmbed("error", context, e.response.body.message))
      return editOrReply(context, createEmbed("error", context, `Unable to generate image.`))
    }
  }
};