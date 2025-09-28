import axios from "axios";
import AvonDispatcher from "../../api/Dispatcher.js";
import AvonCommand from "../../base/AvonCommand.js";

export default class AvonPlay extends AvonCommand {
  constructor(client: any) {
    super(client);
    this.name = "play";
    this.aliases = ["p"];
    this.cat = "music";
    this.desc = "Plays the music by adding some songs to the queue";
    this.usage = "play <query/url>";
    this.dev = false;
    this.manage = false;
    this.premium = {
      guild: false,
      user: false,
    };
    this.vc = true;
    this.samevc = true;
    this.exec = async (message: any, args: any, prefix: any) => {
      if (!args[0])
        return message.reply({
          embeds: [
            this.client.utils
              .premiumEmbed(message.guildId)
              .setDescription(`\`${prefix}play <search query or url>\``)
              .setTitle(`Play Syntax`),
          ],
        });

      let query = args.join(" ");

      let type = this.client.utils.getPlay(message.guild.id);
      if (type === "direct") {
        let result = await this.client.kazagumo.search(query, { requester: message.author });
        if (!result.tracks.length)
          return message.reply({
            embeds: [
              this.client.utils
                .premiumEmbed(message.guildId)
                .setDescription(
                  `${this.client.emoji.cross} [No Results](${this.client.config.voteUrl}) found for the query`
                )
                .setTitle(`No Results`),
            ],
          });
        if (result.loadType === `PLAYLIST_LOADED`) {
          let dispatcher = this.client.api.get(message.guild.id);
          if (!dispatcher) {
            const player = await this.client.kazagumo.createPlayer({
              guildId: message.guildId,
              voiceId: message.member.voice.channel.id,
              textId: message.channel.id,
              deaf: true,
            });
            dispatcher = new AvonDispatcher(
              this.client,
              message.guild,
              message.channel,
              player.player
            );
            this.client.api.set(message.guildId, dispatcher);
          }
          let tracks = [];
          for (let i = 0; i < result.tracks.length; i++) {
            if (result.tracks[i].info) result.tracks[i].info.requester = message.author;
            let tr = this.client.utils.track(result.tracks[i]);
            tracks.push(tr);
          }
          tracks.forEach((x: any) => dispatcher.queue.push(x));
          return message.reply({
            embeds: [
              this.client.utils
                .premiumEmbed(message.guildId)
                .setDescription(
                  `${this.client.emoji.queue} Added **[${result.tracks.length}](${this.client.config.voteUrl})** from [${result.playlistName}](${this.client.config.voteUrl})`
                ),
            ],
          });
        } else {
          let track = result.tracks[0];
          if (track.info) track.info.requester = message.author;
          track = this.client.utils.track(track);
          const dispatcher = await this.client.api.handle(
            message.guild,
            message.member,
            message.channel,
            track
          );
          dispatcher?.play();
          return message.reply({
            embeds: [
              this.client.utils
                .premiumEmbed(message.guildId)
                .setDescription(
                  `${this.client.emoji.queue} Added [${track.info.title.substring(0, 35)}](${this.client.config.voteUrl}) to Queue`
                ),
            ],
          });
        }
      } else {
        let b1 = this.client.utils.button(
          `custom_id`,
          null,
          2,
          `avon_default_search`,
          null,
          this.client.emoji.defSearch
        );
        let b2 = this.client.utils.button(
          `custom_id`,
          null,
          3,
          `avon_spoti_search`,
          null,
          this.client.emoji.spotiSearch
        );
        let b3 = this.client.utils.button(
          `custom_id`,
          null,
          4,
          `avon_deez_search`,
          null,
          this.client.emoji.deezSearch
        );
        let b4 = this.client.utils.button(
          `custom_id`,
          null,
          1,
          `avon_sound_search`,
          null,
          this.client.emoji.soundSearch
        );

        let buttons = [b1, b2, b3, b4];

        let row = this.client.utils.actionRow(buttons);

        let em = this.client.utils
          .premiumEmbed(message.guildId)
          .setDescription(
            `Choose One of the buttons below to prefer your search type`
          )
          .setTitle(`Search Engines`);

        let msg = await message.channel.send({
          embeds: [em],
          components: [row],
        });

        let collector = await msg.createMessageComponentCollector({
          filter: (b: any) => {
            if (b.user.id === message.author.id) return true;
            else
              return b.reply({
                content: `${this.client.emoji.cross} You are not the command requester`,
                ephemeral: true,
              });
          },
          time: 100000 * 7,
        });

        collector.on("collect", async (interaction: any) => {
          if (interaction.customId === `avon_default_search`) {
            let result = await this.client.kazagumo.search(query, { requester: message.author, engine: 'youtube' });
            if (!result || !result.tracks || !result.tracks.length)
              return interaction.update({
                embeds: [
                  this.client.utils
                    .premiumEmbed(message.guildId)
                    .setDescription(
                      `${this.client.emoji.cross} [No Results](${this.client.config.voteUrl}) found for the given query`
                    ),
                ],
                components: [],
              });
            else {
              let track = result.tracks[0];
              if (!track) {
                return interaction.update({
                  embeds: [
                    this.client.utils
                      .premiumEmbed(message.guildId)
                      .setDescription(`${this.client.emoji.cross} No track found for the query.`),
                  ],
                  components: [],
                });
              }
              if (track.info) track.info.requester = message.author;
              track = this.client.utils.track(track);
              const dispatcher = await this.client.api.handle(
                message.guild,
                message.member,
                message.channel,
                track
              );
              dispatcher?.play();
              return interaction.update({
                embeds: [
                  this.client.utils
                    .premiumEmbed(message.guildId)
                    .setDescription(
                      `${this.client.emoji.queue} Added [${track.info?.title?.substring(0, 35) || 'Unknown Track'}](${this.client.config.voteUrl}) to Queue`
                    ),
                ],
                components: [],
              });
            }
          } else if (interaction.customId === `avon_spoti_search`) {
            let result = await this.client.kazagumo.search(query, {
              requester: message.author,
              engine: `spotify`,
            });
            if (!result?.tracks?.length)
              return interaction.update({
                embeds: [
                  this.client.utils
                    .premiumEmbed(message.guild.id)
                    .setDescription(
                      `${this.client.emoji.cross} [No Result](${this.client.config.voteUrl}) found for the query`
                    ),
                ],
                components: [],
              });

            let track = result.tracks[0];
            if (track.info) track.info.requester = message.author;
            track = this.client.utils.track(track);
            const dispatcher = await this.client.api.handle(
              message.guild,
              message.member,
              message.channel,
              track
            );
            dispatcher?.play();
            return interaction.update({
              embeds: [
                this.client.utils
                  .premiumEmbed(message.guild.id)
                  .setDescription(
                    `${this.client.emoji.queue} Added [${track.info.title.substring(0, 35)}](${this.client.config.voteUrl}) to Queue`
                  ),
              ],
              components: [],
            });
          } else if (interaction.customId === `avon_deez_search`) {
            let result = await this.client.kazagumo.search(query, {
              engine: `deezer`,
              requester: message.author,
            });
            if (!result || !result.tracks || !result.tracks.length)
              return interaction.update({
                embeds: [
                  this.client.utils
                    .premiumEmbed(message.guildId)
                    .setDescription(
                      `${this.client.emoji.cross} [No Result](${this.client.config.voteUrl}) found for the query`
                    ),
                ],
                components: [],
              });

            let track = result.tracks[0];
            if (track.info) track.info.requester = message.author;
            track = this.client.utils.track(track);
            const dispatcher = await this.client.api.handle(
              message.guild,
              message.member,
              message.channel,
              track
            );
            dispatcher?.play();
            return interaction.update({
              embeds: [
                this.client.utils
                  .premiumEmbed(message.guildId)
                  .setDescription(
                    `${this.client.emoji.queue} Added [${track.info.title.substring(0, 35)}](${this.client.config.voteUrl}) to Queue`
                  ),
              ],
              components: [],
            });
          } else if (interaction.customId === `avon_sound_search`) {
            let res = await this.client.kazagumo.search(query, { requester: message.author, engine: 'soundcloud' });
            if (!res || !res.tracks || !res.tracks.length)
              return interaction.update({
                embeds: [
                  this.client.utils
                    .premiumEmbed(message.guildId)
                    .setDescription(
                      `${this.client.emoji.cross} [No Results](${this.client.config.voteUrl}) found for the query`
                    ),
                ],
                components: [],
              });

            let track = res.tracks[0];
            if (track.info) track.info.requester = message.author;
            let tr = this.client.utils.track(track);
            const dispatcher = await this.client.api.handle(
              message.guild,
              message.member,
              message.channel,
              tr
            );
            dispatcher?.play();
            return interaction.update({
              embeds: [
                this.client.utils
                  .premiumEmbed(message.guildId)
                  .setDescription(
                    `${this.client.emoji.queue} Added [${track.info.title.substring(0, 35)}](${this.client.config.voteUrl}) to Queue`
                  ),
              ],
              components: [],
            });
          }
        });
      }
    };
  }
}
