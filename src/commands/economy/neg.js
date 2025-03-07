const {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	Client,
} = require("discord.js");
const { Users } = require("../../database");
const { guildConfig } = require("../../util/config");
const { emojiFormatter } = require("../../util/emojiFormatter");

module.exports = {
	cooldown: 3_600,
	data: new SlashCommandBuilder()
		.setName("neg")
		.setDescription("Decrease a user's fame")
		.addUserOption((option) =>
			option
				.setName("target")
				.setDescription("The user whose fame you want to decrease")
				.setRequired(true),
		)
		.addIntegerOption((option) =>
			option
				.setName("amount")
				.setDescription("The amount of fame to decrease")
				.setRequired(true)
				.setMinValue(1),
		),
	/**
	 * @param {ChatInputCommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		await interaction.deferReply();

		const targetUser = interaction.options.getUser("target");
		const amount = interaction.options.getInteger("amount");

		if (interaction.user.id === targetUser.id) {
			return await interaction.editReply({
				content: "You can't do that to yourself",
			});
		}

		let target = await Users.findOne({ where: { user_id: targetUser.id } });

		if (!target) {
			return await interaction.editReply({
				content: `${targetUser.toString()} is not in the system yet.`,
			});
		}

		target.fame = Math.max(0, target.fame, -amount);
		await target.save();

		const emojiId = guildConfig.emoji.chillCampDecrease;
		const emoji = emojiFormatter("ccamp_decrease", emojiId, true);

		await interaction.editReply({
			content: `${emoji} ${targetUser.toString()}'s Fame has decreased by **${amount}**`,
		});
	},
};
