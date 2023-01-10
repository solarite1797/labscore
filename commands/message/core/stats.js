const { codeblock } = require('../../../labscore/utils/markdown')
const { createEmbed, formatPaginationEmbeds } = require('../../../labscore/utils/embed')

const { paginator } = require('../../../labscore/client');
const { editOrReply } = require('../../../labscore/utils/message');
const { getCommandStatistics } = require('../../../labscore/analytics');

module.exports = {
  name: 'stats',
  metadata: {
    description: 'Lists command usage statistics.',
    description_short: 'Shows command usage stats.',
    examples: ['stats'],
    category: 'core',
    usage: 'stats'
  },
  run: async (context) => {
    context.triggerTyping();
    try{
      let stats = await getCommandStatistics();

      let pages = [];
      let ranking = 1;
      
      for (var i = 0; i < Object.keys(stats).length; i += 20) {
        list = []
        if(pages.length == 0){list.push(`   | Total - ${Object.values(stats).reduce((a, b) => a + b, 0)}`)}
       
        Object.keys(stats).forEach(function(elem){
          dispnum = `${ranking}`
          if(`${ranking}`.length == 1){dispnum = ` ${ranking}`}
          list.push(`${dispnum} | ${elem} - ${stats[elem]}`)
          ranking++
        })

        pages.push({embeds:[
          createEmbed("default", context, {
            description: codeblock("autohotkey", list)
          })
        ]})
      }
      
      pages = formatPaginationEmbeds(pages)
      const paging = await paginator.createPaginator({
        context,
        pages
      });

      return;
    }catch(e){
      console.log(e)
      return editOrReply(context, {embeds: [createEmbed("error", context, "Unable to fetch command statistics.")]})
    }
  }
};