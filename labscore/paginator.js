const Paginator = require('detritus-pagination').PaginatorCluster

const paginators = {}

function createPaginator(client){
  return new Paginator(client, {
      // Maximum number of milliseconds for the bot to paginate
      // It is recommended not to set this too high
      // Defaults to 300000ms (5 minutes)
      maxTime: 300000,
      // Whether it should jump back to page 1 if the user tried to go past the last page
      // Defaults to false
      pageLoop: true,
      // Whether a page number should be shown in embed footers
      // If a string is passed as page, it will append the page number to the string
      pageNumber: true
  });
}

module.exports = {
  createPaginator
}