async function getUser(context, query){
  let user;
  let member;
  if(query == "@me") query = context.user.id;
  if(/[0-9]{17,19}/.test(query)){
    let uid = query.match(/[0-9]{17,19}/)
    try{
      user = await context.client.rest.fetchUser(uid)
      if(context.guild) member = await getMember(context, user.id)
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
const { link } = require('./markdown');
const { UserFlags } = Constants

const BADGE_TYPES = Object.freeze({
  "staff": {
    description: "Discord Staff",
    link: "https://discord.com/company",
    icon: "<:badge_staff:903276633161609246>"
  },
  "partner": {
    description: "Partnered Server Owner",
    link: "https://discord.com/partners",
    icon: "<:badge_partner:903276631559389196>"
  },
  "certified_moderator": {
    description: "Moderator Programs Alumni",
    link: "https://discord.com/safety",
    icon: "<:badge_mod_new:1049594117849632778>"
  },
  "hypesquad": {
    description: "HypeSquad Events",
    link: "https://discord.com/hypesquad",
    icon: "<:badge_hypesquad:903276631408394351>"
  },
  "hypesquad_house_1": {
    description: "HypeSquad Bravery",
    link: "https://discord.com/settings/hypesquad-online",
    icon: "<:badge_hypesquad_bravery:903276631790059540>"
  },
  "hypesquad_house_2": {
    description: "HypeSquad Brilliance",
    link: "https://discord.com/settings/hypesquad-online",
    icon: "<:badge_hypesquad_brilliance:903276631261597706>"
  },
  "hypesquad_house_3": {
    description: "HypeSquad Balance",
    link: "https://discord.com/settings/hypesquad-online",
    icon: "<:badge_hypesquad_balance:903276631211249674>"
  },
  "bug_hunter_level_1": {
    description: "Discord Bug Hunter",
    link: "https://support.discord.com/hc/en-us/articles/360046057772-Discord-Bugs",
    icon: "<:badge_bughunter:903276631173509131>"
  },
  "bug_hunter_level_2": {
    description: "Discord Bug Hunter",
    link: "https://support.discord.com/hc/en-us/articles/360046057772-Discord-Bugs",
    icon: "<:badge_bughunter_2:903276883523797033>"
  },
  "active_developer": {
    description: "Active Developer",
    link: "https://support-dev.discord.com/hc/en-us/articles/10113997751447?ref=badge",
    icon: "<:active_developer:1112811846009892915>"
  },
  "verified_developer": {
    description: "Early Verified Bot Developer",
    icon: "<:badge_botdev:903276631173509130>",
    link: "https://discord.com/developers" //not on the actual badge, added for consistency
  },
  "early_supporter": {
    description: "Early Supporter",
    link: "https://discord.com/settings/premium",
    icon: "<:badge_earlysupporter:903277590956101672>"
  }
})

const BADGES = Object.freeze({
  [UserFlags.STAFF]: 'staff',
  [UserFlags.PARTNER]: 'partner',
  [UserFlags.DISCORD_CERTIFIED_MODERATOR]: 'certified_moderator',
  [UserFlags.HYPESQUAD]: 'hypesquad',
  [UserFlags.HYPESQUAD_ONLINE_HOUSE_1]: 'hypesquad_house_1',
  [UserFlags.HYPESQUAD_ONLINE_HOUSE_2]: 'hypesquad_house_2',
  [UserFlags.HYPESQUAD_ONLINE_HOUSE_3]: 'hypesquad_house_3',
  [UserFlags.BUG_HUNTER_LEVEL_1]: 'bug_hunter_level_1',
  [UserFlags.BUG_HUNTER_LEVEL_2]: 'bug_hunter_level_2',
  [1<<22]: 'active_developer',
  [UserFlags.VERIFIED_DEVELOPER]: 'verified_developer',
  [UserFlags.PREMIUM_EARLY_SUPPORTER]: 'early_supporter',
})

function renderBadges(user){
  let badges = [];
  for(const flag of Object.keys(BADGES)) if(user.hasFlag(parseInt(flag))) badges.push(link(BADGE_TYPES[BADGES[flag]].link, BADGE_TYPES[BADGES[flag]].icon, BADGE_TYPES[BADGES[flag]].description))
  return badges;
}

module.exports = {
  getUser,
  getMember,
  renderBadges
}