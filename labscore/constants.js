module.exports.DISCORD_INVITES = Object.freeze({
  support: "https://discord.gg/8c4p6xcjru",
  privacy: "https://discord.gg/sQs8FhcTGh"
})

module.exports.PRIVACY_POLICY_SECTIONS = [
  'labsCore does not collect any sort of data about its users.',
  'If the bot encounters unexpected errors we report information about the server, channel, user and command/command arguments (excluding images) to a private log in order to assist with debugging and fixing the problem. You can reference the provided error ID in our support server for further details.',
  `Images modified via our proprietary api are never stored outside of the channel you executed the command in.`
]

module.exports.PRIVACY_POLICY_LAST_UPDATE = 1655325547140

module.exports.COLORS = Object.freeze({
  "error": 15548997,
  "success": 6411359,
  "warning": 16426522,
  "embed": 3092790,
  "brand": 6085465,
  "nsfw": 15549056
})

module.exports.ICONS = Object.freeze({
  "error": "<:ico_error:925832574239121429>",
  "warning": "<:ico_warning:925832574931189830>",
  "success": "<:ico_check:925813919929491516>",
  "success_simple": "<:lc_success:699608002910617670>",
  "failiure": "<:ico_cross:925813919577153639>",
  "failiure_simple": "<:lc_denied:688071041787887647>",
  "activity": "<:ico_activity:903266937247780906>",
  "analytics": "<:ico_analytics:914630522326642761>",
  "audio": "<:ico_audio:903260568037769286>",
  "boost": "<:ico_boost:903266056154513428>",
  "calendar": "<:ico_calendar:903263528557887528>",
  "channel": "<:ico_channel:903265030647210044>",
  "check": "<:ico_check:925813919929491516>",
  "command": "<:ico_command:903266599694372875>",
  "connection": "<:ico_connection:903282945551388702>",
  "cross": "<:ico_cross:925813919577153639>",
  "downloading": "<:ico_downloading:903301897027452998>",
  "emoji": "<:ico_emoji:903265030823374928>",
  "fun": "<:ico_fun:903260112657981510>",
  "house": "<:ico_house:903263528591429702>",
  "image": "<:ico_image:903259583475240961>",
  "info": "<:ico_info:903258571335147592>",
  "list": "<:ico_list:903263528662757426>",
  "list_large": "<:ico_list_large:903265635155443772>",
  "microphone": "<:ico_microphone:903273971993169920>",
  "moderation": "<:ico_moderation:903273971523387404>",
  "nitro": "<:ico_nitro:903263528696283168>",
  "note": "<:ico_note:914630523828179034>",
  "nsfw": "<:ico_nsfw:925817891260072026>",
  "pencil": "<:ico_pencil:903273971636662313>",
  "people": "<:ico_people:915666775700561990>",
  "person": "<:ico_person:903275266485420082>",
  "qr": "<:ico_qr:915278046293000253>",
  "rocket": "<:ico_rocket:914631573238865980>",
  "role": "<:ico_role:903273016455209040>",
  "rules": "<:ico_rules:915269410699243560>",
  "search": "<:ico_search:903258998432731146>",
  "snowsgiving": "<:ico_snowsgiving:915666777646694440>",
  "stats": "<:ico_stats:903265030752047144>",
  "timer": "<:ico_timer:915271575274680350>",
  "util": "<:ico_util:903259395381690379>",
  "locale": "<:ico_locale:925891616986791936>",
  "question": "<:ico_question:949420315677691934>",
  "upvote": "<:ico_upvote:980238682353205259>",
  "downvote": "<:ico_downvote:980238681971494963>",
  "reddit_gold": "<:rdt_gold:993630360527196251>",
  "reddit_silver": "<:rdt_silver:993630364327231628>",
  "reddit_wholesome": "<:rdt_wholesome:993630485379031061>",
  "reddit_helpful": "<:rdt_helpful:993630362372677774>",
  "online": "<:ico_online:994362211772399736>",
  "offline": "<:ico_offline:994362210061123598>",
  "link": "<:ico_link:994364481792647229>"
})

