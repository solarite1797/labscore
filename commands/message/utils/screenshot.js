const { screenshot } = require("../../../labscore/api");
const { createEmbed } = require("../../../labscore/utils/embed");
const { editOrReply } = require("../../../labscore/utils/message");

module.exports = {
  label: "url",
  name: "screenshot",
  aliases: ['ss'],
  metadata: {
    description: 'screenshot website',
    examples: ['ss google.com'],
    category: 'utils',
    usage: 'screenshot <url>'
  },
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.url) return editOrReply(context, { embeds: [createEmbed("warning", context, "No url supplied.")] })
    
    let response = await editOrReply(context, createEmbed("loading", context, `Creating website screenshot...`))

    try{
      let ss = await screenshot(context, args.url)
      if(ss.response.body.status){
        if(ss.response.body.image){ // Invalid Domain or Blocked, use server-provided error image.
          return editOrReply(context, { embeds: [createEmbed("default", context, {
            image: {
              url: ss.response.body.image
            },
            footer: {
              iconUrl: `https://cdn.discordapp.com/avatars/${context.application.id}/${context.application.icon}.png?size=256`,
              text: `${context.application.name} • Took ${ss.timings}s`
            }
          })]})
        } else {
          return editOrReply(context, { embeds: [createEmbed("error", context, "Unable to create screenshot.")] })
        }
      }
      
      return await response.edit({
        embeds: [createEmbed("image", context, {
          url: "screenshot.png",
          time: ss.timings
        })],
        files: [{ filename: "screenshot.png", value: ss.response.body }]
      })
    } catch(e){
      return await response.edit({ embeds: [createEmbed("error", context, `Unable to create screenshot.`) ] })
    }
  }
};