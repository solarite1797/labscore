

module.exports = {
  name: 'test',
  metadata: {
    description: 'test',
    examples: ['test'],
    category: 'dev',
    usage: 'test'
  },
  run: async (context) => {
    return context.editOrReply('test successful.')
  },
};