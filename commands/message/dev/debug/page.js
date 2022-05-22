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
    const message = context.message
    const pages = [
      createEmbedMessage("Page", "ddd"),
      createEmbedMessage("Page2", "eee"),
      createEmbedMessage("Page 3", "h")
    ]
    const paging = await paginator.createPaginator({
            // message is the message the user has sent
            message,
            // pages is an array of pages (will be passed as parameter in Message#edit)
            pages
        });
  },
};