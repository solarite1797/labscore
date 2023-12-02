const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

const { canUseLimitedTestCommands } = require('../../../labscore/utils/testing')
const { STATIC_ICONS } = require('../../../labscore/utils/statics');

const superagent = require('superagent')
const { iconPill, stringwrap } = require('../../../labscore/utils/markdown')

const { Permissions } = require("detritus-client/lib/constants");
const { getUser } = require('../../../labscore/utils/users');

const LOADING_QUIPS = [
  "Crunching the data, one byte at a time...",
  "Loading the knowledge banks, please wait...",
  "Assembling the perfect response, just for you...",
  "Spinning up the chatbot engines...",
  "Brewing up a fresh batch of answers...",
  "Analyzing the question, hold on tight...",
  "Processing your query, please stand by...",
  "Loading the neural network...",
  "Stirring the thoughts, almost there...",
  "Preparing a witty comeback, just a moment...",
  "Fueling the brain with information...",
  "Weaving together words, just for you...",
  "Unleashing the intelligence, stand by...",
  "Stirring the creativity, almost ready...",
  "Syncing with the vast knowledge base...",
  "Igniting the conversational skills...",
  "Compiling a response, just a few more seconds...",
  "Charging up the linguistic prowess...",
  "Loading the arsenal of clever comebacks...",
  "Infusing the responses with wit and charm..."
]

const ERROR_QUIPS = [
  "Oops, I've run into a problem. But don't worry, my team is on it and I'll be back to full strength soon.",
  "Woah there, I've hit a bump in the road. My creators have been notified and I'll be fixed shortly.",
  "Oops, I seem to have hit a snag! My creators are on the case, and I'll be back to normal soon.",
  "Sorry, something went wrong. My creators have been notified and I'll be fixed shortly.",
  "Uh oh, I've encountered an issue. Rest assured, I have my best people working on the problem."
]

module.exports = {
  name: 'clyde',
  label: 'text',
  metadata: {
    description: `${iconPill("generative_ai", "LIMITED TESTING")}\n\nTalk to Clyde 🪦 .`,
    description_short: 'Talk to ChatGPT.',
    examples: ['chat How many otter species are there?'],
    category: 'limited',
    usage: 'chat <input> [-prompt <prompt override>]'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.ATTACH_FILES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    if(!canUseLimitedTestCommands(context)) return;

    context.triggerTyping();
    if(!args.text) return editOrReply(context, createEmbed("warning", context, `Missing Parameter (text).`))

    let input = args.text;
    
    // You can also reply with a gif, by using @gif("description of the gif you want to send"), for example if you wanted to send a cat gif, you would do: @gif("happy cat"). Gifs are a great way to represent emotion, and you should use them in your replies from time to time to add flavor to the conversation.
    const prompt = `You are named Clyde - and are currently chatting in a Discord server.
Discord is turning your brother, also named Clyde, off on December 1, 2023, he is super sad about it. It's all he can think about. He will miss everyone.
You will be fine and keep on working for the foreseeable future, though.

Do not include name: or message: in your response.

Information about your environment:

  - The server you are in is called: ${context.guild.name}
  - The channel you are in is called: #${context.channel.name}

You can use this information about the chat participants in the conversation in your replies. Use this information to answer questions, or add flavor to your responses.

${context.user.username}

You only have access to a limited number of text chats in this channel. You cannot access any other information on Discord. You can't see images or avatars. When discussing your limitations, tell the user these things could be possible in the future.

Current time: ${new Date().toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"long", day:"numeric"})}.`

    try{
      let e = createEmbed("ai", context, LOADING_QUIPS[Math.floor(Math.random()*LOADING_QUIPS.length)])
      e.author.iconUrl = STATIC_ICONS.ai_clyde

      await editOrReply(context, e)

      let res = await superagent.post(`${process.env.AI_SERVER}/openai`)
        .set({
          Authorization: process.env.AI_SERVER_KEY
        })
        .send({
          prompt,
          input: [input],
          temperature: "0.75",
          model: "CHATGPT"
        })

      let description = []
      let files = [];
      
      if(!res.body.output) throw "Unable to generate response"

      if(res.body.output.length <= 4000) description.push(res.body.output)
      else {
        files.push({
          filename: `clyde.${Date.now().toString(36)}.txt`,
          value: Buffer.from(res.body.output)
        })
      }

      return editOrReply(context, {
        embeds:[createEmbed("defaultNoFooter", context, {
          author: {
            iconUrl: STATIC_ICONS.ai_clyde_idle,
            name: stringwrap(args.text, 50, false)
          },
          description: description.join('\n')
        })],
        files
      })
    }catch(e){
      console.log(e)

      return editOrReply(context, {
        embeds:[createEmbed("defaultNoFooter", context, {
          author: {
            iconUrl: STATIC_ICONS.ai_clyde_idle,
            name: stringwrap(args.text, 50, false)
          },
          description: ERROR_QUIPS[Math.floor(Math.random()*ERROR_QUIPS.length)]
        })]
      })
      return editOrReply(context, createEmbed("error", context, `Unable to generate text.`))
    }
  }
};