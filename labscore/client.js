const { Constants, ClusterClient, CommandClient } = require('detritus-client');
//const { createPaginator } = require('./paginator')
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
const paginator =  new Paginator(cluster, {
  maxTime: 300000,
  pageLoop: true,
  pageNumber: true
});

(async () => {
  // Run cluster
  await cluster.run();
  const commandClient = new CommandClient(cluster, {
    activateOnEdits: true,
    mentionsEnabled: true,
    prefix: '.',
    ratelimits: [
      {duration: 60000, limit: 50, type: 'guild'},
      {duration: 5000, limit: 5, type: 'channel'},
    ]
  });
  await commandClient.addMultipleIn('../commands/message/');
  await commandClient.run()
  
  commandClient.on('commandDelete', async ({reply}) => {
    if (reply){
      reply.delete();
    }
  });

})();

module.exports = {
  paginator
}