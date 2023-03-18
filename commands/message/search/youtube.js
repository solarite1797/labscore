const { createEmbed, formatPaginationEmbeds, page } = require('../../../labscore/utils/embed')
const { link, iconPill, timestamp } = require('../../../labscore/utils/markdown')
const { editOrReply } = require('../../../labscore/utils/message')
const { STATICS } = require('../../../labscore/utils/statics')

const { paginator } = require('../../../labscore/client');
const { youtube } = require('../../../labscore/api');

// https://www.html-code-generator.com/javascript/shorten-long-numbers
const intToString = num => {
  num = num.toString().replace(/[^0-9.]/g, '');
  if (num < 1000) return num;

  let si = [
    {v: 1E3, s: "K"},
    {v: 1E6, s: "M"},
    {v: 1E9, s: "B"},
    {v: 1E12, s: "T"},
    {v: 1E15, s: "P"},
    {v: 1E18, s: "E"}
  ];
  let index;
  for (index = si.length - 1; index > 0; index--) {
    if (num >= si[index].v) break;
  }
  return (num / si[index].v).toFixed(2).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + si[index].s;
};

function createYoutubePage(context, result){
  let res;
  let iconHeader;
  switch(result.type){
    case 1: //video
      iconHeader = [
        iconPill("eye", intToString(parseInt(result.metadata.views))),
        iconPill("like", intToString(parseInt(result.metadata.likes))), 
        iconPill("message", intToString(parseInt(result.metadata.comments)))
      ]
      res = page(createEmbed("default", context, {
        author: {
          name: result.channel.name,
          url: result.channel.url,
          iconUrl: result.channel.icon
        },
        description: `**${link(result.url, result.name)}**\n${iconHeader.join(' ​ ​ ​ ​')}\n*Uploaded ${timestamp(result.date, "f")}*\n\n${result.description}`,
        thumbnail: {
          url: result.image
        },
        footer: {
          iconUrl: STATICS.youtube,
          text: `YouTube • ${context.application.name}`
        }
      }))
      break;
    case 2: // channel
      iconHeader = [
        iconPill("videos", intToString(parseInt(result.metadata.videos).toLocaleString('en-US'))),
        iconPill("eye", intToString(parseInt(result.metadata.views).toLocaleString('en-US')))
      ]
      res = page(createEmbed("default", context, {
        description: `**${link(result.url, result.name)}**\n${iconHeader.join(' ​ ​ ​ ​')}\n*Created ${timestamp(result.date, "f")}*\n\n${result.description}`,
        thumbnail: {
          url: result.icon
        },
        footer: {
          iconUrl: STATICS.youtube,
          text: `YouTube • ${context.application.name}`
        }
      }))
      break;
    case 3: // playlist
      iconHeader = [
        iconPill("videos", intToString(parseInt(result.metadata.videos).toLocaleString('en-US')))
      ]
      res = page(createEmbed("default", context, {
        description: `**${link(result.url, result.name)}**\n${iconHeader.join(' ​ ​ ​ ​')} ​ ​ ​ *Created ${timestamp(result.date, "f")}*\n\n${result.description}`,
        thumbnail: {
          url: result.image
        },
        footer: {
          iconUrl: STATICS.youtube,
          text: `YouTube • ${context.application.name}`
        }
      }))
      break;
    default: // wtf?
      break;
  }
  return res;
}

module.exports = {
  name: 'youtube',
  label: 'query',
  aliases: ['yt'],
  metadata: {
    description: 'Returns search results from YouTube.',
    description_short: 'YouTube Search',
    examples: ['youtube Google'],
    category: 'search',
    usage: 'youtube <query>'
  },
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.query) return editOrReply(context, {embeds:[createEmbed("warning", context, `Missing Parameter (query).`)]})
    try{
      let search = await youtube(context, args.query)
      search = search.response
     
      let pages = []
      for(const res of search.body.results){
        pages.push(createYoutubePage(context, res))
      }
      
      pages = formatPaginationEmbeds(pages)
      const paging = await paginator.createPaginator({
        context,
        pages
      });
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds:[createEmbed("error", context, `Unable to perform youtube search.`)]})
    }
  },
};