const { createEmbed } = require('#utils/embed');
const { acknowledge } = require('#utils/interactions');
const { editOrReply } = require('#utils/message');

const { ApplicationCommandOptionTypes } = require("detritus-client/lib/constants");

module.exports = {
  description: 'Get someones avatar.',
  name: 'avatar',
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
      name: 'user',
      description: 'User to get the avatar from.',
      type: ApplicationCommandOptionTypes.USER,
      required: false
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

    if(!args.user) return editOrReply(context, createEmbed("default", context, {
      image: {
        url: context.user.avatarUrl + '?size=4096'
      }
    }))

    return editOrReply(context, createEmbed("default", context, {
      image: {
        url: args.user.avatarUrl + '?size=4096'
      }
    }))
  },
};