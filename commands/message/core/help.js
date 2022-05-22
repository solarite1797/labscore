const { codeblock, highlight, icon } = require('../../../labscore/utils/markdown')
const { createEmbed, formatPaginationEmbeds } = require('../../../labscore/utils/embed')

const { paginator } = require('../../../labscore/client');

function createHelpPage(context, title, contents){
  return {
    "embeds": [
      createEmbed("default", context, {
        description: `${title}\n` +
          codeblock("ansi", contents) +
          `\n${icon("question")} Use ${highlight(`${context.commandClient.prefixes.custom.first()}help <command>`)} to view more information about a command.`
      })
    ]
  }
}

// These categories will be displayed to users, add them in the correct order
const categories = {
  "core": `${icon("house")} Core Commands`,
  "search": `${icon("search")} Search Commands`,
  "dev": `${icon("analytics")} Development`
}

module.exports = {
  name: 'help',
  label: 'command',
  metadata: {
    description: 'Command List',
    examples: ['help ping'],
    category: 'core',
    usage: 'help [<command>]'
  },
  run: async (context, args) => {
    context.triggerTyping();
    if(args.label){
      // Detailed command view
    } else {
      // Full command list
      let commands = {
      }
      let prefix = context.commandClient.prefixes.custom.first()
      for(const c of context.commandClient.commands){
        if(!categories[c.metadata.category]) continue;
        if(!commands[c.metadata.category]) commands[c.metadata.category] = []
        commands[c.metadata.category].push(`${prefix}${c.name}`)
      }

      let pages = []
      for(const cat of Object.keys(categories)){
        pages.push(createHelpPage(context, categories[cat], commands[cat]))
      }
      
      pages = formatPaginationEmbeds(pages)
      const message = context.message
      const paging = await paginator.createPaginator({
        message,
        pages
      });
    }
  },
};