const { Constants, Utils } = require("detritus-client");
const { Permissions, InteractionCallbackTypes } = require("detritus-client/lib/constants");
const { emojipedia, emojiKitchen } = require("../../../labscore/api");

const { EMOJIPEDIA_PLATFORM_TYPES, EMOJIPEDIA_PLATFORM_TYPE_ALIASES } = require("../../../labscore/constants");
const { createEmbed } = require("../../../labscore/utils/embed");
const { icon, pill, iconPill, highlight } = require("../../../labscore/utils/markdown");
const { editOrReply } = require("../../../labscore/utils/message");
const { STATICS } = require("../../../labscore/utils/statics");
const { Components } = require("detritus-client/lib/utils");
const { bold } = require("detritus-client/lib/utils/markup");

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
    description: 'Displays information about emoji. Supports regular emoji, discord emoji and stickers.\nAlso supports replies.\n\nUsing two emoji will mix them together.',
    description_short: 'Get emoji/sticker source images, mix two emoji together.',
    examples: ['enlarge 😀', 'emojimix 🐱 🍞'],
    category: 'utils',
    usage: 'emoji <emoji> [<emoji to mix>]'
  },
  args: [
    {name: 'type', default: 'twitter', type: 'string', help: `Emoji platform type`}
  ],
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.READ_MESSAGE_HISTORY, Permissions.USE_EXTERNAL_EMOJIS],
  run: async (context, args) => {
    await context.triggerTyping()
    let msg = context.message;
    if (context.message.messageReference) {
      msg = await context.message.channel.fetchMessage(context.message.messageReference.messageId)
      args.emoji = msg.content
    }
    
    // Stickers
    if(msg.stickerItems.length){
      let s = msg.stickerItems.first()
      if(s.formatType == 3) return editOrReply(context, createEmbed("default", context, {
          description: `${iconPill("sticker", s.name)} ${highlight(`(${s.id})`)}\nhttps://cdn.discordapp.com/stickers/${s.id}.json`,
        }))
      return editOrReply(context, createEmbed("default", context, {
        description: `${iconPill("sticker", s.name)} ${highlight(`(${s.id})`)}`,
        image: {
          url: `https://media.discordapp.net/stickers/${s.id}.png?size=4096`
        }
      })
    )
    }

    const { matches } = Utils.regex(
      Constants.DiscordRegexNames.EMOJI,
      args.emoji
    );
    embeds = []
    if (matches.length) {
      let form = '.png'
      if(matches[0].animated) form = '.gif'

      let tagline = ''
      if(context.guild.emojis.find((e)=>e.id == matches[0].id)) tagline = `\n${icon("house")} This emoji is from ${bold(context.guild.name)}`

      return editOrReply(context, createEmbed("default", context, {
          description: `${iconPill("emoji", `:${matches[0].name}:`)} ${highlight(`(${matches[0].id})`)}${tagline}`,
          image: {
            url: `https://cdn.discordapp.com/emojis/${matches[0].id}${form}?size=4096`
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
                return editOrReply(context, createEmbed("warning", context, `Unsupported Emoji (${em})`))
              }
            }
  
            return editOrReply(context, createEmbed("error", context, "Combination not supported."))
          }
          return editOrReply(context, createEmbed("image", context, { url: em.body.results[0].url }))
        }catch(e){
          return editOrReply(context, createEmbed("error", context, "Unable to mix emoji."))
        }
      }

      // Regular Emoji Handling
      if(emoji.length == 0) return await editOrReply(context, createEmbed("warning", context, "You need to specify an emoji to enlarge."))

      if(!EMOJIPEDIA_PLATFORM_TYPES.includes(args.type.toLowerCase()) && EMOJIPEDIA_PLATFORM_TYPE_ALIASES[args.type.toLowerCase()]) args.type = EMOJIPEDIA_PLATFORM_TYPE_ALIASES[args.type.toLowerCase()]

      let res;
      try{
        res = await emojipedia(context, emoji[0])
        res = res.response.body
      }catch(e){
        return await editOrReply(context, createEmbed("error", context, `No emoji data available for ${emoji[0]}.`))
      }

      if(!res.data.platforms[args.type]){
        let embed = createEmbed("error", context, "No emoji image available for platform '" + args.type.toLowerCase() + "'.")
        embed.footer = {
          text: "Available platforms: " + Object.keys(res.data.platforms).join(', ').substr(0, 2000)
        }
        return await editOrReply(context, embed)
      }

      // Use the high-res emojipedia icon, if available
      let ico = `https://abs.twimg.com/emoji/v2/72x72/${toCodePoint(emoji[0])}.png`
      if(res.data.platforms["twitter"]) ico = res.data.platforms["twitter"].images[0].src

      const platformEmoji = res.data.platforms[args.type]
      
      if(platformEmoji.images.length == 1) return editOrReply(context, createEmbed("default", context, {
        author: {
          iconUrl: ico,
          name: `${res.data.name} • ${res.data.platforms[args.type].images[0].version}`,
          url: res.data.link
        },
        image: {
          url: res.data.platforms[args.type].images[0].src
        },
        footer: {
          iconUrl: STATICS.emojipedia,
          text: `Emojipedia • ${context.application.name}`
        }
      }))

      const components = new Components({
        timeout: 100000,
        run: async (ctx) => {
          if (ctx.userId !== context.userId) return await ctx.respond(InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE);
          
          const emojiAsset = platformEmoji.images.filter((p)=>{
            return p.id == ctx.data.values[0]
          })

          await ctx.editOrRespond({embeds: [createEmbed("default", context, {
            author: {
              iconUrl: ico,
              name: `${res.data.name} • ${emojiAsset[0].version}`,
              url: res.data.link
            },
            image: {
              url: emojiAsset[0].src
            },
            footer: {
              iconUrl: STATICS.emojipedia,
              text: `Emojipedia • ${context.application.name}`
            }
          })], components})
        },
      });

      let selectOptions = res.data.platforms[args.type].images.map((r) => {
        return {
          label: r.version,
          value: r.id,
          default: (r.id == res.data.latest),
          emoji: {
            name: res.data.icon
          }
        }
      })

      components.addSelectMenu({
        placeholder: "Select emoji revision",
        customId: "emoji-version",
        options: selectOptions
      })

      setTimeout(()=>{
        editOrReply(context, {
          embeds: context.response.embeds,
          components:[]
        })
      }, 100000)

      return editOrReply(context, {embeds: [createEmbed("default", context, {
        author: {
          iconUrl: ico,
          name: `${res.data.name} • ${res.data.platforms[args.type].images[0].version}`,
          url: res.data.link
        },
        image: {
          url: res.data.platforms[args.type].images[0].src
        },
        footer: {
          iconUrl: STATICS.emojipedia,
          text: `Emojipedia • ${context.application.name}`
        }
      })], components})
    }
  }
};