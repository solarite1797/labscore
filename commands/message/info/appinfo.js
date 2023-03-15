const { createEmbed } = require("../../../labscore/utils/embed");
const { editOrReply } = require("../../../labscore/utils/message");
const { icon, highlight, link } = require('../../../labscore/utils/markdown');

const superagent = require('superagent');

const applicationFlags = {
  EMBEDDED_RELEASED: 1,
  GATEWAY_PRESENCE: 12,
  GATEWAY_PRESENCE_LIMITED: 13,
  GATEWAY_GUILD_MEMBERS: 14,
  GATEWAY_GUILD_MEMBERS_LIMITED: 15,
  VERIFICATION_PENDING_GUILD_LIMIT: 16,
  EMBEDDED: 17,
  GATEWAY_MESSAGE_CONTENT: 18,
  GATEWAY_MESSAGE_CONTENT_LIMITED: 19,
  EMBEDDED_FIRST_PARTY: 20,
  APPLICATION_COMMAND_BADGE: 23
}

const applicationFlagNames = {
  EMBEDDED_RELEASED: "Embedded Released",
  GATEWAY_PRESENCE: "Presence Intent",
  GATEWAY_PRESENCE_LIMITED: "Presence Intent (Not approved)",
  GATEWAY_GUILD_MEMBERS: "Guild Members Intent",
  GATEWAY_GUILD_MEMBERS_LIMITED: "Guild Members Intent (Not approved)",
  VERIFICATION_PENDING_GUILD_LIMIT: "Pending Guild Limit",
  EMBEDDED: "Embedded",
  GATEWAY_MESSAGE_CONTENT: "Message Content Intent",
  GATEWAY_MESSAGE_CONTENT_LIMITED: "Message Content Intent (Not approved)",
  EMBEDDED_FIRST_PARTY: "Embedded First Party",
  APPLICATION_COMMAND_BADGE: `Has Slash Commands ${icon("badge_slash")}`
}

module.exports = {
  name: 'appinfo',
  label: 'id',
  aliases: ['ai'],
  metadata: {
    description: 'Displays information about a discord application.',
    description_short: 'Discord application information',
    examples: ['ai 682654466453012553'],
    category: 'info',
    usage: 'appinfo <application id>'
  },
  run: async (context, args) => {
    context.triggerTyping();
    let id;
    if(/[0-9]{17,19}/.test(args.id)){
      id = args.id.match(/[0-9]{17,19}/)
    } else {
      return editOrReply(context, createEmbed("warning", context, "Invalid Application ID"))
    }

    let application;
    let assets;
    try{
      application = await superagent.get(`https://discord.com/api/v9/applications/${id}/rpc`)
      application = application.body
      assets = await superagent.get(`https://discord.com/api/oauth2/applications/${id}/assets`)
      assets = assets.body
    }catch(e){
      return editOrReply(context, createEmbed("warning", context, "Invalid Application"))
    }
    let embed = createEmbed("default", context, {
      description: `${icon("robot")} **${application.name}** ${highlight(`(${application.id})`)}\n${application.description}`,
      fields: []
    })
    
    if(application.icon !== null) embed.thumbnail = {
      url: `https://cdn.discordapp.com/app-icons/${application.id}/${application.icon}.png?size=4096`
    }

    if(application.terms_of_service_url || application.privacy_policy_url){
      let content = []
      if(application.terms_of_service_url) content.push(`${icon("rules")} ${link(application.terms_of_service_url, "Terms of Service")}`)
      if(application.privacy_policy_url) content.push(`${icon("lock")} ${link(application.privacy_policy_url, "Privacy Policy")}`)

      embed.fields.push({
        name: `${icon("link")} Links`,
        value: content.join('\n'),
        inline: true
      })
    }

    if("bot_public" in application){
      let content = []
      if(application.bot_public) content.push(`• Bot is public`)
      if(application.custom_install_url) content.push(`${icon("link")} ${link(application.custom_install_url, "Invite Bot")}`)
      if(application.install_params) content.push(`${icon("downloading")} ${link(`https://discord.com/api/oauth2/authorize?client_id=${application.id}&permissions=${application.install_params.permissions}&scope=${application.install_params.scopes.join('+')}`, "Invite Bot")}`)
      if(application.bot_require_code_grant) content.push(`\n• Bot requires code grant`)
      
      if(content.length) embed.fields.push({
        name: `${icon("robouser")} Bot`,
        value: content.join('\n'),
        inline: true
      })
    }

    if(application.tags){
      embed.fields.push({
        name: `${icon("activity")} Tags`,
        value: application.tags.map(t => highlight(t)).join(', '),
        inline: true
      })
    }

    if(application.max_participants){
      let content = [];

      content.push(`Max Participants: **${application.max_participants}**`)
      if(application.embedded_activity_config !== null){
        if(application.embedded_activity_config?.supported_platforms) content.push(`Supported Platforms: ${application.embedded_activity_config.supported_platforms.map(t => highlight(t)).join(', ')}`)
      }
      
      embed.fields.push({
        name: `${icon("rocket")} Embedded Activity`,
        value: content.join('\n').substr(0,1024),
        inline: true
      })
    }

    if(application.flags){
      let fl = [];
      for (const flag of Object.keys(applicationFlags)) {
        if (application.flags & 1 << applicationFlags[flag]) fl.push('• ' + applicationFlagNames[flag])
      }

      embed.fields.push({
        name: `${icon("flag")} Flags`,
        value: fl.join('\n').substr(0,1024),
        inline: true
      })
    }

    if(assets.length){
      let asset = assets.map(a => link(`https://cdn.discordapp.com/app-assets/${application.id}/${a.id}.png?size=4096`, a.name))
      if(asset.length >= 6) asset[5] = link(`https://canary.discord.com/api/oauth2/applications/${application.id}/assets`, `View ${asset.length - 6} remaining assets`)
      embed.fields.push({
        name: `${icon("image")} Assets`,
        value: '• ' + asset.splice(0, 6).join('\n• ').substr(0, 1020),
        inline: true
      })
    }

    return editOrReply(context, embed)
  },
};