const { ClusterClient, CommandClient, InteractionCommandClient } = require('detritus-client');
const { ActivityTypes, PresenceStatuses, GatewayIntents, Permissions, ClientEvents } = require('detritus-client/lib/constants');

const { PERMISSIONS_TEXT, DEFAULT_BOT_NAME, DEFAULT_PREFIXES } = require('#constants');
const Paginator = require('./paginator').PaginatorCluster

const cluster = new ClusterClient("", {
  cache: {messages: {expire: 30 * 60 * 1000}},
  gateway: {
    identifyProperties: {
      $browser: 'Discord Android',
    },
    intents: [
      GatewayIntents.GUILDS,
      GatewayIntents.GUILD_MESSAGES,
      GatewayIntents.GUILD_EMOJIS,
      GatewayIntents.MESSAGE_CONTENT
    ],
    presence: {
      activity: {
        state: `${DEFAULT_PREFIXES[0]}help ​ • ​ ${DEFAULT_BOT_NAME}`,
        name: `${DEFAULT_PREFIXES[0]}help ​ ​• ​ ${DEFAULT_BOT_NAME}`,
        emoji: {
          name: "🧪"
        },
        type: ActivityTypes.CUSTOM_STATUS,
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

commandPrefixes = DEFAULT_PREFIXES
if(process.env.PREFIX_OVERRIDE) commandPrefixes = process.env.PREFIX_OVERRIDE.split('|');

const commandClient = new CommandClient(cluster, {
  activateOnEdits: true,
  mentionsEnabled: true,
  prefix: commandPrefixes[0],
  prefixes: commandPrefixes,
  useClusterClient: true,
  ratelimits: [
    {duration: 60000, limit: 50, type: 'guild'},
    {duration: 5000, limit: 5, type: 'channel'},
  ],
  onCommandCheck: async (context, command) => {
    /*
      I don't know why, I don't know since when - but timeouts apply to bots now.
      This code checks if the bot is currently timed out, preventing any and all
      commands from being executed.
    */

    // Only apply filters below to a GUILD context.
    if(!context.guild) return true;

    let b = context.guild.members.get(context.client.user.id);
    // Bot member is not cached for whatever reason, fetch it.
    if(b === undefined) b = await context.guild.fetchMember(context.client.user.id);

    // Bot is (potentially) timed out.
    if(b.communicationDisabledUntil !== null){
      // Timeout is active. This additional check is necessary,
      // as our cache does not appear to update when the bots
      // timeout expires.
      if((b.communicationDisabledUntilUnix - Date.now()) >= 1) return false;
    }

    // Command should be fine to run.
    return true;
  }
});

const interactionClient = new InteractionCommandClient(cluster, {
  useClusterClient: true
})

const { maintower, basecamp, ingest } = require('#logging');

const { createEmbed } = require('#utils/embed');
const { icon, highlight } = require('#utils/markdown');
const { editOrReply } = require('#utils/message');

// Analytics
commandClient.on('commandRan', ({ context, command }) => { if(!command.metadata.use_custom_ingest) ingest(command.name, "command_ran")} )
interactionClient.on('commandRan', ({ context, command }) => { if(!command.metadata.use_custom_ingest) ingest(command.name, "slash_command_ran")} )

// Handle missing permission errors
commandClient.on('commandPermissionsFailClient', ({context, permissions}) => {
  if(!context.channel.can(Permissions.SEND_MESSAGES)) return;
  const perms = [];
  for (let permission of permissions) {
    if (permission in PERMISSIONS_TEXT) {
      perms.push(highlight(` ${PERMISSIONS_TEXT[permission]} `));
    } else {
      perms.push(highlight(` (Unknown: ${permission}) `));
    }
  }

  // Send a nicer looking embed if the bot has permission to do so
  if(context.channel.can(Permissions.EMBED_LINKS)) return editOrReply(context, createEmbed("errordetail", context, {
    error: "Missing Permissions",
    content: `${context.client.user.username} needs the following permissions in <#${context.channel.id}>:\n${perms.join(' ')}`
  }))
  return editOrReply(context, {
    content: `${context.client.user.username} needs the following permissions in <#${context.channel.id}> to execute this command: ${perms.join(', ')}`
  })
})


// Delete command responses if the user chooses to delete their trigger or edits the command away
commandClient.on('commandDelete', async ({context, reply}) => {
  if(context.message?.deleted) return reply.delete();

  let hasPrefix = false;
  for(const p of commandPrefixes) if(context.message.content.toLowerCase().startsWith(p)) hasPrefix = true;
  if(context.message.content.startsWith(context.client.user.mention)) hasPrefix = true;
  
  if(!reply.deleted && !hasPrefix) reply.delete();
})

commandClient.on('commandRunError', async ({context, error}) => {
  try{
    // No service configured
    if(!process.env.MAINTOWER_URL){
      console.log(error);

      await editOrReply(context, {
        content: `${icon("cross")} Something went wrong while attempting to run this command. (check console)`
      })
      
      return;
    }

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


interactionClient.on('commandRunError', async ({context, error}) => {
  try{
    // No service configured
    if(!process.env.MAINTOWER_URL){
      console.error(error ? error.stack || error.message : error);
  
      await editOrReply(context, {
        content: `${icon("cross")} Something went wrong while attempting to run this command. (check console)`
      })
      
      return;
    }

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

    packages.data.command = context.command.name
    packages.data.error = error ? error.stack || error.message : error
    if(error.raw) packages.data.raw = JSON.stringify(error.raw, null, 2)

    let req = await maintower(packages, "01")

    await editOrReply(context, {
      content: `${icon("cross")} Something went wrong while attempting to run this command. (Reference: \`${req}\`)`
    })
  }catch(e){
    console.log(e)
    await editOrReply(context, {
      content: `${icon("cross")} Something went wrong while attempting to run this command.`
    })
  }
});

(async () => {

  // Logging
  cluster.on(ClientEvents.REST_RESPONSE, async ({response, restRequest, shard}) => {
    // No service configured
    if(!process.env.MAINTOWER_URL) return;

    const route = response.request.route;
    if (route) {
      if (!response.ok) {
        const message = `Shard #${shard.shardId}: (NOT OK) ${response.statusCode} ${response.request.method}-${response.request.url} (${route.path})`;
        console.log(message);
        console.log(await response.text());
        await basecamp(`<:ico_w3:1086624963047460874>\`[${process.env.HOSTNAME}]\` **\` SHARD_REST_ERROR  \`**  \`[Shard ${shard.shardId}]\` Shard request error: \`${response.statusCode}\` @ \`${Date.now()}\`\n**\` ${response.request.method}  \`** \`${response.request.url}\` (${route.path})\n\`\`\`js\n${await response.text()}\`\`\``)
      }
    }
  });

  cluster.on(ClientEvents.WARN, async ({error}) => {
    if(!process.env.MAINTOWER_URL) { console.warn(error); return; }
    await basecamp(`<:ico_w2:1086624961025810485>\`[${process.env.HOSTNAME}]\` **\` CLUSTER_WARNING  \`**  Cluster ${cluster.manager.clusterId} reported warning @ \`${Date.now()}\`:\n\`\`\`${error}\`\`\``)
  });

  try{
    await cluster.run();
    await commandClient.addMultipleIn('../commands/message/');
    await commandClient.run()
  
    await interactionClient.addMultipleIn('../commands/interaction/context');
    await interactionClient.addMultipleIn('../commands/interaction/user');
    await interactionClient.addMultipleIn('../commands/interaction/slash');
    await interactionClient.run();
  } catch(e){
    console.log(e)
    console.log(e.errors)
  }
})();