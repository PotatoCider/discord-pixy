const request = require("request-promise");

module.exports = async (body, ext) => {
	const res = await request.post({ url: "https://www.hastebin.com/documents", body });

	return `https://www.hastebin.com/${ JSON.parse(res).key }${ ext ? "." + ext : "" }`;
};