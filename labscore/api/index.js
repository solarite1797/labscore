const superagent = require('superagent')
const { Api, Static, Hosts } = require('./endpoints')


async function request(path, type, headers, args, host) {
  let timing = Date.now();
  url = Api.HOST + path
  if(process.env.USE_LOCAL_API) url = Hosts.local + path
  if(host) url = host + path

  // apply default headers
  if(!headers["Authorization"]) headers["Authorization"] = process.env.api_prod
  if(!headers["user-agent"]) headers["user-agent"] = "labscore/2.0"

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

module.exports.googleVisionOcr = async function(context, url){
  return await request(Api.GOOGLE_VISION_OCR, "GET", {}, {
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

module.exports.google = async function(context, query){
  return await request(Api.SEARCH_GOOGLE, "GET", {}, {
    q: query
  })
}

module.exports.googleImages = async function(context, query){
  return await request(Api.SEARCH_GOOGLE_IMAGES, "GET", {}, {
    q: query
  })
}

module.exports.bing = async function(context, query){
  return await request(Api.SEARCH_BING, "GET", {}, {
    q: query
  })
}

module.exports.bingImages = async function(context, query){
  return await request(Api.SEARCH_BING_IMAGES, "GET", {}, {
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

module.exports.inferkit = async function(context, input){
  return await request(Api.INFERKIT, "GET", {}, {
    input: input
  })
}

module.exports.emojiTwitter = async function(codepoint){
  return Static.HOST + Static.TWITTER(codepoint)
}