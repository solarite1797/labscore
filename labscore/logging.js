const superagent = require('superagent')

const MAINTOWER_BASE_URL = `https://labscore-v2.vercel.app/maintower/`

let maintowerClient = "1fepg2wdk-prod"
if(process.env.MAINTOWER_OVERRIDE) maintowerClient = process.env.MAINTOWER_OVERRIDE

module.exports.maintower = async function (packages, type){
  try{
    let res = await superagent.post(MAINTOWER_BASE_URL + 'invoke')
      .set({
        "Authorization": process.env.API_KEY,
        "x-labscore-client": "labscore/2.0"
      })
      .query({
        client: maintowerClient,
        type: type
      })
      .send(packages)
    if(res.body.status == 0) return res.body.id;
    throw res.body.message
  }catch(e){
    console.log(e)
    throw "Maintower request failed."
  }
}

module.exports.basecamp = async function (log, content = ""){
  // This begins the list of errors that i simply cannot fix. thank you discord.
  if(content.includes(`"code": 200000`)) return;
  try{
    let res = await superagent.post(MAINTOWER_BASE_URL + 'basecamp')
      .set({
        "Authorization": process.env.API_KEY,
        "x-labscore-client": "labscore/2.0"
      })
      .send({log, content})
    return;
  }catch(e){
    console.log(e)
    throw "Basecamp request failed."
  }
}

module.exports.ingest = async function (event, type = "generic"){
  try{
    let r = await superagent.get(`${process.env.INGEST_SERVICE_HOST}/d/${type}/${event}`)
      .set("x-ingest-client", process.env.INGEST_SERVICE_CLIENT)
  }catch(e){
    console.log(e)
    console.log("ingest failed")
  }
}