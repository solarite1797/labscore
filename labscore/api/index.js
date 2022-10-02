const superagent = require('superagent')
const { Api, Static, Hosts } = require('./endpoints')


async function request(path, type, headers, args, host) {
  let timing = Date.now();
  url = Api.HOST + path
  if(process.env.USE_LOCAL_API) url = Hosts.local + ":" + process.env.USE_LOCAL_API + path
  if(host) url = host + path

  // apply default headers
  if(!headers["Authorization"]) headers["Authorization"] = process.env.api_prod
  if(!headers["user-agent"]) headers["user-agent"] = "labscore/2.0"
  if(!headers["x-labscore-client"]) headers["x-labscore-client"] = "labscore/2.0"

  if (type === "GET") {
    if(!args){
      const response = await superagent.get(url);
      return {
        timings: ((Date.now() - timing) / 1000).toFixed(2),
        response: response
      };
    }
    const response = await superagent.get(url)
      .query(args)
      .set(headers);
      return {
        timings: ((Date.now() - timing) / 1000).toFixed(2),
        response: response
      };
  }
  if (type === "POST") {
    const response = await superagent
      .post(url)
      .set(headers)
      .send(args);
    return {
      timings: ((Date.now() - timing) / 1000).toFixed(2),
      response: response
    };
  }
  throw new Error("unsupported, must either use GET or POST");
}

module.exports.googlePerspective = async function(context, text){
  return await request(Api.GOOGLE_PERSPECTIVE, "GET", {}, {
    text: text
  })
}

module.exports.googleTranslate = async function(context, text, to, from){
  return await request(Api.GOOGLE_TRANSLATE, "GET", {}, {
    text: text,
    to: to,
    from: from
  })
}

module.exports.googleVisionColors = async function(context, url){
  return await request(Api.GOOGLE_VISION_COLORS, "GET", {}, {
    url: url
  })
}

module.exports.googleVisionFaces = async function(context, url){
  return await request(Api.GOOGLE_VISION_FACES, "GET", {}, {
    url: url
  })
}

module.exports.googleVisionLabels = async function(context, url){
  return await request(Api.GOOGLE_VISION_LABELS, "GET", {}, {
    url: url
  })
}

module.exports.googleVisionOcr = async function(context, url){
  return await request(Api.GOOGLE_VISION_OCR, "GET", {}, {
    url: url
  })
}

module.exports.googleVisionSafetyLabels = async function(context, url){
  return await request(Api.GOOGLE_VISION_SAFETY_LABELS, "GET", {}, {
    url: url
  })
}

module.exports.googleVisionWebDetection = async function(context, url){
  return await request(Api.GOOGLE_VISION_WEBDETECTION, "GET", {}, {
    url: url
  })
}

module.exports.searchAudio = async function(context, url){
  return await request(Api.SEARCH_AUDIO, "GET", {}, {
    url: url
  })
}

module.exports.lyrics = async function(context, query){
  return await request(Api.SEARCH_LYRICS, "GET", {}, {
    q: query
  })
}

module.exports.google = async function(context, query, nsfw){
  return await request(Api.SEARCH_GOOGLE, "GET", {}, {
    q: query,
    nsfw: nsfw
  })
}

module.exports.googleImages = async function(context, query, nsfw){
  return await request(Api.SEARCH_GOOGLE_IMAGES, "GET", {}, {
    q: query,
    nsfw: nsfw
  })
}

module.exports.reddit = async function(context, query, nsfw = false){
  return await request(Api.SEARCH_REDDIT, "GET", {}, {
    q: query,
    nsfw: nsfw
  })
}

module.exports.rule34 = async function(context, query, service){
  return await request(Api.SEARCH_RULE34, "GET", {}, {
    q: query,
    service: service
  })
}

module.exports.bing = async function(context, query, nsfw){
  return await request(Api.SEARCH_BING, "GET", {}, {
    q: query,
    nsfw: nsfw
  })
}

module.exports.bingImages = async function(context, query, nsfw){
  return await request(Api.SEARCH_BING_IMAGES, "GET", {}, {
    q: query,
    nsfw: nsfw
  })
}

module.exports.dictionary = async function(context, query){
  return await request(Api.SEARCH_DICTIONARY, "GET", {}, {
    q: query
  })
}

module.exports.tineye = async function(context, url){
  return await request(Api.SEARCH_TINEYE, "GET", {}, {
    url: url
  })
}

module.exports.urbandictionary = async function(context, query){
  return await request(Api.SEARCH_URBANDICTIONARY, "GET", {}, {
    q: query
  })
}

module.exports.wikihow = async function(context, query){
  return await request(Api.SEARCH_WIKIHOW, "GET", {}, {
    q: query
  })
}

module.exports.wolframAlpha = async function(context, query){
  return await request(Api.SEARCH_WOLFRAM_ALPHA, "GET", {}, {
    q: query
  })
}

module.exports.youtube = async function(context, query){
  return await request(Api.SEARCH_YOUTUBE, "GET", {}, {
    q: query
  })
}

module.exports.yacht = async function(context, text){
  return await request(Api.PHOTOFUNIA_YACHT, "GET", {}, {
    text: text
  })
}

module.exports.retroWave = async function(context, background = 5, textStyle= 4, text1 = " ", text2 = " ", text3 = " "){
  return await request(Api.PHOTOFUNIA_RETRO_WAVE, "GET", {}, {
    text1: text1,
    text2: text2,
    text3: text3,
    background: background,
    text_style: textStyle
  })
}

module.exports.deepdream = async function(context, url){
  return await request(Api.IMAGE_DEEPDREAM, "GET", {}, {
    url: url
  })
}

module.exports.waifu2x = async function(context, url){
  return await request(Api.IMAGE_WAIFU2X, "GET", {}, {
    url: url
  })
}

module.exports.superresolution = async function(context, url){
  return await request(Api.IMAGE_SUPERRESOLUTION, "GET", {}, {
    url: url
  })
}

module.exports.text2image = async function(context, text){
  return await request(Api.IMAGE_TEXT2IMAGE, "GET", {}, {
    text: text
  })
}

module.exports.imtranslator = async function(context, text, voice){
  return await request(Api.TTS_IMTRANSLATOR, "GET", {}, {
    text: text,
    voice: voice
  })
}

module.exports.polly = async function(context, text, voice){
  return await request(Api.TTS_POLLY, "GET", {}, {
    text: text,
    voice: voice
  })
}

module.exports.tiktok = async function(context, text, voice){
  return await request(Api.TTS_TIKTOK, "GET", {}, {
    text: text,
    voice: voice
  })
}

module.exports.voiceforge = async function(context, text, voice){
  return await request(Api.TTS_VOICEFORGE, "GET", {}, {
    text: text,
    voice: voice
  })
}

module.exports.emojipedia = async function(context, emoji){
  return await request(Api.UTILS_EMOJIPEDIA, "GET", {}, {
    emoji: emoji
  })
}

module.exports.inferkit = async function(context, input){
  return await request(Api.UTILS_INFERKIT, "GET", {}, {
    input: input
  })
}

module.exports.screenshot = async function(context, url, nsfw){
  return await request(Api.UTILS_SCREENSHOT, "GET", {}, {
    url: url,
    nsfw: nsfw
  })
}

module.exports.emojiKitchen = async function(emoji){
  return await superagent.get("https://tenor.googleapis.com/v2/featured").query({
    key: process.env.GOOGLE_TENOR_KEY,
    contentfilter: "high",
    media_filter: "png_transparent",
    component: "proactive",
    collection: "emoji_kitchen_v5",
    q: emoji.join('_')
  })
}