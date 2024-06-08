const { youtube } = require('#api');
const { paginator } = require('#client');
const { YOUTUBE_CATEGORIES } = require('#constants');

const { createEmbed, formatPaginationEmbeds, page } = require('#utils/embed')
const { link, iconPill, smallPill } = require('#utils/markdown')
const { editOrReply } = require('#utils/message')
const { STATICS } = require('#utils/statics')

// TODO: Turn this into a general purpose permissions constant
const { Permissions } = require("detritus-client/lib/constants");

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
      iconHeader = []

      iconHeader.push(iconPill("stat_views", intToString(parseInt(result.metadata.views).toLocaleString('en-US')) + ' Views'))
      if(result.metadata.likes >= 1) iconHeader.push(iconPill("stat_likes", intToString(parseInt(result.metadata.likes)) + ' Likes'))
      if(result.metadata.comments >= 1) iconHeader.push('\n' + iconPill("stat_comments", intToString(parseInt(result.metadata.comments)) + ' Comments'))

      res = page(createEmbed("default", context, {
        author: {
          name: result.channel.name,
          url: result.channel.url,
          iconUrl: result.channel.icon
        },
        description: `**${link(result.url, result.name)}**\n\n${iconHeader.join(' ​ ​ ​ ​')}\n\n${result.description}`,
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
      iconHeader = []

      iconHeader.push(iconPill("stat_people", intToString(parseInt(result.metadata.subscribers).toLocaleString('en-US')) + ' Subscribers'))
      iconHeader.push(iconPill("stat_views", intToString(parseInt(result.metadata.views).toLocaleString('en-US')) + ' Views'))
      
      iconHeader.push('\n' + iconPill("stat_videos", intToString(parseInt(result.metadata.videos).toLocaleString('en-US')) + ' Videos'))

      res = page(createEmbed("default", context, {
        author: {
          name: result.name,
          url: result.url,
          iconUrl: result.icon
        },
        description: `${iconHeader.join(' ​ ​ ​ ​')}\n\n${result.description}`,
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
        '',
        iconPill("stat_videos", intToString(parseInt(result.metadata.videos).toLocaleString('en-US')) + ' Videos')
      ]
      res = page(createEmbed("default", context, {
        author: {
          name: result.channel.name,
          url: result.channel.url,
          iconUrl: result.channel.icon
        },
        description: `**${link(result.url, result.name)}**${iconHeader.join(' ​ ​ ​ ​')}\n\n${result.description}`,
        thumbnail: {
          url: result.image
        },
        footer: {
          iconUrl: STATICS.youtube,
          text: `YouTube • ${context.application.name}`
        }
      }))
      break;
    default:
      break;
  }
  return res;
}

module.exports = {
  name: 'youtube',
  label: 'query',
  aliases: ['yt'],
  metadata: {
    description: `Search YouTube videos, channels and playlists.\n\nAvailable categories are ${Object.keys(YOUTUBE_CATEGORIES).map((c)=>smallPill(c)).join(' ')}\n\nNote that category search is limited to videos.`,
    description_short: `Search YouTube videos, channels and playlists.`,
    examples: ['youtube otter live cam'],
    category: 'search',
    usage: 'youtube <query> [-type <category>]'
  },
  args: [
    {name: 'type', default: 'all', type: 'string', help: `Video Category`}
  ],
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    context.triggerTyping();
    if(!args.query) return editOrReply(context, createEmbed("warning", context, `Missing Parameter (query).`))
    try{
      if(args.type == 'all') args.type = undefined;
      else {
        if(!YOUTUBE_CATEGORIES[args.type.toLowerCase()]) return editOrReply(context, createEmbed("warning", context, `Invalid Parameter (type).`))
        args.type = YOUTUBE_CATEGORIES[args.type.toLowerCase()]
      }
      let search = await youtube(context, args.query, args.type)
      search = search.response
     
      let pages = []
      for(const res of search.body.results){
        pages.push(createYoutubePage(context, res))
      }
      
      await paginator.createPaginator({
        context,
        pages: formatPaginationEmbeds(pages)
      });
    }catch(e){
      console.log(e)
      return editOrReply(context, createEmbed("error", context, `Unable to perform youtube search.`))
    }
  },
};