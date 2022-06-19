const { Constants, ClusterClient, CommandClient, InteractionCommandClient } = require('detritus-client');
const Paginator = require('./paginator').PaginatorCluster

// Create client
const cluster = new ClusterClient("", {
  cache: {messages: {expire: 60 * 60 * 1000}},
  gateway: {
    identifyProperties: {
      $browser: 'Discord Android',
    },
    presence: {
      activity: {
        name: 'v2',
        type: Constants.ActivityTypes.WATCHING,
      },
      status: Constants.PresenceStatuses.ONLINE,
    },
  }
});

// Create this clusters paginator
module.exports.paginator = new Paginator(cluster, {
  maxTime: 300000,
  pageLoop: true,
  pageNumber: true
});

let commandPrefix = 'lc..'
if(process.env.PREFIX_OVERRIDE) commandPrefix = process.env.PREFIX_OVERRIDE;

(async () => {
  await cluster.run();
  const commandClient = new CommandClient(cluster, {
    activateOnEdits: true,
    mentionsEnabled: true,
    prefix: commandPrefix,
    ratelimits: [
      {duration: 60000, limit: 50, type: 'guild'},
      {duration: 5000, limit: 5, type: 'channel'},
    ]
  });
  await commandClient.addMultipleIn('../commands/message/');
  await commandClient.run()

  const interactionClient = new InteractionCommandClient()
  await interactionClient.addMultipleIn('../commands/interaction/');
  await interactionClient.run();

})();