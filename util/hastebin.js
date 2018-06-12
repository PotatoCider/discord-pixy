const request = require("request-promise");

module.exports = (body, ext) => request.post({ url: "https://www.hastebin.com/documents", body })
.then(body => `https://www.hastebin.com/${ JSON.parse(body).key }${ ext ? "." + ext : "" }`);