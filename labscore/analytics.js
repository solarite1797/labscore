const superagent = require('superagent')

const ANALYTICS_BASE_URL = process.env.ANALYTICS_SERVER

let analyticsClient = "prod"
if(process.env.ANALYTICS_OVERRIDE) analyticsClient = process.env.ANALYTICS_OVERRIDE

module.exports.track = async function (command){
  try{
    let res = await superagent.get(ANALYTICS_BASE_URL + '/stats/collect/' + command)
      .set({
        "Authorization": process.env.ANALYTICS_KEY,
        "x-nx-client": analyticsClient
      })
  }catch(e){
    console.log('Analytics report failed.')
    console.log(e)
  }
}

module.exports.getCommandStatistics = async function (time){
  if(!time) time = analyticsClient + '_' + new Date().getFullYear() + '/' + new Date().getMonth()
  try{
    let res = await superagent.get(ANALYTICS_BASE_URL + '/stats/' + encodeURIComponent(time))
      .set({
        "Authorization": process.env.ANALYTICS_KEY,
        "x-nx-client": analyticsClient
      })
    return res.body.collection
  }catch(e){
    console.log(e)
    throw "Analytics request failed."
  }
}