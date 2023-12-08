const ObeliskHosts = Object.freeze({
  prod: process.env.OBELISK_HOST,
  local: "http://localhost"
})

const ObeliskApi = Object.freeze({
  HOST: ObeliskHosts.prod,

  SUMMARIZE_WEBPAGES: "/flamingo/v1/web:summarize"
})

module.exports = {
  ObeliskApi,
  ObeliskHosts
}