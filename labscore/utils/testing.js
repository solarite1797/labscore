
// Get Test Config
let LIMITED_TEST_GUILDS;
if(process.env.TESTING_SERVER_IDS) LIMITED_TEST_GUILDS = process.env.TESTING_SERVER_IDS.split(';')
let LIMITED_TEST_CHANNELS;
if(process.env.TESTING_CHANNEL_IDS) LIMITED_TEST_CHANNELS = process.env.TESTING_CHANNEL_IDS.split(';')
let LIMITED_TEST_USERS;
if(process.env.TESTING_USER_IDS) LIMITED_TEST_USERS = process.env.TESTING_USER_IDS.split(';')

function isLimitedTestGuild(guild){
  if(LIMITED_TEST_GUILDS && LIMITED_TEST_GUILDS.includes(guild.id)) return true;
  return false;
}

function isLimitedTestChannel(channel){
  if(LIMITED_TEST_CHANNELS && LIMITED_TEST_CHANNELS.includes(channel.id)) return true;
  return false;
}

function isLimitedTestUser(user){
  if(LIMITED_TEST_USERS && LIMITED_TEST_USERS.includes(user.id)) return true;
  return false;
}

function canUseLimitedTestCommands(context){
  if(isLimitedTestGuild(context.guild)) return true;
  if(isLimitedTestChannel(context.channel)) return true;
  if(isLimitedTestUser(context.user)) return true;
  return false;
}

module.exports = {
  canUseLimitedTestCommands,
  isLimitedTestGuild,
  isLimitedTestChannel,
  isLimitedTestUser
}