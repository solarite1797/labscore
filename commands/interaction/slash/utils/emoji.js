const { Constants, Utils } = require("detritus-client");
const { InteractionCallbackTypes, ApplicationCommandOptionTypes } = require("detritus-client/lib/constants");
const { emojipedia, emojiKitchen } = require("../../../../labscore/api");

const { EMOJIPEDIA_PLATFORM_TYPES, EMOJIPEDIA_PLATFORM_TYPE_ALIASES } = require("../../../../labscore/constants");
const { createEmbed } = require("../../../../labscore/utils/embed");
const { icon, pill, iconPill, highlight, timestamp } = require("../../../../labscore/utils/markdown");
const { editOrReply } = require("../../../../labscore/utils/message");
const { STATICS } = require("../../../../labscore/utils/statics");
const { Components, Snowflake } = require("detritus-client/lib/utils");

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
  name: 'emoji',
  description: 'Turn emoji into images. Supports both built-in and custom emoji.',
  contexts: [
    0,
    1,
    2
  ],
  integrationTypes: [
    1
  ],
  options: [
    {
      name: 'emoji',
      description: 'Emoji to enlarge. Use two built-in emoji to mix them.',
      type: ApplicationCommandOptionTypes.TEXT,
      required: true
    },
    {
      name: 'type',
      description: '(For built-in emoji) Emoji platform (twitter, apple, etc).',
      type: ApplicationCommandOptionTypes.TEXT,
      required: false
    }
  ],
  run: async (context, args) => {
    await context.respond({data: {}, type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE})

    const { matches } = Utils.regex(
      Constants.DiscordRegexNames.EMOJI,
      args.emoji
    );
    embeds = []
    if (matches.length) {
      let form = '.png'
      if(matches[0].animated) form = '.gif'

      let tagline = ''
      tagline += `\n${icon("clock")} Created ${timestamp(Snowflake.timestamp(matches[0].id), "f")}`

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
                console.log(e)
                return editOrReply(context, createEmbed("warning", context, `Unsupported Emoji (${em})`))
              }
            }
  
            return editOrReply(context, createEmbed("error", context, "Combination not supported."))
          }
          return editOrReply(context, createEmbed("image", context, { url: em.body.results[0].url }))
        }catch(e){
          console.log(e)
          return editOrReply(context, createEmbed("error", context, "Unable to mix emoji."))
        }
      }

      // Regular Emoji Handling
      if(emoji.length == 0) return await editOrReply(context, createEmbed("warning", context, "You need to specify an emoji to enlarge."))

      if(!args.type) args.type = "twitter";
      args.type = args.type.toLowerCase()

      if(!EMOJIPEDIA_PLATFORM_TYPES.includes(args.type) && EMOJIPEDIA_PLATFORM_TYPE_ALIASES[args.type]) args.type = EMOJIPEDIA_PLATFORM_TYPE_ALIASES[args.type]

      let res;
      try{
        res = await emojipedia(context, emoji[0])
        res = res.response.body
      }catch(e){
        console.log(e)
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

      const platformEmoji = res.data.platforms[args.type]
      
      if(platformEmoji.images.length == 1) return editOrReply(context, createEmbed("default", context, {
        author: {
          iconUrl: ico,
          name: `${res.data.name} • ${res.data.platforms[args.type].images[0].version}`,
          url: res.data.link
        },
        description: res.data.codes.map((c)=>pill(c)).join(' '),
        image: {
          url: res.data.platforms[args.type].images[0].src
        },
        footer: {
          iconUrl: STATICS.emojipedia,
          text: `Emojipedia • ${context.application.name}`
        }
      }))

      let currentView ;
      const components = new Components({
        timeout: 100000,
        run: async (ctx) => {
          if (ctx.userId !== context.userId) return await ctx.respond(InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE);
          
          const emojiAsset = platformEmoji.images.filter((p)=>{
            return p.id == ctx.data.values[0]
          })
          
          // this sucks but works, ensures the newly selected option stays selected
          for (let i = 0; i < components.components[0].components[0].options.length; i++) {
            components.components[0].components[0].options[i].default = (components.components[0].components[0].options[i].value == ctx.data.values[0])
          }

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

      let selectOptions = res.data.platforms[args.type].images.map((r) => {
        return {
          label: r.version,
          value: r.id,
          default: (r.id == res.data.platforms[args.type].images[0].id)
        }
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
          name: `${res.data.name} • ${res.data.platforms[args.type].images[0].version}`,
          url: res.data.link
        },
        description: res.data.codes.map((c)=>pill(c)).join(' '),
        image: {
          url: res.data.platforms[args.type].images[0].src
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