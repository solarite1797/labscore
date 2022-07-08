const { codeblock, highlight, icon, link } = require('../../../labscore/utils/markdown')
const { createEmbed, formatPaginationEmbeds } = require('../../../labscore/utils/embed')

const { DISCORD_INVITES } = require('../../../labscore/constants')

const { paginator } = require('../../../labscore/client');
const { editOrReply } = require('../../../labscore/utils/message');

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

function createCommandPage(context, prefix, command){
  let page = createEmbed("default", context, {
    description: `**${prefix}${command.name}**\n${command.metadata.description}`,
    fields: []
  })
  if(command.aliases.length >= 1) page.fields.push({
    name: `${icon("activity")} Aliases`,
    value: command.aliases.join(', '),
    inline: true
  })

  // TODO: maybe try building a little parser that highlights things via ansi
  if(command.metadata.usage) page.fields.push({
    name: `${icon("util")} Usage`,
    value: codeblock("py", [prefix + command.metadata.usage]),
    inline: true
  })
  
  if(command.metadata.examples){
    let ex = []
    for(const e of command.metadata.examples) ex.push(prefix + e)
    page.fields.push({
      name: `${icon("info")} Examples`,
      value: codeblock("ansi", ex),
      inline: false
    })
  }
  return {
    embeds: [page]
  };
}

// These categories will be displayed to users, add them in the correct order
const categories = {
  "core": `${icon("house")} Core Commands`,
  "info": `${icon("info")} Information Commands`,
  "utils": `${icon("utils")} Utility Commands`,
  "image": `${icon("image")} Image Commands`,
  "mod": `${icon("moderation")} Moderation Commands`,
  "search": `${icon("search")} Search Commands`
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
    if(args.command){
      // Detailed command view
      let results = []
      
      for(const c of context.commandClient.commands){
        if(c.name.includes(args.command) || c.aliases.filter((f)=>{return f.includes(args.command)}).length >= 1) results.push(c)
      }

      let pages = []
      let prefix = context.commandClient.prefixes.custom.first()
      try{
        
      if(results.length == 0) return editOrReply(context, {embeds: [createEmbed("warning", context, "No commands found for the provided query.")]})

      if(results.length > 1) {
        // Command overview
        pages.push({embeds:[
          createEmbed("default", context, {
            description: `Check pages for detailed command descriptions.\n` + codeblock("ansi", [(prefix + results.map((m)=>{return m.name}).splice(0, 10).join('\n' + prefix))]) + `\n${icon("question")} Need help with something else? Contact us via our ${link(DISCORD_INVITES.support, "Support Server")}.`
          })
        ]})

        // Generate command detail pages
        for(const c of results){
          pages.push(createCommandPage(context, prefix, c))
        }

        pages = formatPaginationEmbeds(pages)
        const paging = await paginator.createPaginator({
          context,
          pages
        });
        return;
      } else {
        return editOrReply(context, createCommandPage(context, prefix, results[0]))
      }
      }catch(e){
        console.log(e)
      }
    } else {
      // Full command list
      let commands = {}

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
      const paging = await paginator.createPaginator({
        context,
        pages
      });
    }
  },
};