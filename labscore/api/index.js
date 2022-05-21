const superagent = require('superagent')
const { Api, Static, Hosts } = require('./endpoints')


async function request(path, type, headers, args, host) {
  let timing = Date.now();
  url = Api.HOST + path
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

module.exports.yacht = async function(context, text){
  return await request(Api.PHOTOFUNIA_YACHT, "GET", {}, {
    text: text
  })
}

module.exports.emojiTwitter = async function(codepoint){
  return Static.HOST + Static.TWITTER(codepoint)
}