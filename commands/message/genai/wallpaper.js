const { wallpaper } = require("../../../labscore/api/obelisk");
const { createEmbed } = require("../../../labscore/utils/embed");
const { editOrReply } = require("../../../labscore/utils/message");

const { Permissions } = require("detritus-client/lib/constants");

const { STATIC_ICONS, STATIC_ASSETS } = require("../../../labscore/utils/statics");
const { iconPill, stringwrap } = require("../../../labscore/utils/markdown");
const { hasFeature } = require("../../../labscore/utils/testing");

module.exports = {
  name: 'wallpaper',
  label: 'text',
  aliases: ['aiwp'],
  metadata: {
    description: `${iconPill("generative_ai", "LIMITED TESTING")}\n\nGenerate AI Wallpapers`,
    description_short: 'Create Wallpapers',
    examples: ['wallpaper a painting of northern lights, in the bauhaus style -format square'],
    category: 'limited',
    usage: 'wallpaper <prompt> [-format <square|wide>]'
  },
  args: [
    { name: 'format', default: 'wide', required: false, help: "Image style (wide, square)." }
  ],
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.ATTACH_FILES, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    if(!await hasFeature(context, "ai/wallpapers")) return;
    context.triggerTyping();

    if(!args.text) return editOrReply(context, createEmbed("warning", context, `Missing Parameter (prompt).`))
    if(!["wide","square"].includes(args.format.toLowerCase())) return editOrReply(context, createEmbed("warning", context, `Invalid Parameter (format).`))
    try{
      let load = createEmbed("defaultNoFooter", context, {
        url: "https://bignutty.gitlab.io",
        author: {
          iconUrl: STATIC_ICONS.ai_image_processing,
          name: "Generating images..."
        },
        image: {
          url: STATIC_ASSETS.image_loading
        }
      })
      let loadingEmbeds = [load, load, load, load]
        
      await editOrReply(context, {embeds: loadingEmbeds});

      let res = await wallpaper(context, args.text, args.format.toLowerCase());

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
