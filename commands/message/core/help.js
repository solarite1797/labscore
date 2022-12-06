const { codeblock, highlight, icon, link, pill } = require('../../../labscore/utils/markdown')
const { createEmbed, formatPaginationEmbeds } = require('../../../labscore/utils/embed')

const { DISCORD_INVITES } = require('../../../labscore/constants')

const { paginator } = require('../../../labscore/client');
const { editOrReply } = require('../../../labscore/utils/message');

function createHelpPage(context, title, contents, descriptions){
  return {
    "embeds": [
      createEmbed("default", context, {
        description: `${title}\n\n` +
        renderCommandList(contents, descriptions) +
          `\n\n${icon("question")} Use ${pill(`${context.commandClient.prefixes.custom.first()}help <command>`)} to view more information about a command.`
      })
    ]
  }
}

function renderCommandList(commands, descriptions, limit){
  let len = Math.max(...(commands.map(el => el.length))) + 3;
  let render = []
  let i = 0;
  for(const c of commands){
    let pad = len - c.length;

    let desc = descriptions[i]
    if(desc.includes('\n')) desc = desc.split('\n')[0]
    if(desc.length >= 41) desc = desc.substr(0, 40) + '...'

    render.push(` ​ ​ **​\` ${c}${' '.repeat(pad)}\`** ​ ​ ​ ​ ​${desc}`)
    i++
  }

  if(limit && render.length > limit) render.splice(limit, 999)

  return render.join('\n')
}

function createCommandPage(context, prefix, command){
  alias = ' ​ '
  if(command.aliases.length >= 1){
    for(const al of command.aliases) alias += pill(al)
    alias += "\n"
  }

  let page = createEmbed("default", context, {
    description: `${icon("command")}  ${pill(command.name)}\n${alias}\n${command.metadata.description}`,
    fields: []
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
      value: '```' + ex.join('``````') + '```',
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
  "search": `${icon("search")} Search Commands`,
  "utils": `${icon("utils")} Utility Commands`,
  "image": `${icon("image")} Image Commands`,
  "mod": `${icon("moderation")} Moderation Commands`
}

module.exports = {
  name: 'help',
  label: 'command',
  metadata: {
    description: 'List all commands, get more information about individual commands.',
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

        let cmds = results.map((m)=>{return m.name})
        let dscs = results.map((m)=>{return m.metadata.description})
        pages.push({embeds:[
          createEmbed("default", context, {
            description: `Check pages for detailed command descriptions.\n\n` + renderCommandList(cmds, dscs, 15) + `\n\n${icon("question")} Need help with something else? Contact us via our ${link(DISCORD_INVITES.support, "Support Server")}.`
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
      let descriptions = {}

      let prefix = context.commandClient.prefixes.custom.first()
      for(const c of context.commandClient.commands){
        if(!categories[c.metadata.category]) continue;
        if(!commands[c.metadata.category]) commands[c.metadata.category] = []
        if(!descriptions[c.metadata.category]) descriptions[c.metadata.category] = []
        commands[c.metadata.category].push(`${c.name}`);
        descriptions[c.metadata.category].push(`${c.metadata.description}`);
      }

      let pages = []
      for(const cat of Object.keys(categories)){
        pages.push(createHelpPage(context, categories[cat], commands[cat], descriptions[cat]))
      }
      
      pages = formatPaginationEmbeds(pages)
      const paging = await paginator.createPaginator({
        context,
        pages
      });
    }
  },
};