const { emojipedia, emojiKitchen } = require("#api");

const { createEmbed } = require("#utils/embed");
const { acknowledge } = require("#utils/interactions");
const { icon, pill, iconPill, highlight, timestamp } = require("#utils/markdown");
const { editOrReply } = require("#utils/message");
const { STATICS, STATIC_ASSETS } = require("#utils/statics");

const { ingest } = require("#logging");

const { Utils } = require("detritus-client");
const { InteractionCallbackTypes, ApplicationCommandOptionTypes, DiscordRegexNames } = require("detritus-client/lib/constants");
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
  metadata: {
    use_custom_ingest: true
  },
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
      name: 'incognito',
      description: 'Makes the response only visible to you.',
      type: ApplicationCommandOptionTypes.BOOLEAN,
      required: false,
      default: false
    }
  ],
  run: async (context, args) => {
    await acknowledge(context, args.incognito);

    const { matches } = Utils.regex(
      DiscordRegexNames.EMOJI,
      args.emoji
    );
    embeds = []
    if (matches.length) {
      ingest("emoji_enlarge", "slash_command_ran");
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
        ingest("emoji_emojikitchen", "slash_command_ran");
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
      ingest("emoji_enlarge", "slash_command_ran");
      if(emoji.length == 0) return await editOrReply(context, createEmbed("warning", context, "You need to specify an emoji to enlarge."))

      let res;
      try{
        res = await emojipedia(context, emoji[0])
        res = res.response.body
      }catch(e){
        return await editOrReply(context, createEmbed("error", context, `No emoji data available for ${emoji[0]}.`))
      }

      if(Object.keys(res.data.platforms).length === 0) return await editOrReply(context, createEmbed("error", context, "No images available for this emoji."));

      // Use the high-res emojipedia icon, if available
      let ico = `https://abs.twimg.com/emoji/v2/72x72/${toCodePoint(emoji[0])}.png`
      ico = res.data.platforms["twitter"].images[0].src

      const DEFAULT_PLATFORM = "twitter"
      let platformEmoji = res.data.platforms["twitter"]
      
      if(platformEmoji.images.length == 1) return editOrReply(context, createEmbed("default", context, {
        author: {
          iconUrl: ico,
          name: `${res.data.name} • ${res.data.platforms[DEFAULT_PLATFORM].images[0].version}`,
          url: res.data.link
        },
        description: res.data.codes.map((c)=>pill(c)).join(' '),
        image: {
          url: res.data.platforms[DEFAULT_PLATFORM].images[0].src || STATIC_ASSETS.emoji_placeholder
        },
        footer: {
          iconUrl: STATICS.emojipedia,
          text: `Emojipedia • ${context.application.name}`
        }
      }))

      let currentView;
      let currentPlatform = "twitter";
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
              url: emojiAsset[0].src || STATIC_ASSETS.emoji_placeholder
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
          default: (r == "twitter")
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

      currentView = createEmbed("default", context, {
        author: {
          iconUrl: ico,
          name: `${res.data.name} • ${res.data.platforms[DEFAULT_PLATFORM].images[0].version}`,
          url: res.data.link
        },
        description: res.data.codes.map((c)=>pill(c)).join(' '),
        image: {
          url: res.data.platforms[DEFAULT_PLATFORM].images[0].src || STATIC_ASSETS.emoji_placeholder
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