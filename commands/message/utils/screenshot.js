const { screenshot } = require("../../../labscore/api");
const { createEmbed } = require("../../../labscore/utils/embed");
const { editOrReply } = require("../../../labscore/utils/message");

const superagent = require('superagent')

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
      const t = Date.now();

      let ss = await screenshot(context, args.url)

      if(ss.response.body.status && ss.response.body.status !== 3){
        if(ss.response.body.image) return editOrReply(context, createEmbed("default", context, {
            image: {
              url: ss.response.body.image
            }
          }))
        return editOrReply(context, { embeds: [createEmbed("error", context, "Unable to create screenshot.")] })
      }

      let job = await superagent.get(ss.response.body.job)
        .set('User-Agent', 'labscore/1.0')

      if(job.body.status){
        if(job.body.image) return editOrReply(context, createEmbed("default", context, {
            image: {
              url: job.body.image
            }
          }))
        return editOrReply(context, { embeds: [createEmbed("error", context, "Unable to create screenshot.")] })
      }

      return await response.edit({
        embeds: [createEmbed("image", context, {
          url: "screenshot.png",
          time: ((Date.now() - t) / 1000).toFixed(2)
        })],
        files: [{ filename: "screenshot.png", value: job.body }]
      })
    } catch(e){
      console.log(e)
      return await response.edit({ embeds: [createEmbed("error", context, `Unable to create screenshot.`) ] })
    }
  }
};