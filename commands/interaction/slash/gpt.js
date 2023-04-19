module.exports = {
  description: 'Generate text via Large Language Models',
  name: 'gpt',
  options: [
    require('../subcommands/gpt/chatgpt'),
    require('../subcommands/gpt/davinci3'),
    require('../subcommands/gpt/claude'),
    require('../subcommands/gpt/claude-instant'),
    require('../subcommands/gpt/alpaca')
  ]
};