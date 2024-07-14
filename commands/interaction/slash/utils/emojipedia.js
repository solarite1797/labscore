const { emojipedia } = require("#api");

const { createEmbed } = require("#utils/embed");
const { pill } = require("#utils/markdown");
const { editOrReply } = require("#utils/message");
const { STATICS, STATIC_ASSETS } = require("#utils/statics");

const { Components } = require("detritus-client/lib/utils");
const { InteractionCallbackTypes, MessageComponentButtonStyles, ApplicationCommandOptionTypes } = require("detritus-client/lib/constants");
const { acknowledge } = require("#utils/interactions");

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
  name: 'emojipedia',
  description: 'Shows detailed information about an emoji.',
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
      description: 'Emoji to look up.',
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
    
    const emoji = onlyEmoji(args.emoji)
    if(!emoji){
      return editOrReply(context,
        createEmbed("warning", context, "No emoji found.")
      )
    }

    // Regular Emoji Handling
    if(emoji.length == 0) return await editOrReply(context, createEmbed("warning", context, "You need to specify an emoji to enlarge."))

    let res;
    try{
      res = await emojipedia(context, emoji[0])
      res = res.response.body
    }catch(e){
      return await editOrReply(context, createEmbed("error", context, `No emoji data available for ${emoji[0]}.`))
    }

    
    const components = new Components({
      timeout: 100000,
      run: async (ctx) => {
        if (ctx.userId !== context.userId) return await ctx.respond(InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE);

        let newView = await emojipedia(context, ctx.data.customId)
        newView = newView.response.body

        ico = newView.data.platforms["twitter"].images[0].src
        if(!newView.data.platforms["twitter"]) ico = Object.values(newView.data.platforms)[0].images[0].src

        currentView = createEmbed("default", context, {
          author: {
            iconUrl: ico,
            name: `${newView.data.name} • Emoji ${newView.data.metadata.version.emoji}`,
            url: newView.data.link
          },
          description: newView.data.codes.map((c)=>pill(c)).join(' ') + "\n\n" + newView.data.metadata.description,
          image: {
            url: newView.data.platforms["twitter"].images[0].src || STATIC_ASSETS.emoji_placeholder
          },
          footer: {
            iconUrl: STATICS.emojipedia,
            text: `Emojipedia • ${context.application.name}`
          }
        })

        components.clear();
        if(newView.data.metadata.similar) for(const e of newView.data.metadata.similar.splice(0, 5)){
          components.addButton({
            customId: e,
            emoji: e,
            style: MessageComponentButtonStyles.SECONDARY
          })
        }

        if(!newView.data.metadata.similar) return await ctx.editOrRespond({embeds: [currentView]})

        await ctx.editOrRespond({embeds: [currentView], components})
      }
    })

    if(res.data.metadata.similar) for(const e of res.data.metadata.similar.splice(0, 5)){
      components.addButton({
        customId: e,
        emoji: e,
        style: MessageComponentButtonStyles.SECONDARY
      })
    }

    setTimeout(()=>{
      editOrReply(context, {
        embeds:[currentView],
        components:[]
      })
    }, 100000)

    // Use the high-res emojipedia icon, if available
    let ico = `https://abs.twimg.com/emoji/v2/72x72/${toCodePoint(emoji[0])}.png`
    if(!res.data.platforms["twitter"] && Object.values(res.data.platforms)[0]) ico = Object.values(res.data.platforms)[0].images[0].src

    let iPreviewImage;
    if(!res.data.platforms["twitter"] && Object.values(res.data.platforms)[0]){
      iPreviewImage = res.data.platforms[Object.keys(res.data.platforms)[0]].images[0].src
    } else if(res.data.platforms["twitter"]){
      iPreviewImage = res.data.platforms["twitter"].images[0].src
    }

    currentView = createEmbed("default", context, {
      author: {
        iconUrl: ico,
        name: `${res.data.name} • Unicode ${res.data.metadata.version.unicode}`,
        url: res.data.link
      },
      description: res.data.codes.map((c)=>pill(c)).join(' ') + "\n\n" + res.data.metadata.description,
      image: {
        url: iPreviewImage || STATIC_ASSETS.emoji_placeholder
      },
      footer: {
        iconUrl: STATICS.emojipedia,
        text: `Emojipedia • ${context.application.name}`
      }
    })

    if(!res.data.metadata.similar) return await editOrReply(context, currentView)

    return editOrReply(context, {
      embeds: [currentView],
      components
    })
  }
};