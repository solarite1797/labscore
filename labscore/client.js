const { Constants, ClusterClient, CommandClient, InteractionCommandClient } = require('detritus-client');
const { ActivityTypes, PresenceStatuses, GatewayIntents } = require('detritus-client/lib/constants');

const Paginator = require('./paginator').PaginatorCluster

const cluster = new ClusterClient("", {
  cache: {messages: {expire: 60 * 60 * 1000}},
  gateway: {
    identifyProperties: {
      $browser: 'Discord Android',
    },
    intents: [
      GatewayIntents.GUILDS,
      GatewayIntents.GUILD_MESSAGES,
      GatewayIntents.GUILD_EMOJIS
    ],
    presence: {
      activity: {
        name: 'lc.help',
        type: ActivityTypes.WATCHING,
      },
      status: PresenceStatuses.ONLINE,
    },
  }
});

// Create this clusters paginator
module.exports.paginator = new Paginator(cluster, {
  maxTime: 300000,
  pageLoop: true,
  pageNumber: true
});

// Clients

let commandPrefixes = ['lc..','lc.'] // Migration from beta -> main, remove lc.. eventually
if(process.env.PREFIX_OVERRIDE) commandPrefixes = process.env.PREFIX_OVERRIDE.split('|');

const commandClient = new CommandClient(cluster, {
  activateOnEdits: true,
  mentionsEnabled: false,
  prefixes: commandPrefixes,
  useClusterClient: true,
  ratelimits: [
    {duration: 60000, limit: 50, type: 'guild'},
    {duration: 5000, limit: 5, type: 'channel'},
  ]
});

const interactionClient = new InteractionCommandClient(cluster, {
  useClusterClient: true
})

const { maintower } = require('./logging');
const { icon } = require('./utils/markdown');
const { editOrReply } = require('./utils/message');

// Delete command responses if the user chooses to delete their trigger or edits the command away
commandClient.on('commandDelete', async ({context, reply}) => {
  if(context.message?.deleted && !reply.deleted || !context.message.content.startsWith(commandPrefix)) reply.delete();
})

commandClient.on('commandRunError', async ({context, error}) => {
  try{
    // Log the error via our maintower service
    let packages = {
      data: {},
      origin: {},
      meta: {
        shard: context.shardId.toString(),
        cluster: context.manager.clusterId.toString()
      }
    }
    
    if(context.user) packages.origin.user = { name: `${context.user.username}#${context.user.discriminator}`, id: context.user.id }
    if(context.guild) packages.origin.guild = { name: context.guild.name, id: context.guild.id }
    if(context.channel) packages.origin.channel = { name: context.channel.name, id: context.channel.id }

    packages.data.command = context.message.content
    packages.data.error = error ? error.stack || error.message : error
    if(error.raw) packages.data.raw = JSON.stringify(error.raw, null, 2)

    let req = await maintower(packages, "01")

    await editOrReply(context, {
      content: `${icon("cross")} Something went wrong while attempting to run this command. (Reference: \`${req}\`)`
    })
  }catch(e){
    await editOrReply(context, {
      content: `${icon("cross")} Something went wrong while attempting to run this command.`
    })
  }
});

(async () => {
  await cluster.run();
  await commandClient.addMultipleIn('../commands/message/');
  await commandClient.run()

  await interactionClient.addMultipleIn('../commands/interaction/context');
  await interactionClient.addMultipleIn('../commands/interaction/slash');
  await interactionClient.run();
})();