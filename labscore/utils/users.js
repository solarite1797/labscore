async function getUser(context, query){
  let user;
  let member;
  if(query == "@me") query = context.user.id;
  if(/[0-9]{17,19}/.test(query)){
    let uid = query.match(/[0-9]{17,19}/)
    try{
      user = await context.client.rest.fetchUser(uid)
      if(context.guild) member = await getMember(context, user.username)
      if(member && member.id !== user.id) member = undefined;
    } catch(e){
      user = undefined
    }
  } else {
    member = await getMember(context, query)
    if(member) user = await context.client.rest.fetchUser(member.user.id)
  }
  return {user: user, member: member};
}

async function getMember(context, query){
  if(!context.guild) return;
  if(query == "@me") query = context.author.id;
  if(/[0-9]{17,19}/.test(query)){
    let uid = query.match(/[0-9]{17,19}/)
    try{
      member = await context.guild.fetchMember(uid)
      return member;
    } catch(e){
      return;
    }
  } else {
    let members = await context.guild.fetchMembersSearch({ query })
    if(members) return members.first()
    return;
  }
}

const { Constants } = require('detritus-client');
const { UserFlags } = Constants

const { BADGE_ICONS } = require('../constants');

const BADGE_TYPES = Object.freeze({
  "staff": {
    description: "Discord Staff",
    link: "https://discord.com/company",
    icon: BADGE_ICONS.staff
  },
  "partner": {
    description: "Partnered Server Owner",
    link: "https://discord.com/partners",
    icon: BADGE_ICONS.partner
  },
  "certified_moderator": {
    description: "Moderator Programs Alumni",
    link: "https://discord.com/safety",
    icon: BADGE_ICONS.mod_program
  },
  "hypesquad": {
    description: "HypeSquad Events",
    link: "https://discord.com/hypesquad",
    icon: BADGE_ICONS.hypesquad_events
  },
  "hypesquad_house_1": {
    description: "HypeSquad Bravery",
    link: "https://discord.com/settings/hypesquad-online",
    icon: BADGE_ICONS.hypesquad_bravery
  },
  "hypesquad_house_2": {
    description: "HypeSquad Brilliance",
    link: "https://discord.com/settings/hypesquad-online",
    icon: BADGE_ICONS.hypesquad_brilliance
  },
  "hypesquad_house_3": {
    description: "HypeSquad Balance",
    link: "https://discord.com/settings/hypesquad-online",
    icon: BADGE_ICONS.hypesquad_balance
  },
  "bug_hunter_level_1": {
    description: "Discord Bug Hunter",
    link: "https://support.discord.com/hc/en-us/articles/360046057772-Discord-Bugs",
    icon: BADGE_ICONS.bug_hunter
  },
  "bug_hunter_level_2": {
    description: "Discord Bug Hunter",
    link: "https://support.discord.com/hc/en-us/articles/360046057772-Discord-Bugs",
    icon: BADGE_ICONS.bug_hunter_lvl2
  },
  "active_developer": {
    description: "Active Developer",
    link: "https://support-dev.discord.com/hc/en-us/articles/10113997751447?ref=badge",
    icon: BADGE_ICONS.active_developer
  },
  "verified_developer": {
    description: "Early Verified Bot Developer",
    icon: BADGE_ICONS.bot_developer,
    link: "https://discord.com/developers" //not on the actual badge, added for consistency
  },
  "early_supporter": {
    description: "Early Supporter",
    link: "https://discord.com/settings/premium",
    icon: BADGE_ICONS.early_supporter
  }
})

const BADGES = Object.freeze({
  "staff": UserFlags.STAFF,
  "partner": UserFlags.PARTNER,
  "certified_moderator": UserFlags.DISCORD_CERTIFIED_MODERATOR,
  "hypesquad": UserFlags.HYPESQUAD,
  "hypesquad_house_1": UserFlags.HYPESQUAD_ONLINE_HOUSE_1,
  "hypesquad_house_2": UserFlags.HYPESQUAD_ONLINE_HOUSE_2,
  "hypesquad_house_3": UserFlags.HYPESQUAD_ONLINE_HOUSE_3,
  "bug_hunter_level_1": UserFlags.BUG_HUNTER_LEVEL_1,
  "bug_hunter_level_2": UserFlags.BUG_HUNTER_LEVEL_2,
  "active_developer": UserFlags.ACTIVE_DEVELOPER,
  "verified_developer": UserFlags.VERIFIED_DEVELOPER,
  "early_supporter": UserFlags.PREMIUM_EARLY_SUPPORTER
})

function renderBadges(user){
  let badges = [];
  for(const flag of Object.keys(BADGES)) if(user.hasFlag(BADGES[flag])) badges.push(BADGE_TYPES[flag].icon)
  return badges;
}

module.exports = {
  getUser,
  getMember,
  renderBadges
}