const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const superagent = require('superagent');
const { codeblock } = require('../../../labscore/utils/markdown');
const { DEFAULT_BOT_PREFIX } = require('../../../labscore/constants');

const { Permissions } = require("detritus-client/lib/constants");

const SIZES = Object.freeze({
  "wallpaper": { x: 1920, y: 1200},
  "phone": { x: 1170, y: 2353},
  "avatar": { x: 512, y: 512}
})

function validateNumber(input, low, high){
  if(input == "") return true;
  if(isNaN(input)) return true;
  return (parseInt(input) <= high && parseInt(input) >= low);
}

module.exports = {
  name: 'art',
  aliases: ['wallpaper'],
  metadata: {
    description: 'Creates colorful generative art using JetBrains LIMB.',
    description_short: 'AI wallpaper generation',
    examples: ['art -type wallpaper -seed 839648 -variance 8866 -rotate 1', 'wallpaper -type phone'],
    category: 'fun',
    usage: `art [-type <${Object.keys(SIZES).join('|')}>] [-seed <10000-999999>] [-variance <1000-9999>] [-rotate <0-360>]`
  },
  args: [
    { name: 'type', default: 'wallpaper', required: false, help: `Image Type \` ${Object.keys(SIZES).join(', ')} \`` },
    { name: 'seed', default: '', required: false, help: "Image Seed (10000-999999)" },
    { name: 'variance', default: '', required: false, help: "Variance (1000-9999)" },
    { name: 'rotate', default: '', required: false, help: "Rotation amount (0-360)" }
  ],
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.ATTACH_FILES, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    let response = await editOrReply(context, createEmbed("loading", context, `Generating image...`))
    try{
      let seed = Math.floor(Math.random() * 999999) + 100000,
        variance = Math.floor(Math.random() * 9999) + 1000,
        rotate = Math.floor(Math.random() * 360)

      if(!validateNumber(args.seed, 10000, 999999)) return await editOrReply(context, createEmbed("warning", context, "Invalid Seed (must be between 10000 and 999999)"))
      if(args.seed !== "") seed = parseInt(args.seed);

      if(!validateNumber(args.variance, 1000, 9999)) return await editOrReply(context, createEmbed("warning", context, "Invalid Variance (must be between 1000 and 9999)"))
      if(args.variance !== "") variance = parseInt(args.variance);

      if(!validateNumber(args.rotate, 0, 360)) return await editOrReply(context, createEmbed("warning", context, "Invalid Rotation (must be between 0 and 360)"))
      if(args.rotate !== "") rotate = parseInt(args.rotate);

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
      
      const image = await superagent.get(res.image_link)

      return await editOrReply(context, {
        embeds: [createEmbed("image", context, {
          url: res.hash,
          description: `${codeblock(`py`, [`${DEFAULT_BOT_PREFIX}art -type ${args.type.toLowerCase()} -seed ${seed} -variance ${variance} -rotate ${rotate}`])}`,
          time: ((Date.now() - timings) / 1000).toFixed(2)
        })],
        files: [{ filename: res.hash, value: image.body }]
      })
    }catch(e){
      console.log(e)
      return await editOrReply(context, {embeds:[createEmbed("error", context, `Unable to generate image.`)]})
    }
  }
};