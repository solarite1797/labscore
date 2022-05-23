async function getUser(context, query){
  let user;
  if(/[0-9]{18}/.test(query)){ // User ID supplied, use that
    let uid = query.match(/[0-9]{18}/)
    try{
      user = await context.client.rest.fetchUser(uid)
    } catch(e){
      user = undefined
    }
  } else {
    user = await getMember(context, query)
    if(user) user = user.user
  }
  return user;
}

async function getMember(context, query){
  if(!context.guild) return;
  let members = await context.guild.fetchMembersSearch({ query })
  console.log(members)
  if(members) return members.first()
  return;
}

module.exports = {
  getUser,
  getMember
}