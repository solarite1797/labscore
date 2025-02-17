const { reverseImageSearch } = require('#api');
const { paginator } = require('#client');

const { getMessageAttachment, validateAttachment } = require('#utils/attachment');
const { createEmbed, formatPaginationEmbeds, page } = require('#utils/embed');
const { acknowledge } = require('#utils/interactions');
const { editOrReply } = require('#utils/message')
const { STATICS } = require('#utils/statics')

const { ApplicationCommandTypes } = require("detritus-client/lib/constants");

// TODO: create a favicon() util
function createReverseImageSearchResultPage(context, result, source) {
  let res = page(
    createEmbed("default", context, {
      author: {
        iconUrl: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(result.url)}&sz=256`,
        name: result.name,
        url: result.url
      },
      image: {
        url: result.image
      },
      thumbnail: {
        url: source
      },
      footer: {
        iconUrl: STATICS.google,
        text: `Google Cloud Vision • ${context.application.name}`
      }
    }))
  if (result.thumbnail) res.embeds[0].thumbnail = { url: result.thumbnail };
  return res;
}

module.exports = {
  name: 'Reverse Image Search',
  type: ApplicationCommandTypes.MESSAGE,
  contexts: [
    0,
    1,
    2
  ],
  integrationTypes: [
    1
  ],
  run: async (context, args) => {
    try{
      await acknowledge(context);

      const { message } = args;

      let attachment = getMessageAttachment(message)
      if(attachment && validateAttachment(attachment, "image")){
        attachment = attachment.url
      } else {
        delete attachment;
      }
      if(!attachment) return context.editOrRespond({ embeds: [createEmbed("warning", context, "No images found.")] })


      let search = await reverseImageSearch(context, attachment)
      search = search.response

      if (search.body.status == 2) return editOrReply(context, createEmbed("error", context, search.body.message))

      let pages = []
      for (const res of search.body.results) {
        pages.push(createReverseImageSearchResultPage(context, res, attachment))
      }

      await paginator.createPaginator({
        context,
        pages: formatPaginationEmbeds(pages)
      });
    } catch (e) {
      console.log(e)
      return editOrReply(context, createEmbed("error", context, `Unable to perform reverse image search.`))
    }
  },
};