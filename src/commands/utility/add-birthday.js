import {
	SlashCommandBuilder,
	MessageFlags,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	ComponentType,
} from "discord.js";
import { Users } from "../../database.js";
import { nanoid } from "nanoid";

export default {
	data: new SlashCommandBuilder()
		.setName("add_birthday")
		.setDescription("Add your birthday")
		.addStringOption((option) =>
			option
				.setName("date")
				.setDescription("Your birthday (YYYY-MM-DD)")
				.setRequired(true),
		),
	/**
	 * @param {import("discord.js").ChatInputCommandInteraction} interaction
	 * @param {import("discord.js").Client} client
	 */
	async execute(interaction, _client) {
		const reply = await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});

		const birthday = interaction.options.getString("date");

		const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(birthday);
		if (!isValidDate) {
			return await interaction.editReply({
				content: "Invalid date format. Please use `YYYY-MM-DD`",
			});
		}

		const addKey = nanoid();
		const cancelKey = nanoid();

		const addButton = new ButtonBuilder()
			.setCustomId(addKey)
			.setLabel("Add Birthday")
			.setStyle(ButtonStyle.Primary);
		const cancelButton = new ButtonBuilder()
			.setCustomId(cancelKey)
			.setLabel("Cancel")
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder().addComponents(cancelButton, addButton);

		await interaction.editReply({
			content: `Do you want to finalize your birthday as \`${birthday}\`?`,
			components: [row],
		});

		const collectedInteraction = await reply
			.awaitMessageComponent({
				filter: (collected) => collected.user.id === interaction.user.id,
				componentType: ComponentType.Button,
				time: 15_000,
			})
			.catch(async () => {
				try {
					await interaction.editReply({
						content: "Action timer ran out",
						components: [],
					});

					return undefined;
					// eslint-disable-next-line no-empty
				} catch {}
			});

		if (collectedInteraction.customId === cancelKey) {
			await collectedInteraction.update({
				content: "Canceled operation",
				components: [],
			});
		} else if (collectedInteraction.customId === addKey) {
			await collectedInteraction.deferUpdate();

			try {
				const [user, created] = await Users.findOrCreate({
					where: { user_id: collectedInteraction.user.id },
					defaults: { birthday },
				});

				if (!created) {
					await user.update({ birthday });
					return await collectedInteraction.editReply({
						content: `Your birthday has been updated to \`${birthday}\``,
						components: [],
					});
				}

				await collectedInteraction.editReply({
					content: `Your birthday has been set on \`${birthday}\``,
					components: [],
				});
			} catch (error) {
				console.error(error);
				return await collectedInteraction.editReply({
					content:
						"There was a problem saving your birthday to the database. Please try again",
					components: [],
				});
			}
		}
	},
};
