const {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	Client,
} = require("discord.js");
const { Users } = require("../../database");
const { emojiConfig } = require("../../util/config");
const { emojiFormatter } = require("../../util/emojiFormatter");
const { addFields } = require("../../util/embed");
const { color } = require("../../util/color");

module.exports = {
	cooldown: 300,
	data: new SlashCommandBuilder()
		.setName("rob")
		.setDescription("Try to rob another user")
		.addUserOption((option) =>
			option
				.setName("target")
				.setDescription("The user to rob")
				.setRequired(true),
		),
	/**
	 * @param {ChatInputCommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		await interaction.deferReply();

		const targetUser = interaction.options.getUser("target");

		if (interaction.user.id === targetUser.id) {
			return await interaction.editReply({
				content: "You can't rob yourself",
			});
		}

		let user = await Users.findOne({ where: { user_id: interaction.user.id } });
		let target = await Users.findOne({ where: { user_id: targetUser.id } });

		if (!user) {
			user = await Users.create({ user_id: interaction.user.id });
		}

		if (!target) {
			return await interaction.editReply({
				content: "That user has no coins",
			});
		}

		if (target.vault < 100) {
			return await interaction.editReply({
				content: `${targetUser.toString()} doesn't have enough coins`,
			});
		}

		const stealAmount = Math.floor(Math.random() * 200) + 50;
		if (stealAmount > target.vault) {
			stealAmount = target.vault;
		}

		targetVault -= stealAmount;
		user.vault += stealAmount;

		const { name, id } = emojiConfig.ccamp_gold;
		const emoji = emojiFormatter(name, id, true);

		const embed = addFields({
			color: color.DarkButNotBlack,
			description: `You stole ${emoji} **${stealAmount}** from ${targetUser.toString()}`,
		});

		await interaction.editReply({
			embeds: [embed],
		});
	},
};
