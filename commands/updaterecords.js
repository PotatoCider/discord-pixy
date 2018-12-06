const Command = require("../util/Command"),
	Discord = require("discord.js"),
	request = require("request");

module.exports = class UpdateRecords extends Command {
	constructor(self) {
		super({
			name: "updaterecords",
			desc: "Updates scrim records.",
			usage: "<Opponent Clan> [bo3/bo5/boN]",
			requiresGuild: true,
			messageSplit: true,
			aliases: ["records", "record"],
			self
		});
	}

	async run(msg, params, reply) {
		if(!params.length)reply.invalidUsage(this);
		const [ opponent, boN = 'bo3' ] = params,
			bestOf = boN.slice(2),
			recordChannel = msg.guild.channels.get(this.self.production && !params.includes("--test") ? "389954973473177600" : "411740248284856320"),
			filter = m => m.attachments.size > 0 || ["ff", "forfeit"].includes(m.content.toLowerCase());

		if(!opponent || !boN.startsWith("bo") || isNaN(bestOf))reply.invalidUsage(this);
		if(bestOf % 2 === 0)reply.throw(`There is no such thing as bo${ bestOf }.`);

		let wins = 0, losses = 0, toSend = [], forfeit = false;
		while(wins < bestOf / 2 && losses < bestOf / 2) {
			const m = await reply.collect(filter, 60).append(`Screenshot for Game ${ wins+losses+1 }: ("ff" if they forfeit)`).await(false),
				sent = reply.sent;
			reply = reply.next;
			if(m === null)reply.throw("Timed out.");
			if(["ff", "forfeit"].includes(m.content.toLowerCase())) {
				forfeit = true;
				break;
			}
			await m.react("🇼");
			await m.react("🇱");
			await m.react("❌");

			const winner = await m.createReactionCollector((reaction, user) => ["🇼","🇱","❌"].includes(reaction.emoji.name) && user.id === m.author.id, { max: 1 }).next.then(reaction => {
				switch(reaction.emoji.name) {
					case "🇼":
						return "Xeno";
						break;
					case "🇱":
						return opponent;
						break;
					case "❌":
						return null;
						break;
				}
			});

			if(!winner) {
				m.delete();
				sent.delete();
				continue;
			}
			if(winner === "Xeno") {
				wins++;
			} else {
				losses++;
			}

			toSend.push({
				content: `Xeno Vs ${ opponent } game ${ wins+losses } : ${ winner } Wins`,
				opts: this.helpers.getEmbed({ image: m.attachments.first().url })
			});
		}
		const name = recordChannel.name.split("_")
		let [ totalWins, totalLosses ] = name.pop().split("-"),
			won = forfeit || wins > losses,
			score = "Draw";
		if(won) {
			score = ++totalWins
		} else if(losses > wins) {
			score = ++totalLosses;
		}
		const update = recordChannel.setName(name.join("_") + `_${ totalWins }-${ totalLosses }`, "update scrim records");

		if(!toSend.length)return reply.append("No record posted.");
		let last;
		for(let i = 0; i < toSend.length; i++) {
			last = await recordChannel.send(toSend[i].content, toSend[i].opts);
		}
		last.edit(last.content + ` -${ score }${ forfeit ? ` (${ opponent } Forfeit)` : "" }`);
		await update;
		reply.append(`Records updated to ${ recordChannel.name }`);
	}
}	