const { Constants, Utils } = require("detritus-client");
const { emojipedia, emojiKitchen } = require("../../../labscore/api");

const { EMOJIPEDIA_PLATFORM_TYPES, EMOJIPEDIA_PLATFORM_TYPE_ALIASES } = require("../../../labscore/constants");
const { createEmbed } = require("../../../labscore/utils/embed");
const { editOrReply } = require("../../../labscore/utils/message");
const { STATICS } = require("../../../labscore/utils/statics");

const onlyEmoji = require('emoji-aware').onlyEmoji;

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

      if(!EMOJIPEDIA_PLATFORM_TYPES.includes(args.type.toLowerCase())){
        if(!EMOJIPEDIA_PLATFORM_TYPE_ALIASES[args.type.toLowerCase()]) return await editOrReply(context, createEmbed("warning", context, "Invalid platform type (" + args.type.toLowerCase() + ")"))
        args.type = EMOJIPEDIA_PLATFORM_TYPE_ALIASES[args.type.toLowerCase()]
      }

      let emojipediaResult = await emojipedia(context, emoji[0])
      emojipediaResult = emojipediaResult.response.body

      if(!emojipediaResult.data.vendor_images[args.type]){
        let embed = createEmbed("error", context, "No emoji image available for platform " + args.type.toLowerCase() + ".")
        embed.footer = {
          text: "Available platforms: " + Object.keys(emojipediaResult.data.vendor_images).join(', ')
        }
        return await editOrReply(context, embed)
      }

      return editOrReply(context, {embeds:[
        createEmbed("default", context, {
          description: `${emojipediaResult.data.emoji} • **${emojipediaResult.data.name}**`,
          image: {
            url: emojipediaResult.data.vendor_images[args.type]
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