const { createEmbed } = require("#utils/embed");
const { editOrReply } = require("#utils/message");
const { getTestConfig } = require("#utils/testing");

module.exports = {
  name: "refresh-configs",
  metadata: {
    description: 'Reload configs.',
    description_short: 'Reload configs.',
    examples: ['refresh-configs'],
    category: 'dev',
    usage: 'refresh-configs'
  },
  onBefore: context => context.user.isClientOwner,
  onCancel: ()=>{},
  run: async (context, args) => {
    await context.triggerTyping();
    let c = await getTestConfig();
    return await editOrReply(context, createEmbed("success", context, "Refreshed configs (v"+c.revision+")."));
  }
};