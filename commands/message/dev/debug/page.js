const { Constants } = require('detritus-client');
const { InteractionCallbackTypes } = require('detritus-client/lib/constants');
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
    const buttons = ["previous","next", {customId: "german", emoji: `<:german:856501761857683486>`, style: 4}]
    const page = await paginator.createPaginator({
      context,
      pages,
      buttons
    });

    // Custom button example, event only triggers for 
    page.on("interaction", async (e) => {
      if(e.context.customId == "german"){
        await e.context.respond(InteractionCallbackTypes.UPDATE_MESSAGE, {"content": "german button activated"})
      }
    })
  },
};