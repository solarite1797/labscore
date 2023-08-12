const { icon, timestamp, link } = require('../../../labscore/utils/markdown')
const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message');
const { PRIVACY_POLICY_LAST_UPDATE, PRIVACY_POLICY_SECTIONS, DISCORD_INVITES, COLORS } = require('../../../labscore/constants');

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
        description: `${icon("agreements")} **labsCore Privacy Policy**\n*Last Updated: ${timestamp(PRIVACY_POLICY_LAST_UPDATE, "f")}*\n\n${PRIVACY_POLICY_SECTIONS.join('\n\n')}\n\nIf you have any further questions, please contact us via our ${link(DISCORD_INVITES.privacy, "Support Server")}`,
        color: COLORS.brand
      })
    )
  },
};