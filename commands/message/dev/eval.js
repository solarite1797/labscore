const { Constants, Utils } = require("detritus-client");
const Permissions = Constants.Permissions;

const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

// TODO: remake this eventually, copy pasted it from v1 cause lazy

module.exports = {
  label: "code",
  name: "dev",
  metadata: {
    description: 'Evaluate code.',
    examples: ['dev console.log(\'ping\'); -async false'],
    category: 'dev',
    usage: 'eval <code> [-async <true|false>] [-noreply <true|false>] [-jsonspacing <integer>]'
  },
  args: [
    { default: false, name: "noreply", type: "bool" },
    { default: 2, name: "jsonspacing", type: "number" },
    { default: true, name: "async", type: "bool" }
  ],
  onBefore: context => context.user.isClientOwner,
  onCancel: context =>
    context.reply(
      `${context.user.mention}, you are lacking the permission \`BOT_OWNER\`.`
    ),
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