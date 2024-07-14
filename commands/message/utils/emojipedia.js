const { emojipedia } = require("#api");

const { createEmbed } = require("#utils/embed");
const { pill, smallIconPill } = require("#utils/markdown");
const { editOrReply } = require("#utils/message");
const { STATICS, STATIC_ASSETS } = require("#utils/statics");

// TODO: Turn this into a general purpose permissions constant
const { Permissions, InteractionCallbackTypes, MessageComponentButtonStyles } = require("detritus-client/lib/constants");
const { Components } = require("detritus-client/lib/utils");

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
  name: "emojipedia",
  aliases: ["emojiinfo", "ei"],
  metadata: {
    description: `${smallIconPill("reply", "Supports Replies")}\n\nDisplays more detailed information about emoji. Only supports unicode emoji.`,
    description_short: 'Detailed information about an emoji.',
    examples: ['ei 😀'],
    category: 'utils',
    usage: 'emojiinfo <emoji>'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.READ_MESSAGE_HISTORY, Permissions.USE_EXTERNAL_EMOJIS],
  run: async (context, args) => {
    await context.triggerTyping()
    let msg = context.message;
    if (context.message.messageReference) {
      msg = await context.message.channel.fetchMessage(context.message.messageReference.messageId)
      args.emoji = msg.content
    }

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

        ico = `https://raw.githubusercontent.com/jdecked/twemoji/main/assets/72x72/${toCodePoint(emoji[0])}.png`
        if(newView.data.platforms["twitter"]) ico = res.data.platforms["twitter"].images[0].src

        let previewImage;
        if(!newView.data.platforms["twitter"]){
          newView.data.platforms[Object.keys(newView.data.platforms)[0]].images[0].src
        } else {
          previewImage = newView.data.platforms["twitter"].images[0].src
        }

        currentView = createEmbed("default", context, {
          author: {
            iconUrl: ico,
            name: `${newView.data.name} `,
            url: newView.data.link
          },
          description: newView.data.codes.map((c)=>pill(c)).join(' ') + "\n\n" + newView.data.metadata.description,
          image: {
            url: previewImage || STATIC_ASSETS.emoji_placeholder
          },
          footer: {
            iconUrl: STATICS.emojipedia,
            text: `Emojipedia • ${context.application.name}`
          }
        })

        if(newView.data.metadata.version?.emoji){
          currentView.author.name += `• Emoji ${newView.data.metadata.version.emoji}`
        }

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
    let ico = `https://raw.githubusercontent.com/jdecked/twemoji/main/assets/72x72/${toCodePoint(emoji[0])}.png`
    if(res.data.platforms["twitter"]) ico = res.data.platforms["twitter"].images[0].src

    let iPreviewImage;
    if(!res.data.platforms["twitter"] && Object.values(res.data.platforms)[0]){
      iPreviewImage = res.data.platforms[Object.keys(res.data.platforms)[0]].images[0].src
    } else if(res.data.platforms["twitter"]){
      iPreviewImage = res.data.platforms["twitter"].images[0].src
    }

    currentView = createEmbed("default", context, {
      author: {
        iconUrl: ico,
        name: `${res.data.name} `,
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

    if(res.data.metadata.version?.emoji){
      currentView.author.name += `• Emoji ${res.data.metadata.version.emoji}`
    }

    if(!res.data.metadata.similar) return await editOrReply(context, currentView)

    return editOrReply(context, {
      embeds: [currentView],
      components
    })
  }
};