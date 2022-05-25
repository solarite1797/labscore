const { Constants } = require('detritus-client');
const { paginator } = require('../../../../labscore/client');

const createEmbedMessage = (title, description) => ({
  embeds: [{ title, description }]
});

module.exports = {
  name: 'page',
  metadata: {
    description: 'pagination test',
    examples: ['page'],
    category: 'dev',
    usage: 'page'
  },
  run: async (context) => {
    const message = context
    const pages = [
      createEmbedMessage("Page", "ddd"),
      createEmbedMessage("Page2", "eee"),
      createEmbedMessage("Page 3", "h")
    ]
    const paging = await paginator.createPaginator({
      context,
      pages
    });
  },
};