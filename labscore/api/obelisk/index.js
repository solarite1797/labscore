const superagent = require('superagent')
const { ObeliskApi, ObeliskHosts } = require('./endpoints')

async function request(path, type, headers, args, host) {
  let timing = Date.now();
  url = ObeliskApi.HOST + path
  if(process.env.USE_LOCAL_API) url = ObeliskHosts.local + ":" + process.env.USE_LOCAL_API + path
  if(host) url = host + path

  // apply default headers
  if(!headers["Authorization"]) headers["Authorization"] = process.env.OBELISK_API_KEY
  if(!headers["x-obelisk-client"]) headers["x-obelisk-client"] = process.env.OBELISK_CLIENT_ID || "labscore-production-001"

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

// GENERATIVEAI
module.exports.bard = async function(context, input){
  return await request(ObeliskApi.GOOGLE_BARD, "POST", {}, {
    input
  })
}

module.exports.gemini = async function(context, prompt){
  return await request(ObeliskApi.GOOGLE_GEMINI_PRO, "POST", {}, {
    prompt
  })
}

module.exports.geminiVision = async function(context, input, url){
  return await request(ObeliskApi.GOOGLE_GEMINI_PRO_VISION, "POST", {}, {
    input,
    url
  })
}

module.exports.palm2 = async function(context, prompt, input){
  return await request(ObeliskApi.GOOGLE_PALM2, "POST", {}, {
    prompt,
    input
  })
}

module.exports.chatgpt = async function(context, prompt, input){
  return await request(ObeliskApi.OPENAI_CHATGPT, "POST", {}, {
    prompt,
    input
  })
}

module.exports.gpt4 = async function(context, prompt, input){
  return await request(ObeliskApi.OPENAI_GPT4, "POST", {}, {
    prompt,
    input
  })
}

// FLAMINGO
module.exports.summarizeWebpage = async function(context, url){
  return await request(ObeliskApi.SUMMARIZE_WEBPAGES, "POST", {}, {
    url
  })
}

// ROBIN
module.exports.aiWallpaper = async function(context, prompt, style){
  return await request(ObeliskApi.AI_WALLPAPER, "POST", {}, {
    prompt,
    style
  })
}