const { icon, timestamp, link, iconLinkPill } = require('../../../labscore/utils/markdown')
const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message');
const { PRIVACY_POLICY_LAST_UPDATE, PRIVACY_POLICY_SECTIONS, DISCORD_INVITES, COLORS, PRIVACY_POLICY_PREVIOUS_REVISION } = require('../../../labscore/constants');

const { Permissions } = require("detritus-client/lib/constants");

module.exports = {
  name: 'privacy',
  metadata: {
    description: 'Shows the bots privacy policy.',
    description_short: 'Privacy policy',
    category: 'core',
    usage: 'privacy'
  },
  permissionsClient: [Permissions.EMBED_LINKS, Permissions.SEND_MESSAGES, Permissions.USE_EXTERNAL_EMOJIS, Permissions.READ_MESSAGE_HISTORY],
  run: async (context) => {
    return await editOrReply(context, 
      createEmbed("default", context, {
        description: `${icon("brand")} **${context.client.user.username} Privacy Policy**\n*Last Updated: ${timestamp(PRIVACY_POLICY_LAST_UPDATE, "f")}*\n${PRIVACY_POLICY_SECTIONS.join('\n')}\n\nIf you have any further questions, please contact us via our ${iconLinkPill("discord", DISCORD_INVITES.privacy, "Support Server", "Click to join")}\nPrevious privacy policy revision: ${link(`https://bignutty.gitlab.io/webstorage4/v2/documents/${PRIVACY_POLICY_PREVIOUS_REVISION}.txt`, 'June 2022')}`,
        color: COLORS.brand
      })
    )
  },
};