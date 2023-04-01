const { Utils, Constants } = require("detritus-client");

const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

// TODO: remake this eventually, copy pasted it from v1 cause lazy

module.exports = {
  label: "code",
  name: "dev",
  metadata: {
    description: 'Evaluate code.',
    description_short: 'Bot eval',
    examples: ['dev console.log(\'ping\'); -async false'],
    category: 'dev',
    usage: 'eval <code> [-async <true|false>] [-noreply <true|false>] [-jsonspacing <integer>]'
  },
  args: [
    { default: false, name: "noreply", type: "bool", help: "Reply with evaluated output" },
    { default: 2, name: "jsonspacing", type: "number", help: "Spacing for formatted json" },
    { default: true, name: "async", type: "bool", help: "Async evaluation" }
  ],
  onBefore: context => context.user.isClientOwner,
  onCancel: ()=>{},
  run: async (context, args) => {
    await context.triggerTyping();
    const { matches } = Utils.regex(
      Constants.DiscordRegexNames.TEXT_CODEBLOCK,
      args.code
    );
    if (matches.length) {
      args.code = matches[0].text;
    }

    let language = "js";
    let message;
    try {
      if(args.async == false){
        message = await Promise.resolve(eval(args.code));
      } else {
        const func = new AsyncFunction('context', args.code);
        message = await func(context);
      }
      if (typeof message === "object") {
        message = JSON.stringify(message, null, args.jsonspacing);
        language = "json";
      }
    } catch (error) {
      message = error ? error.stack || error.message : error;
    }
    const max = 1990 - language.length;
    if (!args.noreply) {
      const reply =  ["```" + language, String(message).slice(0, max), "```"].join("\n")
      return context.editOrReply(
         reply
      );
    }
  },
  onError: (context, args, error) => {
    console.error(error);
  }
};