const GUILD_FEATURE_ICONS = Object.freeze({
  ACTIVITY: "<:activity:995078510492266606>",
  AUDIO: "<:audio:995073876381945986>",
  ANIMATED: "<:animated:995034549895569519> ",
  IMAGE: "<:image:995034797112041563>",
  DIRECTORY: "<:directory:995069080467939329>",
  EMOJI: "<:emoji:995036031923539979>",
  EDUCATION: "<:education:995069345577312266>",
  BOOST: "<:boost:995068901794783234>",
  STAFF: "<:staff:995068645430534174>",
  HOME: "<:home:995068501192622150>",
  MOD: "<:mod:995068318161575957>",
  ROLE_SUBSCRIPTIONS: "<:rolesubs:995071222071181444>",
  STAR: "<:star:995071826373910568>",
  STICKER: "<:sticker:995072116405842040>",
  ROLE_ICONS: "<:roleicons:995072431695863819>",
  VERIFIED: "<:verified:995073342350577674>",
  PARTNER: "<:partner:995073343554338867>",
  WALLET: "<:wallet:995075115681329213>",
  TAG: "<:tag:995075110660751370>",
  TICKET: "<:ticket:995075114372694016>",
  THREAD: "<:thread:995075113030529065>",
  PRIVATE_THREAD: "<:privatethread:995075107712143410>",
  CLOCK: "<:clock:995075106328035519>",
  EYE: "<:eye:995076484555345920>",
  EYE_HIDDEN: "<:eyehidden:995076486832857219>",
  GLOBE: "<:globe:995076489542377623>",
  MEGAPHONE: "<:mega:995076487789154396>",
  DISCOVERY: "<:discovery:995077771619471480>",
  DISCOVERY_DISABLED: "<:discoveryoff:995077769836888116>",
  DISCOVERY_ENABLED: "<:discoveryon:995077768029155480>",
  WAVE: "<:wave:995079620468670554>",
  PROFILE: "<:profile:995080477734088855>",
  MESSAGE: "<:message:995080756021952594>",
  BOT_DEVELOPER: "<:botdev:995081351457935391>",
  PEOPLE_RED: "<:peoplered:995081367098499103>"
})

