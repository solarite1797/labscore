const { createEmbed } = require("../../../labscore/utils/embed");
const { editOrReply } = require("../../../labscore/utils/message");

const superagent = require('superagent');
const { icon, highlight } = require("../../../labscore/utils/markdown");

module.exports = {
  name: 'texttomusic',
  label: 'query',
  aliases: ['ttm'],
  metadata: {
    description: 'Generates a short music piece from a text input.',
    description_short: 'AI Music generation from a prompt',
    examples: ['ttm Tropical'],
    category: 'image',
    usage: 'texttomusic <prompt>'
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (context, args) => {
    let response = await editOrReply(context, { embeds: [createEmbed("loading", context, `Generating audio...`)] })

    let noticeTimer = setTimeout(()=>{
      let emb = createEmbed("loading", context, `Generating audio...`)
      emb.footer = {
        text: "This might take several minutes to complete."
      };
      response.edit({ embeds: [ emb ] });
    }, 45000)

    try{
      let t = Date.now();

      let img = await superagent.get(`${process.env.AI_SERVER}/texttomusic`)
        .query({
          prompt: args.query
        })

      clearTimeout(noticeTimer)

      await response.edit({
        embeds: [createEmbed("defaultNoFooter", context, { description: `${icon("audio")} Audio Generated in ${highlight(((Date.now() - t) / 1000).toFixed(2) + "s")}.` })],
        file: { value: img.body, filename: "music.mp3" }
      })

    }catch(e){
      console.log(e)
      await response.edit({embeds:[createEmbed("error", context, `Audio generation failed.`)]})
    }
  },
};