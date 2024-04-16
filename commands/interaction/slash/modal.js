const { Constants } = require('detritus-client');
const { InteractionCallbackTypes } = Constants;

const { createEmbed } = require('../../../labscore/utils/embed');
const { iconPill, codeblock } = require('../../../labscore/utils/markdown');
const { MessageFlags } = require('detritus-client/lib/constants');
const { InteractionModal } = require('detritus-client/lib/utils');

module.exports = {
  description: 'modal command',
  name: 'modal',
  guildIds: ["1116074561734197270","409840884713127956"],
  run: async (context, args) => {
    

    const modal = new InteractionModal({
      timeout: 5 * 60 * 1000, // 5 mins, (default is 10 minutes)
      title: 'My Cool Questionaire!',
      run: (modalContext, args) => {
        // args will use the defined customId in the text inputs (args.birds, args.cats)
        return modalContext.createMessage(`${args.birds}, ${args.cats}`);
      },
      onTimeout: () => {
        return context.createMessage('Answer my questions faster next time please');
      },
    });

    modal.createInputText({
      customId: 'birds',
      label: 'Do you like birds?',
      maxLength: 120,
      minLength: 2,
      required: true,
    });

    modal.createInputText({
      customId: 'cats',
      label: 'Do you like cats?',
      maxLength: 120,
      minLength: 2,
      required: true,
    });

    return context.respond(modal);
  },
};