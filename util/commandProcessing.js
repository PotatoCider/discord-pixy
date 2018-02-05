exports.getCommand = (content, prefix) => content.startsWith(prefix) ? content.slice(prefix.length, ~(~content.indexOf(" ", prefix.length) || ~content.length)) : "";

exports.processMsg = (content, cmd, prefix) => content.slice(prefix.length + cmd.length).trim().split(/ +/g).join(" ");