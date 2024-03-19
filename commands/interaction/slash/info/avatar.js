const { Constants } = require('detritus-client');
const { InteractionCallbackTypes, ApplicationCommandOptionTypes } = Constants;

const { createEmbed } = require('../../../../labscore/utils/embed');

const { editOrReply } = require('../../../../labscore/utils/message');

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
    }
  ],
  run: async (context, args) => {
    await context.respond({data: {}, type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE})

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