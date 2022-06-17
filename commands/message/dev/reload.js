// TODO: remake this eventually, copy pasted it from v1 cause lazy

module.exports = {
  name: "reload",
  aliases: ["rl"],
  metadata: {
    description: 'Reloads commands on all shards.',
    examples: ['reload'],
    category: 'dev',
    usage: 'reload'
  },
  onBefore: context => context.user.isClientOwner,
  onCancel: context =>
    context.reply(
      `${context.user.mention}, you are lacking the permission \`BOT_OWNER\`.`
    ),
  run: async (context, args) => {
    await context.triggerTyping();
    const time = Date.now();
    console.log(`v2 | command refresh requested @ ${Date.now()} by ${context.user.username}${context.user.discriminator} (${context.user.id})`)
    const data = await context.manager.broadcastEval(async (cluster) => {
      let shards = 0
      if (cluster.commandClient) {
        const commandClient = cluster.commandClient;
        commandClient.clear();
        await commandClient.addMultipleIn('../commands/message/', {subdirectories: true});
        shards = cluster.shards.length
      }
      return shards;
    });
    let refreshed = data.map((e)=>{return parseInt(e)}).reduce((a, b) => {return a + b}, 0)
    let diff = Date.now();
    if (diff < time) diff.setDate(diff.getDate() + 1);
    diff = diff - time;
    if(`${refreshed}` == "NaN"){
      return context.editOrReply(`Failed to reload all commands after \`${diff}ms\`.`)
    }
    return context.editOrReply(` Reloaded commands on \`${refreshed}/${context.manager.cluster.shardCount}\` shards in \`${diff}ms\`.`)
  }
};