module.exports.GUILD_FEATURES = Object.freeze({
  "ANIMATED_BANNER": {
    "icon": GUILD_FEATURE_ICONS.ANIMATED
  },
  "ANIMATED_ICON": {
    "icon": GUILD_FEATURE_ICONS.ANIMATED
  },
  "AUTO_MODERATION": {
    "icon": GUILD_FEATURE_ICONS.MOD
  },
  "BANNER": {
    "icon": GUILD_FEATURE_ICONS.IMAGE,
    "name": "Server Banner"
  },
  "BOOSTING_TIERS_EXPERIMENT_MEDIUM_GUILD": {
    "icon": GUILD_FEATURE_ICONS.BOOST
  },
  "BOOSTING_TIERS_EXPERIMENT_SMALL_GUILD": {
    "icon": GUILD_FEATURE_ICONS.BOOST
  },
  "BOT_DEVELOPER_EARLY_ACCESS": {
    "icon": GUILD_FEATURE_ICONS.BOT_DEVELOPER,
    "name": "Bot Developer Testing"
  },
  "CHANNEL_BANNER": {
    "icon": GUILD_FEATURE_ICONS.IMAGE,
    "name": "Channel Banners"
  },
  "COMMERCE": {
    "icon": GUILD_FEATURE_ICONS.TAG,
    "name": "Store Channels"
  },
  "COMMUNITY": {
    "icon": GUILD_FEATURE_ICONS.GLOBE
  },
  "CREATOR_MONETIZABLE": {
    "icon": GUILD_FEATURE_ICONS.WALLET
  },
  "CREATOR_MONETIZABLE_DISABLED": {
    "icon": GUILD_FEATURE_ICONS.WALLET
  },
  "DISCOVERABLE": {
    "icon": GUILD_FEATURE_ICONS.DISCOVERY_ENABLED,
    "name": "Discovery"
  },
  "DISCOVERABLE_DISABLED": {
    "icon": GUILD_FEATURE_ICONS.DISCOVERY_DISABLED,
    "name": "Discovery Disabled"
  },
  "ENABLED_DISCOVERABLE_BEFORE": {
    "icon": GUILD_FEATURE_ICONS.DISCOVERY,
    "name": "Has been in Discovery"
  },
  "EXPOSED_TO_ACTIVITIES_WTP_EXPERIMENT": {
    "icon": GUILD_FEATURE_ICONS.ACTIVITY
  },
  "EXPOSED_TO_BOOSTING_TIERS_EXPERIMENT": {
    "icon": GUILD_FEATURE_ICONS.BOOST
  },
  "FEATURABLE": {
    "icon": GUILD_FEATURE_ICONS.STAR
  },
  "FORCE_RELAY": {
    "icon": "🏃💨",
    "name": "Relay Force Enabled"
  },
  "GUILD_HOME_TEST": {
    "icon": GUILD_FEATURE_ICONS.HOME
  },
  "HAD_EARLY_ACTIVITIES_ACCESS": {
    "icon": GUILD_FEATURE_ICONS.ACTIVITY
  },
  "HAS_DIRECTORY_ENTRY": {
    "icon": GUILD_FEATURE_ICONS.DIRECTORY
  },
  "HUB": {
    "icon": GUILD_FEATURE_ICONS.EDUCATION,
    "name": "School Hub"
  },
  "INTERNAL_EMPLOYEE_ONLY": {
    "icon": GUILD_FEATURE_ICONS.STAFF,
    "name": "Internal Employee Server"
  },
  "INVITE_SPLASH": {
    "icon": GUILD_FEATURE_ICONS.IMAGE
  },
  "LINKED_TO_HUB": {
    "icon": GUILD_FEATURE_ICONS.DIRECTORY
  },
  "MEMBER_PROFILES": {
    "icon": GUILD_FEATURE_ICONS.PROFILE
  },
  "MEMBER_VERIFICATION_GATE_ENABLED": {
    "icon": GUILD_FEATURE_ICONS.WAVE,
    "name": "Membership Screening"
  },
  "MONETIZATION_ENABLED": {
    "icon": GUILD_FEATURE_ICONS.WALLET
  },
  "MORE_EMOJI": {
    "icon": GUILD_FEATURE_ICONS.EMOJI
  },
  "MORE_STICKERS": {
    "icon": GUILD_FEATURE_ICONS.STICKER
  },
  "NEWS": {
    "icon": GUILD_FEATURE_ICONS.MEGAPHONE,
    "name": "Announcement Channels"
  },
  "NEW_THREAD_PERMISSIONS": {
    "icon": GUILD_FEATURE_ICONS.THREAD
  },
  "PARTNERED": {
    "icon": GUILD_FEATURE_ICONS.PARTNER
  },
  "PREMIUM_TIER_3_OVERRIDE": {
    "icon": GUILD_FEATURE_ICONS.STAFF
  },
  "PREVIEW_ENABLED": {
    "icon": GUILD_FEATURE_ICONS.EYE
  },
  "PRIVATE_THREADS": {
    "icon": GUILD_FEATURE_ICONS.PRIVATE_THREAD
  },
  "RELAY_ENABLED": {
    "icon": "🏃"
  },
  "ROLE_ICONS": {
    "icon": GUILD_FEATURE_ICONS.ROLE_ICONS
  },
  "ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE": {
    "icon": GUILD_FEATURE_ICONS.ROLE_SUBSCRIPTIONS
  },
  "ROLE_SUBSCRIPTIONS_ENABLED": {
    "icon": GUILD_FEATURE_ICONS.ROLE_SUBSCRIPTIONS,
    "name": "Role Subscriptions"
  },
  "SEVEN_DAY_THREAD_ARCHIVE": {
    "icon": GUILD_FEATURE_ICONS.CLOCK,
    "name": "7 Day Thread Archiving"
  },
  "TEXT_IN_VOICE_ENABLED": {
    "icon": GUILD_FEATURE_ICONS.MESSAGE,
    "name": "Text in Voice"
  },
  "THREADS_ENABLED": {
    "icon": GUILD_FEATURE_ICONS.THREAD
  },
  "THREADS_ENABLED_TESTING": {
    "icon": GUILD_FEATURE_ICONS.THREAD,
    "name": "Thread Testing Enabled"
  },
  "THREAD_DEFAULT_AUTO_ARCHIVE_DURATION": {
    "icon": GUILD_FEATURE_ICONS.CLOCK
  },
  "THREE_DAY_THREAD_ARCHIVE": {
    "icon": GUILD_FEATURE_ICONS.CLOCK,
    "name": "3 Day Thread Archiving"
  },
  "TICKETED_EVENTS_ENABLED": {
    "icon": GUILD_FEATURE_ICONS.TICKET
  },
  "VANITY_URL": {
    "icon": GUILD_FEATURE_ICONS.STAR,
    "name": "Vanity URL"
  },
  "VERIFIED": {
    "icon": GUILD_FEATURE_ICONS.VERIFIED
  },
  "VIP_REGIONS": {
    "icon": GUILD_FEATURE_ICONS.AUDIO,
    "name": "VIP Regions"
  },
  "WELCOME_SCREEN_ENABLED": {
    "icon": GUILD_FEATURE_ICONS.WAVE
  },
  "LURKABLE": {
    "icon": GUILD_FEATURE_ICONS.EYE,
    "name": "Lurking Enabled"
  },
  "MEMBER_LIST_DISABLED": {
    "icon": GUILD_FEATURE_ICONS.PEOPLE_RED
  },
  "PUBLIC_DISABLED": {
    "icon": GUILD_FEATURE_ICONS.GLOBE
  },
  "PUBLIC": {
    "icon": GUILD_FEATURE_ICONS.GLOBE
  },
  "ROLE_SUBSCRIPTIONS_ENABLED_FOR_PURCHASE": {
    "icon": GUILD_FEATURE_ICONS.ROLE_SUBSCRIPTIONS
  },
  "TICKETING_ENABLED": {
    "icon": GUILD_FEATURE_ICONS.TICKET
  }
})

