const { prideborder } = require("#api");

const { editOrReply } = require("#utils/message");

module.exports = {
  label: "text",
  name: "test",
  metadata: {
    description: 'test.',
    description_short: 'test',
    examples: ['test'],
    category: 'dev',
    usage: 'test'
  },
  onBefore: context => context.user.isClientOwner,
  onCancel: ()=>{},
  run: async (context, args) => {
    await context.triggerTyping();
    const a = await prideborder(context, "https://cdn.discordapp.com/emojis/1145727546747535412.png?size=4096")
    editOrReply(context, "ok");
  }
};