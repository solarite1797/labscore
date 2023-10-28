const { createEmbed } = require('../../../labscore/utils/embed')
const { editOrReply } = require('../../../labscore/utils/message')

module.exports = {
  name: "update",
  label: "flags",
  metadata: {
    description: `Queries pb manager to trigger an update flow`,
    description_short: '[MANAGER] Query update',
    examples: ['update'],
    category: 'dev',
    usage: 'update'
  },
  onBefore: context => context.user.isClientOwner,
  onCancel: () => { },
  run: async (context) => {
    if (process.env.environment !== "prodnew") return await editOrReply(context, createEmbed("error", "Cannot update on this instance."))
    await editOrReply(context, createEmbed("loading", context, "Querying manager..."))

    try {
      const t = Date.now()

      // Call server to query update
      await superagent.post(`${process.env.PB_MANAGER_HOST}_pbs/UpdatePbService`)
        .set("Authorization", process.env.PB_MANAGER_KEY)

      return await editOrReply(context, createEmbed("success", "Update queried at manager"))
    } catch (e) {
      console.log(e)
      return await editOrReply(context, createEmbed("error", "Manager reported error during update query."))
    }
  }
};