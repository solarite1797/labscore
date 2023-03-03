const { Constants, Utils } = require("detritus-client");
const { emojipedia, emojiKitchen } = require("../../../labscore/api");

const { EMOJIPEDIA_PLATFORM_TYPES, EMOJIPEDIA_PLATFORM_TYPE_ALIASES } = require("../../../labscore/constants");
const { createEmbed } = require("../../../labscore/utils/embed");
const { citation } = require("../../../labscore/utils/markdown");
const { editOrReply } = require("../../../labscore/utils/message");
const { STATICS } = require("../../../labscore/utils/statics");

const onlyEmoji = require('emoji-aware').onlyEmoji;

function toCodePoint(unicodeSurrogates, sep) {
  var
    r = [],
    c = 0,
    p = 0,
    i = 0;
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
  return r.join(sep || '-');
}

module.exports = {
  label: "emoji",
  name: "emoji",
  aliases: ['e', 'emote', 'enlarge', 'em', 'emojimix'],
  metadata: {
    description: 'Displays information about emoji. Supports regular emoji and discord emoji.\n\nUsing two emoji will mix the two emoji together.',
    description_short: 'Emoji Information, Emoji Mixing',
    examples: ['enlarge 😀', 'emojimix 🐱 🍞'],
    category: 'utils',
    usage: 'emoji <emoji> [<emoji to mix>]'
  },
  args: [
    {name: 'type', default: 'twitter', type: 'string', help: `Emoji platform type`}
  ],
  run: async (context, args) => {
    await context.triggerTyping()

    if (context.message.messageReference) {
      let msg = await context.message.channel.fetchMessage(context.message.messageReference.messageId)
      args.emoji = msg.content
    }
    
    const { matches } = Utils.regex(
      Constants.DiscordRegexNames.EMOJI,
      args.emoji
    );
    embeds = []
    if (matches.length) {
      let form = '.png'
      if(matches[0].animated) form = '.gif'

      return editOrReply(context, createEmbed("default", context, {
          description: `**${matches[0].name}**`,
          image: {
            url: `https://cdn.discordapp.com/emojis/${matches[0].id}${form}`
          }
        })
      )
    } else {
      const emoji = onlyEmoji(args.emoji)
      if(!emoji){
        return editOrReply(context,
          createEmbed("warning", context, "No emoji found.")
        )
      }

      // Emoji Mixing
      if(emoji.length >= 2){
        try{
          let em = await emojiKitchen(emoji)
          if(!em.body.results[0]){
            for(const em of emoji){
              try{
                await emojiKitchen([em])
              }catch(e){
                return editOrReply(context, createEmbed("error", context, `Invalid Emoji (${em})`))
              }
            }

            return editOrReply(context, createEmbed("error", context, "Combination not supported."))
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
      if(emoji.length == 0) return await editOrReply(context, createEmbed("warning", context, "You need to specify an emoji to enlarge."))

      if(!EMOJIPEDIA_PLATFORM_TYPES.includes(args.type.toLowerCase()) && EMOJIPEDIA_PLATFORM_TYPE_ALIASES[args.type.toLowerCase()]) args.type = EMOJIPEDIA_PLATFORM_TYPE_ALIASES[args.type.toLowerCase()]

      let res = await emojipedia(context, emoji[0])
      res = res.response.body

      if(!res.data.vendor_images[args.type]){
        let embed = createEmbed("error", context, "No emoji image available for platform '" + args.type.toLowerCase() + "'.")
        embed.footer = {
          text: "Available platforms: " + Object.keys(res.data.vendor_images).join(', ').substr(0, 2000)
        }
        return await editOrReply(context, embed)
      }

      return editOrReply(context, createEmbed("default", context, {
        author: {
          iconUrl: `https://abs.twimg.com/emoji/v2/72x72/${toCodePoint(emoji[0])}.png`,
          name: res.data.name,
          url: res.data.permalink
        },
        image: {
          url: res.data.vendor_images[args.type]
        },
        footer: {
          iconUrl: STATICS.emojipedia,
          text: `Emojipedia • ${context.application.name}`
        }
      }))
    }
  }
};