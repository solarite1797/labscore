const { paginator } = require('#client');
const { DISCORD_INVITES, DEFAULT_PREFIXES } = require('#constants');

const { createEmbed, formatPaginationEmbeds, page } = require('#utils/embed')
const { codeblock, icon, link, pill, smallPill, iconPill, stringwrap } = require('#utils/markdown')
const { editOrReply } = require('#utils/message');
const { hasFeature } = require('#utils/testing');

// TODO: Turn this into a general purpose permissions constant
const { Permissions } = require("detritus-client/lib/constants");

function createHelpPage(context, title, contents, descriptions) {
  return page(createEmbed("default", context, {
    description: `${title}\n\n` +
      renderCommandList(contents, descriptions) +
      `\n\n${icon("question")} Use ${smallPill(`${DEFAULT_PREFIXES[0]}help <command>`)} to view more information about a command.` +
      `\n${icon("discord")} Need help with anything else? ${DISCORD_INVITES.help}`
  }))
}

function renderCommandList(commands, descriptions, limit) {
  let len = Math.max(...(commands.map(el => el.length))) + 3;
  let render = []
  let i = 0;
  for (const c of commands) {
    let pad = len - c.length;

    let desc = descriptions[i]
    if (desc.includes('\n')) desc = desc.split('\n')[0]
    if (desc.length >= 41) desc = stringwrap(desc, 40)

    render.push(` ​ ​ \` ${c}${' '.repeat(pad)}\` ​ ​ ​ ​ ​${desc}`)
    i++
  }

  if (limit && render.length > limit) render.splice(limit, 999)

  return render.join('\n')
}

function createCommandPage(context, prefix, command, slashCommands) {
  alias = ' ​ '
  if (command.aliases.length >= 1) {
    for (const al of command.aliases) alias += smallPill(al)
    alias += "\n"
  }

  let explicit = '';
  if (command.metadata.explicit) explicit = `\n${icon('channel_nsfw')} This command contains explicit content and can only be used in Age-Restricted channels. ${link("https://support.discord.com/hc/en-us/articles/115000084051-Age-Restricted-Channels-and-Content", "Learn More")}\n`

  // Render argument pills if present
  let args = [];
  if (command.argParser.args) {
    for (const a of command.argParser.args) {
      let argument = `-${a._name} <${a._type.replace('bool', 'true/false')}>`
      argument = pill(argument)
      if (a.help) argument += ` ​ ${a.help}`
      argument += `\n ​ ​ `
      if (a.default !== "") argument += ` ​ ​ ${smallPill(`default: ${a.default}`)}`
      if (!a.required) argument += ` ​ ​ ${smallPill('optional')}`
      args.push(argument)
    }
  }

  let cPage = createEmbed("default", context, {
    description: `${icon("slash")}  ${smallPill(command.name)}\n${alias}${explicit}\n${command.metadata.description}`,
    fields: []
  })

  if(args.length >= 1) cPage.description += `\n\n${args.join('\n\n')}`;

  // Adds the slash command hint, if available
  if(command.metadata.slashCommand){
    let cmd = slashCommands.filter((c)=>c.name === command.metadata.slashCommand);
    if(cmd.length >= 1) {
      switch(cmd[0].type){
        case 1:
          cPage.description += `\n\n${icon("slash")} Available via **Slash Commands**.\n-# ${icon("subtext_lightbulb")}  Click on </${cmd[0].name}:${cmd[0].ids.first()}> to try it out! ${link(context.application.oauth2UrlFormat().replace("ptb.discordapp.com","discord.com"), `Add ${context.client.user.username}`, `Add ${context.client.user.username} to use this command anywhere.`)}`
          break;
        case 2:
          cPage.description += `\n\n${icon("slash")} Available via **Context Menu Commands**\n-# ${icon("subtext_lightbulb")}  Right-Click on someone's avatar! ${link(context.application.oauth2UrlFormat().replace("ptb.discordapp.com","discord.com"), `Add ${context.client.user.username}`, `Add ${context.client.user.username} to use this command anywhere.`)}`
          break;
        case 3:
          cPage.description += `\n\n${icon("slash")} Available via **User Context Commands**.\n-# ${icon("subtext_lightbulb")}  Right-Click on any message! ${link(context.application.oauth2UrlFormat().replace("ptb.discordapp.com","discord.com"), `Add ${context.client.user.username}`, `Add ${context.client.user.username} to use this command anywhere.`)}`
          break;
        default:
          break;
      }
    }
  }

  // TODO: maybe try building a little parser that highlights things via ansi
  if (command.metadata.usage) cPage.fields.push({
    name: `${icon("settings")} Usage`,
    value: codeblock("py", [prefix + command.metadata.usage]),
    inline: true
  })

  if (command.metadata.examples) {
    let ex = []
    for (const e of command.metadata.examples) ex.push(prefix + e)
    cPage.fields.push({
      name: `${icon("example")} Examples`,
      value: '```' + ex.join('``````') + '```',
      inline: false
    })
  }
  return page(cPage);
}

