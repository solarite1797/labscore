const { createEmbed } = require('../../../labscore/utils/embed')
const { format } = require('../../../labscore/utils/ansi')
const { editOrReply } = require('../../../labscore/utils/message')
const { STATICS } = require('../../../labscore/utils/statics')

const { paginator } = require('../../../labscore/client');

const superagent = require('superagent');
const { icon, highlight, codeblock } = require('../../../labscore/utils/markdown');

const SIZES = Object.freeze({
  "wallpaper": { x: 1920, y: 1080},
  "phone": { x: 1170, y: 2353},
  "avatar": { x: 512, y: 512}
})

function validateNumber(input, low, high){
  if(input == "rand") return true;
  if(isNaN(input)) return true;
  return (parseInt(input) <= high && parseInt(input) >= low);
}

module.exports = {
  name: 'art',
  aliases: ['wallpaper'],
  label: 'text',
  metadata: {
    description: 'crazy ai art',
    examples: ['art -type wallpaper -seed 839648 -variance 8866 -rotate 1'],
    category: 'fun',
    usage: `art [-type <${Object.keys(SIZES).join('|')}>] [-seed <10000-999999>] [-variance <1000-9999>] [-rotate <0-360>]`
  },
  args: [
    { name: 'type', default: 'wallpaper', required: false },
    { name: 'seed', default: 'rand', required: false },
    { name: 'variance', default: 'rand', required: false },
    { name: 'rotate', default: 'rand', required: false }
  ],
  run: async (context, args) => {
    context.triggerTyping();
    let response = await editOrReply(context, createEmbed("loading", context, `Generating image...`))
    try{
      let seed = Math.floor(Math.random() * 999999) + 100000,
        variance = Math.floor(Math.random() * 9999) + 1000,
        rotate = Math.floor(Math.random() * 360)

      if(!validateNumber(args.seed, 10000, 999999)) return await editOrReply(context, createEmbed("warning", context, "Invalid Seed (must be between 10000 and 999999)"))
      if(args.seed !== "rand") seed = parseInt(args.seed);

      if(!validateNumber(args.variance, 1000, 9999)) return await editOrReply(context, createEmbed("warning", context, "Invalid Variance (must be between 1000 and 9999)"))
      if(args.variance !== "rand") variance = parseInt(args.variance);

      if(!validateNumber(args.rotate, 0, 360)) return await editOrReply(context, createEmbed("warning", context, "Invalid Rotation (must be between 0 and 360)"))
      if(args.rotate !== "rand") rotate = parseInt(args.rotate);

      if(!SIZES[args.type.toLowerCase()]) return await editOrReply(context, createEmbed("warning", context, `Invalid Type (must be one of '${Object.keys(SIZES).join(`', '`)}')`))
      let sizeX = SIZES[args.type.toLowerCase()].x,
        sizeY = SIZES[args.type.toLowerCase()].y

      let timings = Date.now();
      let res = await superagent.get(`https://limb.us-east1-gke.intellij.net/generate_art_json`)
        .query({
          "seed": seed,
          "x_resolution": sizeX,
          "y_resolution": sizeY,
          "direction": "X",
          "index": "4",
          "variance": variance,
          "architecture": "densenet",
          "activation": "softsign",
          "width": "3",
          "depth": "5",
          "alpha": "1.8097",
          "beta": "-0.08713800000000001",
          "antialiasing": "true",
          "antialiasing_factor": "2",
          "noise_factor": "0",
          "color_space": "rgb",
          "scale": "2.811",
          "rotation": rotate,
          "offset_x": "1202",
          "offset_y": "257",
          "function_": "quadratic",
          "custom_function": "None"
        })
      
      res = JSON.parse(res.text)

      await response.edit({
        embeds: [
          createEmbed("default", context, {
            description: `${codeblock(`py`, [`${context.commandClient.prefixes.custom.first()}art -type ${args.type.toLowerCase()} -seed ${seed} -variance ${variance} -rotate ${rotate}`])}`,
            image: {
              url: res.image_link
            },
            footer: {
              iconUrl: `https://cdn.discordapp.com/avatars/${context.application.id}/${context.application.icon}.png?size=256`,
              text: `labsCore • Took ${((Date.now() - timings) / 1000).toFixed(2)}s`
            }
          })
        ]
      })
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to generate image.`)]})
    }
  }
};