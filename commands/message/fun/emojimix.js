const { Constants } = require("detritus-client");
const Permissions = Constants.Permissions;

const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const { emojiKitchen } = require('../../../labscore/api')

const onlyEmoji = require('emoji-aware').onlyEmoji;

module.exports = {
  label: "emoji",
  name: "emoji",
  aliases: ["em"],
  metadata: {
    description: 'mix two emoji',
    examples: ['emoji 🐱🍞'],
    category: 'fun',
    usage: 'emoji <emoji to mix>'
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 2000
  },
  permissionsClient: [Permissions.EMBED_LINKS],
  run: async (context, args) => {
    await context.triggerTyping();
    
    const emojis = onlyEmoji(args.emoji)

    if(emojis.length <= 1) return editOrReply(context, createEmbed("warning", context, "You need at least two emoji to mix."))

    try{
      let em = await emojiKitchen(emojis)
      if(!em.body.results[0]){
        try{
          await emojiKitchen([emojis[0]])
        }catch(e){
          return editOrReply(context, createEmbed("error", context, `Invalid Emoji (${emojis[0]})`))
        }
        try{
          await emojiKitchen([emojis[1]])
        }catch(e){
          return editOrReply(context, createEmbed("error", context, `Invalid Emoji (${emojis[1]})`))
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
};