// These categories will be displayed to users, add them in the correct order
const categories = {
  "core": `${iconPill("home", "Core Commands")}`,
  "info": `${iconPill("information", "Information Commands")}`,
  "search": `${iconPill("mag", "Search Commands")}`,
  "utils": `${iconPill("tools", "Utility Commands")}`,
  "fun": `${iconPill("stars", "Fun Commands")}`,
  "image": `${iconPill("image", "Image Commands")}`,
  "mod": `${iconPill("shield", "Moderation Commands")}`
}

module.exports = {
  name: 'help',
  label: 'command',
  aliases: ['cmds', 'cmd', 'commands', 'command', 'pleasehelpmeiamgoingtoexplode', 'h', '?'],
  metadata: {
    description: 'List all commands, get more information about individual commands.',
    description_short: 'Show full command list',
    examples: ['help ping'],
    category: 'core',
    usage: 'help [<command>]'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context, args) => {
    if(await hasFeature(context, "core/help")) categories["limited"] = `${iconPill("stars", "Limited Test Commands")}`;
    else if (categories["limited"]) delete categories["limited"]

    if (args.command) {
      await context.triggerTyping()
      // Detailed command view

      let resultScores = {}
      let resultMappings = {}

      for (const c of context.commandClient.commands) {
        if (c.name.includes(args.command.toLowerCase()) || c.aliases.filter((f) => { return f.includes(args.command.toLowerCase()) }).length >= 1) {
          if (c.metadata.explicit && !context.channel.nsfw) continue;
          if (!categories[c.metadata.category] && !context.user.isClientOwner) continue;
          resultScores[c.name] = 1
          resultMappings[c.name] = c
        }
        // Boost exact matches to rank higher in the result list
        if (c.name == args.command.toLowerCase()) resultScores[c.name] += 1
        if (c.aliases.filter((f) => { return f == args.command.toLowerCase() }).length >= 1) resultScores[c.name] += 1
      }

      let results = [];
      resultScores = Object.fromEntries(Object.entries(resultScores).sort(([, a], [, b]) => b - a));
      for (const k of Object.keys(resultScores)) results.push(resultMappings[k])

      let pages = []
      let prefix = DEFAULT_PREFIXES[0]
      try {

        if (results.length == 0) return editOrReply(context, createEmbed("warning", context, "No commands found for the provided query."))

        if (results.length > 1) {
          // Command overview

          let cmds = results.map((m) => { return m.name })
          let dscs = results.map((m) => { return m.metadata.description_short })
          pages.push(page(createEmbed("default", context, {
            description: `Check the pages for full command details.\n\n` + renderCommandList(cmds, dscs, 15) + `\n\n${icon("discord")} Need help with anything else? ${DISCORD_INVITES.support}`
          })))

          // Generate command detail pages
          for (const c of results) {
            pages.push(createCommandPage(context, prefix, c, context.interactionCommandClient.commands))
          }

          await paginator.createPaginator({
            context,
            pages: formatPaginationEmbeds(pages)
          });
          return;
        } else {
          return editOrReply(context, createCommandPage(context, prefix, results[0], context.interactionCommandClient.commands))
        }
      } catch (e) {
        console.log(e)
      }
    } else {
      // Full command list
      let commands = {}
      let descriptions = {}

      for (const c of context.commandClient.commands) {
        if (!categories[c.metadata.category]) continue;
        if (c.metadata.explicit && !context.channel.nsfw) continue;
        if (!commands[c.metadata.category]) commands[c.metadata.category] = []
        if (!descriptions[c.metadata.category]) descriptions[c.metadata.category] = []
        commands[c.metadata.category].push(`${c.name}`);
        descriptions[c.metadata.category].push(`${c.metadata.description_short}`);
      }

      let pages = []
      for (const cat of Object.keys(categories)) {
        pages.push(createHelpPage(context, categories[cat], commands[cat], descriptions[cat]))
      }

      await paginator.createPaginator({
        context,
        pages: formatPaginationEmbeds(pages)
      });
    }
  },
};