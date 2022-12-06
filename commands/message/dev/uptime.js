const { editOrReply } = require('../../../labscore/utils/message')
const { highlight } = require('../../../labscore/utils/markdown')

function format(seconds){
  function pad(s){
    return (s < 10 ? '0' : '') + s;
  }
  var hours = Math.floor(seconds / (60*60));
  var minutes = Math.floor(seconds % (60*60) / 60);
  var seconds = Math.floor(seconds % 60);

  return pad(hours) + ' Hours, ' + pad(minutes) + ' Minutes, ' + pad(seconds) + ' Seconds'
}

module.exports = {
  name: "uptime",
  metadata: {
    description: 'Displays the bots uptime.',
    description_short: 'Bot uptime',
    examples: ['uptime'],
    category: 'dev',
    usage: 'uptime'
  },
  onBefore: context => context.user.isClientOwner,
  onCancel: context =>
    context.reply(
      `${context.user.mention}, you are lacking the permission \`BOT_OWNER\`.`
    ),
  run: async (context, args) => {
    await context.triggerTyping();
    
    return await editOrReply(context, {
      "content": `up for ${highlight(format(process.uptime()))}`
    })
  }
};