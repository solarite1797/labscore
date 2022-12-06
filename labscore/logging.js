const superagent = require('superagent')

const MAINTOWER_BASE_URL = `https://labscore-v2.vercel.app/maintower/`

let maintowerClient = "1fepg2wdk-prod"
if(process.env.MAINTOWER_OVERRIDE) maintowerClient = process.env.MAINTOWER_OVERRIDE

module.exports.maintower = async function (packages, type){
  try{
    let res = await superagent.post(MAINTOWER_BASE_URL + 'invoke')
      .set({
        "Authorization": process.env.api_prod,
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