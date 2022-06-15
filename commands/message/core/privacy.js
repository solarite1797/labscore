const { icon, timestamp, link } = require('../../../labscore/utils/markdown')
const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message');
const { PRIVACY_POLICY_LAST_UPDATE, PRIVACY_POLICY_SECTIONS, DISCORD_INVITES, COLORS } = require('../../../labscore/constants');

module.exports = {
  description: 'ping!',
  name: 'privacy',
  metadata: {
    description: 'bot latency',
    examples: ['ping'],
    category: 'core',
    usage: 'ping'
  },
  run: async (context) => {
    context.triggerTyping();
    return await editOrReply(context, 
      createEmbed("default", context, {
        description: `${icon("rules")} **labsCore Privacy Policy**\n*Last Updated: ${timestamp(PRIVACY_POLICY_LAST_UPDATE, "f")}*\n\n${PRIVACY_POLICY_SECTIONS.join('\n\n')}\n\nIf you have any further questions, please contact us via our ${link(DISCORD_INVITES.privacy, "Support Server")}`,
        color: COLORS.brand
      })
    )
  },
};