module.exports.TIKTOK_VOICES = [
  {
    "name": "English AU - Female",
    "value": "en_au_001"
  },
  {
    "name": "English AU - Male",
    "value": "en_au_002"
  },
  {
    "name": "English UK - Male",
    "value": "en_uk_001"
  },
  {
    "name": "English US - Female",
    "value": "en_us_001"
  },
  {
    "name": "English US - Male",
    "value": "en_us_006"
  },
  {
    "name": "Ghost Face (Disney)",
    "value": "en_us_ghostface"
  },
  {
    "name": "Chewbacca (Disney)",
    "value": "en_us_chewbacca"
  },
  {
    "name": "C3PO (Disney)",
    "value": "en_us_c3po"
  },
  {
    "name": "Stitch (Disney)",
    "value": "en_us_stitch"
  },
  {
    "name": "Stormtrooper (Disney)",
    "value": "en_us_stormtrooper"
  },
  {
    "name": "Rocket (Disney)",
    "value": "en_us_rocket"
  },
  {
    "name": "French - Male",
    "value": "fr_001"
  },
  {
    "name": "German - Female",
    "value": "de_001"
  },
  {
    "name": "German - Male",
    "value": "de_002"
  },
  {
    "name": "Spanish - Male",
    "value": "es_002"
  },
  {
    "name": "Spanish MX - Male",
    "value": "es_mx_002"
  },
  {
    "name": "Portuguese BR - Female",
    "value": "br_001"
  },
  {
    "name": "Portuguese BR - Male",
    "value": "br_005"
  },
  {
    "name": "Indonesian - Female",
    "value": "id_001"
  },
  {
    "name": "Japanese - Female",
    "value": "jp_001"
  },
  {
    "name": "Japanese - Male",
    "value": "jp_006"
  },
  {
    "name": "Korean - Male",
    "value": "kr_002"
  },
  {
    "name": "Korean - Female",
    "value": "kr_003"
  }
]

module.exports.IMTRANSLATOR_VOICES = [
  {
    "name": "English (Male)",
    "value": "en"
  },
  {
    "name": "English (Female)",
    "value": "enf"
  },
  {
    "name": "Chinese (Female)",
    "value": "zh"
  },
  {
    "name": "Spanish (Carlos)",
    "value": "es"
  },
  {
    "name": "Russian (Female)",
    "value": "ru"
  },
  {
    "name": "French (Female)",
    "value": "fr"
  },
  {
    "name": "German (Male)",
    "value": "de"
  },
  {
    "name": "Italian (Male)",
    "value": "it"
  },
  {
    "name": "Portugese (Female)",
    "value": "pt"
  },
  {
    "name": "Japanese (Female)",
    "value": "ja"
  },
  {
    "name": "Korean (Female)",
    "value": "ko"
  }
]