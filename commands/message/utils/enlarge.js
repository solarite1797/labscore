const { Constants, Utils } = require("detritus-client");
const superagent = require('superagent');

const { Static } = require("../../../labscore/api/endpoints");
const { createEmbed } = require("../../../labscore/utils/embed");
const { editOrReply } = require("../../../labscore/utils/message");

const onlyEmoji = require('emoji-aware').onlyEmoji;

function toCodePoint(unicodeSurrogates) {
  const r = [];
  let c = 0;
  let p = 0;
  let i = 0;

  while (i < unicodeSurrogates.length) {
    c = unicodeSurrogates.charCodeAt(i++);
    if (p) {
      r.push((0x10000 + ((p - 0xD800) << 10) + (c - 0xDC00)).toString(16));
      p = 0;
    } else if (0xD800 <= c && c <= 0xDBFF) {
      p = c;
    } else {
      r.push(c.toString(16));
    }
  }
  return r.join('-');
}

module.exports = {
  label: "emoji",
  name: "enlarge",
  aliases: ['e', 'emote'],
  metadata: {
    description: 'Enlarge Emoji.',
    examples: ['enlarge 😀'],
    category: 'utils',
    usage: 'enlarge <emoji>'
  },
  args: [
    {name: 'type', default: 'twitter'}
  ],
  run: async (context, args) => {
    const { matches } = Utils.regex(
      Constants.DiscordRegexNames.EMOJI,
      args.emoji
    );
    embeds = []
    if (matches.length) {
      let form = '.png'
      if(matches[0].animated) form = '.gif'
      return editOrReply(context, {embeds:[
        createEmbed("default", context, {
          description: `**${matches[0].name}**`,
          image: {
            url: `https://cdn.discordapp.com/emojis/${matches[0].id}${form}`
          }
        })
      ]})
    } else {
      const emoji = onlyEmoji(args.emoji)
      if(!emoji){
        return editOrReply(context, {embeds:[
          createEmbed("warning", context, "No emoji found.")
        ]})
      } else {
        if(!Static[args.type.toUpperCase()]){
          return editOrReply(context, {embeds:[
            createEmbed("warning", context, "Invalid type.")
          ]})
        }

        const emojiCodepoint = emoji.map((e) => toCodePoint(e));
        if(!emojiCodepoint.length){
          return editOrReply(context, {embeds:[
            createEmbed("warning", context, "No emoji found.")
          ]})
        }
        targetEmoji = emojiCodepoint[0]
        if(args.type.toUpperCase() == "TWITTER"){
          targetEmoji = emojiCodepoint[0].replace('-fe0f', '')
        }
        let emojiUrl;
        switch(args.type.toUpperCase()){
          case "FLUENT":
            emojiUrl = `https://raw.githubusercontent.com/justsomederpystuff/fluent-emoji/main/emoji/${targetEmoji}.png`
            break;
          case "APPLE":
            emojiUrl = `https://raw.githubusercontent.com/iamcal/emoji-data/master/img-apple-160/${targetEmoji}.png`
            break;
          default: 
            emojiUrl = Static.HOST + Static[args.type.toUpperCase()](targetEmoji)
            break;
        }

        try{
          let e = await superagent.get(emojiUrl)
        }catch(e){
          return editOrReply(context, {embeds:[
            createEmbed("error", context, "No image for provided emoji.")
          ]})
        }
        return editOrReply(context, {embeds:[
          createEmbed("default", context, {
            image: {
              url: emojiUrl
            }
          })
        ]})
      }
    }
  }
};