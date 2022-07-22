const { Constants, Utils } = require("detritus-client");
const superagent = require('superagent');
const { emojipedia, emojiKitchen } = require("../../../labscore/api");

const { Static } = require("../../../labscore/api/endpoints");
const { SUPPORTED_EMOJI_PLATFORMS, EMOJI_PLATFORM_ALIASES } = require("../../../labscore/constants");
const { createEmbed } = require("../../../labscore/utils/embed");
const { editOrReply } = require("../../../labscore/utils/message");
const { STATICS } = require("../../../labscore/utils/statics");

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
  name: "emoji",
  aliases: ['e', 'emote', 'enlarge', 'em', 'emojimix'],
  metadata: {
    description: 'Enlarge Emoji.',
    examples: ['enlarge 😀', 'emojimix 🐱 🍞'],
    category: 'utils',
    usage: 'emoji <emoji> [<emoji to mix>]'
  },
  args: [
    {name: 'type', default: 'twitter'}
  ],
  run: async (context, args) => {
    await context.triggerTyping()
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
      }

      // Emoji Mixing
      if(emoji.length >= 2){
        try{
          let em = await emojiKitchen(emoji)
          if(!em.body.results[0]){
            try{
              await emojiKitchen([emoji[0]])
            }catch(e){
              return editOrReply(context, createEmbed("error", context, `Invalid Emoji (${emoji[0]})`))
            }
            try{
              await emojiKitchen([emoji[1]])
            }catch(e){
              return editOrReply(context, createEmbed("error", context, `Invalid Emoji (${emoji[1]})`))
            }
            return editOrReply(context, createEmbed("error", context, "Combination not supported"))
          }
          return editOrReply(context, createEmbed("image", context, { url: em.body.results[0].url }))
          
        }catch(e){
          console.log(e)
          return context.editOrReply({
            embed: {
              author: {
                iconUrl: context.message.author.avatarUrl,
                name: `${context.message.author.username}#${context.message.author.discriminator}`
              },
              color: Colors.error,
              description: `${Icons.error} You need two emoji to mix.`,
            }
          })
        }
      }

      // Regular Emoji Handling
      if(!SUPPORTED_EMOJI_PLATFORMS.includes(args.type.toLowerCase())){
        if(!EMOJI_PLATFORM_ALIASES[args.type.toLowerCase()]) return await editOrReply(context, createEmbed("warning", context, "Invalid emoji type"))
        args.type = EMOJI_PLATFORM_ALIASES[args.type.toLowerCase()]
      }
      if(emoji.length == 0) return await editOrReply(context, createEmbed("warning", context, "You need to specify an emoji to enlarge"))
      let emojipediaResult = await emojipedia(context, emoji[0])
      emojipediaResult = emojipediaResult.response.body
      if(!emojipediaResult.data.vendor_images[args.type]) return await editOrReply(context, createEmbed("error", context, "No image of specified emoji for the requested type"))
      
      emojiUrl = emojipediaResult.data.vendor_images[args.type]

      return editOrReply(context, {embeds:[
        createEmbed("default", context, {
          description: `${emojipediaResult.data.emoji} • **${emojipediaResult.data.name}**`,
          image: {
            url: emojiUrl
          },
          footer: {
            iconUrl: STATICS.emojipedia,
            text: `Emojipedia • ${context.application.name}`
          }
        })
      ]})
      
    }
  }
};