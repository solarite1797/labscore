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
  name: 'imagen',
  label: 'text',
  aliases: ['aiimg'],
  metadata: {
    description: `${iconPill("generative_ai", "LIMITED TESTING")}\n\nGenerate images with Imagen 2`,
    description_short: 'Create Wallpapers',
    examples: ['imagen a painting of northern lights'],
    category: 'limited',
    usage: 'imagen <prompt>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.ATTACH_FILES, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    if(!await hasFeature(context, "ai/wallpapers")) return;
    context.triggerTyping();

    if(!args.text) return editOrReply(context, createEmbed("warning", context, `Missing Parameter (prompt).`))

    try{
      await editOrReply(context, createEmbed("defaultNoFooter", context, {
        author: {
          iconUrl: STATIC_ICONS.ai_image_processing,
          name: "Generating images..."
        }
      }))

      let res = await aiWallpaper(context, args.text);

      // Construct Embeds
      let files = [];
      let embeds = res.response.body.images.map((i)=>{
        let imgName = `lcigen.${(Date.now() + Math.random()).toString(36)}.jpeg`;

        files.push({
          filename: imgName,
          value: Buffer.from(i, 'base64')
        })
        return createEmbed("defaultNoFooter", context, {
            url: "https://bignutty.gitlab.io",
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
          })
        });
      
      return editOrReply(context, {embeds, files});
    } catch(e){
      console.log(e)
      if(e.response?.body?.message) return editOrReply(context, createEmbed("error", context, e.response.body.message))
      return editOrReply(context, createEmbed("error", context, `Unable to generate image.`))
    }
  }
};
