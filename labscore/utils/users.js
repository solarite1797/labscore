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

const { Constants } = require('detritus-client')
const { UserFlags } = Constants

const BADGES = Object.freeze({
  [UserFlags.STAFF]: '<:badge_staff:903276633161609246>',
  [UserFlags.PARTNER]: '<:badge_partner:903276631559389196>',
  [UserFlags.DISCORD_CERTIFIED_MODERATOR]: '<:badge_mod_new:1049594117849632778>',
  [UserFlags.HYPESQUAD]: '<:badge_hypesquad:903276631408394351>',
  [UserFlags.HYPESQUAD_ONLINE_HOUSE_1]: '<:badge_hypesquad_bravery:903276631790059540>',
  [UserFlags.HYPESQUAD_ONLINE_HOUSE_2]: '<:badge_hypesquad_brilliance:903276631261597706>',
  [UserFlags.HYPESQUAD_ONLINE_HOUSE_3]: '<:badge_hypesquad_balance:903276631211249674>',
  [UserFlags.BUG_HUNTER_LEVEL_1]: '<:badge_bughunter:903276631173509131>',
  [UserFlags.BUG_HUNTER_LEVEL_2]: '<:badge_bughunter_2:903276883523797033>',
  [1<<22]: '<:active_developer:1112811846009892915>',
  [UserFlags.VERIFIED_DEVELOPER]: '<:badge_botdev:903276631173509130>',
  [UserFlags.PREMIUM_EARLY_SUPPORTER]: '<:badge_earlysupporter:903277590956101672>',
})

function renderBadges(user){
  let badges = [];
  for(const flag of Object.keys(BADGES)) if(user.hasFlag(parseInt(flag))) badges.push(BADGES[flag])
  return badges;
}

module.exports = {
  getUser,
  getMember,
  renderBadges
}