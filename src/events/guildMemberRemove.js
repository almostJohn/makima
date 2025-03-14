import { GuildMember, Events, Client, Webhook } from "discord.js";
import { guildConfig } from "../util/config.js";
import { color } from "../util/color.js";
import { addFields } from "../util/embed.js";

export default {
	name: Events.GuildMemberRemove,
	/**
	 * @param {GuildMember} guildMember
	 * @param {Client} client
	 */
	async execute(guildMember, client) {
		try {
			const mainChannelWebookId = guildConfig.mainChannelWebhookId;

			if (!mainChannelWebookId) {
				return;
			}

			/** @type {Webhook} */
			const webhook = client.webhooks.get(mainChannelWebookId);

			if (!webhook) {
				return;
			}

			const embed = addFields({
				color: color.DarkButNotBlack,
				description: `${guildMember.user.toString()} - \`${
					guildMember.user.tag
				}\` has left the server.`,
			});

			console.log(`Member left ${guildMember.user.id}`);

			await webhook.send({
				embeds: [embed],
				username: client.user.username,
				avatarURL: client.user.displayAvatarURL(),
			});
		} catch (error) {
			console.error(error);
		}
	},
};
