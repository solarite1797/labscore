const { createEmbed } = require('#utils/embed');
const { editOrReply } = require('#utils/message');

const { InteractionCallbackTypes, ApplicationCommandTypes } = require('detritus-client/lib/constants');

module.exports = {
  name: 'View User Banner',
  type: ApplicationCommandTypes.USER,
  contexts: [
    0,
    1,
    2
  ],
  integrationTypes: [
    1
  ],
  run: async (context, args) => {
    try{
      await context.respond({ data: {}, type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE })

      let u = await context.client.rest.fetchUser(args.user.id);
      if(!u.bannerUrl) return editOrReply(context, createEmbed("warning", context, "User doesn't have a banner set."));

      return editOrReply(context, createEmbed("default", context, {
        image: {
          url: u.bannerUrl + '?size=4096'
        }
      }))
    }catch(e){
      console.log(e)
    }
  },
};