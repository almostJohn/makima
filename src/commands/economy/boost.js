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
		.setName("boost")
		.setDescription("Boost another user's fame")
		.addUserOption((option) =>
			option
				.setName("target")
				.setDescription("The user to boost")
				.setRequired(true),
		),
	/**
	 * @param {ChatInputCommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		await interaction.deferReply();

		const targetUser = interaction.options.getUser("target");

		let target = await Users.findOne({ where: { user_id: targetUser.id } });

		if (!target) {
			target = await Users.create({ user_id: targetUser.id });
		}

		const boostAmount = Math.floor(Math.random() * 100) + 1;

		target.fame += boostAmount;
		await target.save();

		const emojiId = guildConfig.emoji.chillCampIncrease;
		const emoji = emojiFormatter("ccamp_increase", emojiId, true);

		await interaction.editReply({
			content: `${emoji} ${targetUser.toString()} received a 🌟 **${boostAmount}** fame boost`,
		});
	},
};
