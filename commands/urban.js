const Command = require("../util/Command");

module.exports = class Urban extends Command {
	constructor(self) {
		super({
			name: "urban",
			desc: "Searches urban dictionary",
			detailedDesc: "Searches urban dictionary and provides a random definition if no term is given.",
			usage: "[term]",
			aliases: ["ud", "urbandictionary"],
			utils: { urban: "urban-dictionary", Pages: "Pages" },
			self
		});
	}

	async run(msg, term, reply) {
		const { entries } = await this.utils.urban.term(term),
			pages = new this.utils.Pages(msg.channel);
		for(let i = 0; i < entries.length; i++) {
			let { author, definition, example, permalink, thumbs_up, thumbs_down, word } = entries[i],
				replace = (_, def) => `[${ def }](https://www.urbandictionary.com/define.php?term=${ encodeURIComponent(def) })`;

			definition = definition.replace(/\[(.+?)\]/g, replace);
			example = example.replace(/\[(.+?)\]/g, replace);

			let split = this.helpers.splitLength(example, 1024, { prepend: "*", append: "*" }) || [ this.helpers.addContLink(permalink, example, 1024, { prepend: "*", append: "*" }) ];
			split[0] = { name: "Example", value: split[0] };

			const page = reply.getEmbed({
				author: msg.author,
				title: `**Definition of ${ word }**`,
				url: permalink,
				description: definition,
				fields: split.concat(
					{ name: "Author", value: `[${ author }](https://www.urbandictionary.com/author.php?author=${ encodeURIComponent(author) })`, inline: true },
					{ name: ":thumbsup:", value: thumbs_up, inline: true },
					{ name: ":thumbsdown:", value: thumbs_down, inline: true }
				)
			});
			pages.add(page);
		}
		pages.send();
	}
}	