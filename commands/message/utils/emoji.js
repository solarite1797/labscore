const { Constants, Utils } = require("detritus-client");
const { Permissions, InteractionCallbackTypes } = require("detritus-client/lib/constants");
const { emojipedia, emojiKitchen } = require("../../../labscore/api");

const { EMOJIPEDIA_PLATFORM_TYPES, EMOJIPEDIA_PLATFORM_TYPE_ALIASES } = require("../../../labscore/constants");
const { createEmbed } = require("../../../labscore/utils/embed");
const { icon, pill, iconPill, highlight, timestamp, smallIconPill } = require("../../../labscore/utils/markdown");
const { editOrReply } = require("../../../labscore/utils/message");
const { STATICS } = require("../../../labscore/utils/statics");
const { Components, Snowflake } = require("detritus-client/lib/utils");
const { bold } = require("detritus-client/lib/utils/markup");
const { ingest } = require("../../../labscore/logging");

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
    description: `${smallIconPill("reply", "Supports Replies")}\n\nDisplays information about emoji. Supports regular emoji, discord emoji and stickers.\nAlso supports replies.\n\nUsing two emoji will mix them together.`,
    description_short: 'Get emoji/sticker source images, mix two emoji together.',
    examples: ['e 😀', 'emojimix 🐱 🍞'],
    category: 'utils',
    usage: 'emoji <emoji> [<emoji to mix>]',
    use_custom_ingest: true
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
      ingest("emoji_sticker", "command_ran");
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
      ingest("emoji_enlarge", "command_ran");
      let form = '.png'
      if(matches[0].animated) form = '.gif'

      let tagline = ''
      tagline += `\n${icon("clock")} Created ${timestamp(Snowflake.timestamp(matches[0].id), "f")}`
      if(context.guild.emojis.find((e)=>e.id == matches[0].id)) tagline += `\n${icon("home")} This custom emoji is from ${bold(context.guild.name)}`


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
          ingest("emoji_emojikitchen", "command_ran");
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

      ingest("emoji_enlarge", "command_ran");
      // Regular Emoji Handling
      if(emoji.length == 0) return await editOrReply(context, createEmbed("warning", context, "You need to specify an emoji to enlarge."))

      args.type = args.type.toLowerCase()

      if(!EMOJIPEDIA_PLATFORM_TYPES.includes(args.type) && EMOJIPEDIA_PLATFORM_TYPE_ALIASES[args.type]) args.type = EMOJIPEDIA_PLATFORM_TYPE_ALIASES[args.type]

      let res;
      try{
        res = await emojipedia(context, emoji[0])
        res = res.response.body
      }catch(e){
        return await editOrReply(context, createEmbed("error", context, `No emoji data available for ${emoji[0]}.`))
      }

      if(!res.data.platforms[args.type]){
        let embed = createEmbed("error", context, "No emoji image available for platform '" + args.type + "'.")
        embed.footer = {
          text: "Available platforms: " + Object.keys(res.data.platforms).join(', ').substr(0, 2000)
        }
        return await editOrReply(context, embed)
      }

      // Use the high-res emojipedia icon, if available
      let ico = `https://abs.twimg.com/emoji/v2/72x72/${toCodePoint(emoji[0])}.png`
      if(!res.data.platforms["twitter"]) ico = res.data.platforms[args.type].images[0].src
      else ico = res.data.platforms["twitter"].images[0].src

      const DEFAULT_PLATFORM = args.type
      let platformEmoji = res.data.platforms[DEFAULT_PLATFORM]
      
      if(platformEmoji.images.length == 1) return editOrReply(context, createEmbed("default", context, {
        author: {
          iconUrl: ico,
          name: `${res.data.name} • ${res.data.platforms[DEFAULT_PLATFORM].images[0].version}`,
          url: res.data.link
        },
        description: res.data.codes.map((c)=>pill(c)).join(' '),
        image: {
          url: res.data.platforms[DEFAULT_PLATFORM].images[0].src
        },
        footer: {
          iconUrl: STATICS.emojipedia,
          text: `Emojipedia • ${context.application.name}`
        }
      }))

      let currentView;
      let currentPlatform = args.type;
      let currentRevision = "";

      const components = new Components({
        timeout: 100000,
        run: async (ctx) => {
          if (ctx.userId !== context.userId) return await ctx.respond(InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE);
          
          // this sucks but works, ensures the newly selected option stays selected
          // update 25/03/24 - it sucks even more now
        
          if(ctx.data.customId == "emoji-type"){
            currentPlatform = ctx.data.values[0];
            currentRevision = res.data.platforms[currentPlatform].images[0].id

            for (let i = 0; i < components.components[0].components[0].options.length; i++) {
              components.components[0].components[0].options[i].default = (components.components[0].components[0].options[i].value == currentPlatform)
            }
            
            let newVersionOptions = res.data.platforms[currentPlatform].images.map((r) => {
              return {
                label: r.version,
                value: r.id,
                default: (r.id == res.data.platforms[currentPlatform].images[0].id)
              }
            })

            components.components[1].components[0].options = newVersionOptions

          } else if(ctx.data.customId == "emoji-version"){
            for (let i = 0; i < components.components[1].components[0].options.length; i++) {
              components.components[1].components[0].options[i].default = (components.components[1].components[0].options[i].value == ctx.data.values[0])
            }
            currentRevision = ctx.data.values[0];
          }

          const emojiAsset = res.data.platforms[currentPlatform].images.filter((p)=>{
            return p.id == currentRevision
          })

          currentView = createEmbed("default", context, {
            author: {
              iconUrl: ico,
              name: `${res.data.name} • ${emojiAsset[0].version}`,
              url: res.data.link
            },
            description: res.data.codes.map((c)=>pill(c)).join(' '),
            image: {
              url: emojiAsset[0].src
            },
            footer: {
              iconUrl: STATICS.emojipedia,
              text: `Emojipedia • ${context.application.name}`
            }
          })

          await ctx.editOrRespond({embeds: [currentView], components})
        },
      });

      let selectOptions = res.data.platforms[currentPlatform].images.map((r) => {
        return {
          label: r.version,
          value: r.id,
          default: (r.id == res.data.platforms[DEFAULT_PLATFORM].images[0].id)
        }
      })

      currentRevision = res.data.platforms[DEFAULT_PLATFORM].images[0].id
      
      let selectTypeOptions = Object.keys(res.data.platforms).splice(0, 25).map((r) => {
        let pl = res.data.platforms[r]
        return {
          label: pl.name,
          value: r,
          default: (r == DEFAULT_PLATFORM)
        }
      })

      components.addSelectMenu({
        placeholder: "Select platform type",
        customId: "emoji-type",
        options: selectTypeOptions
      })
      
      components.addSelectMenu({
        placeholder: "Select emoji revision",
        customId: "emoji-version",
        options: selectOptions
      })

      setTimeout(()=>{
        editOrReply(context, {
          embeds:[currentView],
          components:[]
        })
      }, 100000)

      currentView = createEmbed("default", context, {
        author: {
          iconUrl: ico,
          name: `${res.data.name} • ${res.data.platforms[DEFAULT_PLATFORM].images[0].version}`,
          url: res.data.link
        },
        description: res.data.codes.map((c)=>pill(c)).join(' '),
        image: {
          url: res.data.platforms[DEFAULT_PLATFORM].images[0].src
        },
        footer: {
          iconUrl: STATICS.emojipedia,
          text: `Emojipedia • ${context.application.name}`
        }
      })
      return editOrReply(context, {embeds: [currentView], components})
    }
  }
};