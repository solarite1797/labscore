

const attachmentTypes = Object.freeze({
  image: ["image/png", "image/jpeg", "image/gif"]
})

async function getRecentMedia(context, limit){
  if (!context.message.channel) {
    return undefined;
  } else if (context.message.attachments.length > 0) {
    return context.message.attachments.first();
  }
  const messages = await context.message.channel.fetchMessages({
    limit
  });

  if (!messages) {
    return undefined;
  }

  let attachments = [];
  for(const m of messages){
    let message = m[1]
    if ( // First the attachment on the message
      message.attachments.first()
    ) { attachments.push(message.attachments.first())
    } else if ( // Then the embed image
      message.embeds.length > 0 &&
      message.embeds.toArray()[0].image
    ) { attachments.push(message.embeds.toArray()[0].image) 
    } else if (
      message.embeds.length > 0 &&
      message.embeds.toArray()[0].thumbnail
    ) { attachments.push(message.embeds.toArray()[0].thumbnail) }
  }
  return attachments;
}

// simple helpers

async function getRecentImage(context, limit){
  let attachments = await getRecentMedia(context, limit)
  let at;
  let validImages = attachmentTypes.image
  for(const a of attachments){
    if(a.contentType && validImages.includes(a.contentType) && at === undefined){ // discord attachment
      at = a.url
    } else if (!a.content_type && at === undefined){ // other form of media
      at = a.url
    }
  }
  return at;
}

module.exports = {
  getRecentImage
}