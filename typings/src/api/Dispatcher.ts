import { Collection } from "discord.js";
import { get247Set, getAutoplay } from "./db/settings.js";
import { times } from "lodash";
import { getDjChannel } from "./db/dj.js";
export default class AvonDispatcher {
  public client: any;
  public guild: any;
  public channel: any;
  public player: any;
  public repeat: string;
  public current: any;
  public stopped: boolean;
  public punit: boolean;
  public previous: any;
  public queue: any[];
  // public filters: object;
  public data: Collection<string, any>;
  constructor(client: any, guild: any, channel: any, player: any) {
    this.client = client;
    this.guild = guild;
    this.channel = channel;
    this.player = player;
    this.repeat = "off";
    this.queue = [];
    this.data = new Collection();
    this.current = null;
    this.previous = null;
    this.stopped = false;
    this.punit = false;

    this.player.on("start", async () => {
      if (this.repeat === "one") {
        if (this.punit) return;
        else this.punit = true;
      }
      if (this.repeat === "all" || this.repeat === "off") {
        this.punit = false;
      }
      if (this.client.utils.checkDjSetup(this.guild.id) === true) {
        let setup = this.client.utils.getDj(this.guild.id);
        let ch = await this.guild.channels.fetch(setup.CHANNEL);
        if (ch) {
          this.updateQueue(this.guild, this.queue);
          ch.messages.fetch(setup.MESSAGE).then((x: any) => {
            x.edit({
              embeds: [
                this.client.utils
                  .embed()
                  .setTitle(
                    `${this.client.emoji.setup.nowPlaying
                    } ${this.current.info.title.substring(0, 40)}`
                  )
                  .setURL(`${this.client.config.voteUrl}`)
                  .addFields([
                    {
                      name: `${this.client.emoji.setup.requester} Requester`,
                      value: `${this.current.info.requester.username}`,
                      inline: true,
                    },
                    {
                      name: `${this.client.emoji.setup.duration} Duration`,
                      value: `${this.client.utils.humanize(
                        this.current.info.length
                      )}`,
                      inline: true,
                    },
                    {
                      name: `${this.client.emoji.setup.author} Song Author`,
                      value: `[${this.current.info.author}](${this.client.config.voteUrl})`,
                      inline: true,
                    },
                  ])
                  .setImage(`${this.client.config.setupBgLink}`)
                  .setFooter({
                    text: `🔥 Thanks for choosing ${this.client.user.username}`,
                    iconURL: this.client.user.displayAvatarURL(),
                  })
                  .setAuthor({
                    name: `| Now Playing`,
                    iconURL: this.client.user.displayAvatarURL(),
                  }),
              ],
            });
          });
        }
      }
    });

    this.player.on("end", async () => {
      if (this.client.utils.checkDjSetup(this.guild.id) === true) {
        this.updateQueue(this.guild, this.queue);
        let set = this.client.utils.getDj(this.guild.id);
        let ch = await this.guild.channels.fetch(set.CHANNEL);
        ch.messages.fetch(set.MESSAGE).then((msg: any) =>
          msg.edit({
            embeds: [
              this.client.utils
                .embed()
                .setTitle(`Nothing Playing Right Now`)
                .setURL(`${this.client.config.voteUrl}`)
                .setImage(`${this.client.config.setupBgLink}`)
                .setAuthor({
                  name: `| Now Playing`,
                  iconURL: this.guild.iconURL({ dynamic: true }),
                })
                .setFooter({
                  text: `🔥 Thanks for choosing ${this.client.user.username}`,
                  iconURL: this.client.user.displayAvatarURL(),
                }),
            ],
          })
        );
      }
      try {
        this.data.get("Avon")?.delete();
      } catch (e) {
        /** */
      }
      this.data.delete("Avon");
      if (this.repeat === "one") {
        this.queue.unshift(this.current);
      }
      if (this.repeat === "all") {
        this.queue.push(this.current);
      }
      this.previous = this.current;
      this.current = null;
      if (getAutoplay(this.guild.id).SETTING === 1) return this.autoplay();
      else this.play();
    });

    this.player.on("closed", () => this.destroy());
  }

  get avon() {
    return this.client.api.has(this.guild.id);
  }

  public play() {
    if (!this.avon) return this.destroy();
    if (!this.queue.length) return;
    this.current = this.queue.shift();
    this.player.play(this.current, { noReplace: false });
  }

  public async destroy() {
    this.queue.length = 0;
    this.previous = null;
    this.current = null;
    this.data
      .get("Avon")
      ?.delete()
      .catch(() => { });
    if (this.client.utils.checkDjSetup(this.guild.id) === true) {
      this.updateQueue(this.guild, this.queue);
      let set = this.client.utils.getDj(this.guild.id);
      let ch = await this.guild.channels.fetch(set.CHANNEL);
      ch.messages.fetch(set.MESSAGE).then((msg: any) =>
        msg.edit({
          embeds: [
            this.client.utils
              .embed()
              .setTitle(`Nothing Playing Right Now`)
              .setURL(`${this.client.config.voteUrl}`)
              .setImage(`${this.client.config.setupBgLink}`)
              .setAuthor({
                name: `| Now Playing`,
                iconURL: this.guild.iconURL({ dynamic: true }),
              })
              .setFooter({
                text: `🔥 Thanks for choosing ${this.client.user.username}`,
                iconURL: this.client.user.displayAvatarURL(),
              }),
          ],
        })
      );
    }
    this.player.destroy();
    this.client.api.delete(this.guild.id);
    if (this.client.utils.get247(this.guild.id) === true) {
      let node = this.client.kazagumo.shoukaku.getNode();
      return this.client.api.reconnect(
        this.guild,
        this.guild.channels.cache.get(get247Set(this.guild.id).CHANNELID),
        this.guild.channels.cache.get(get247Set(this.guild.id).TEXTID),
        node
      );
    }
    if (this.stopped) return;
  }

  public async updateQueue(guild: any, queue: any[]) {
    let setup = this.client.utils.checkDjSetup(guild?.id);
    if (setup) {
      let set = this.client.utils.getDj(guild?.id);
      let ch = await this.guild.channels.fetch(set.CHANNEL);
      if (ch) {
        let q: any;
        if (queue.length === 0 || !queue.length)
          q = `Join a Voice Channel and type in your Search Query or a Url`;
        else if (queue.length < 11)
          q = queue
            .map(
              (x: any, i: number) =>
                `**${i + 1}.** ${x.info.title.substring(
                  0,
                  35
                )} .... *${this.client.utils.humanize(x.info.length)}*`
            )
            .sort()
            .join("\n");
        else
          q =
            queue
              .slice(0, 9)
              .map(
                (x: any, i: number) =>
                  `**${i + 1}.** ${x.info.title.substring(
                    0,
                    35
                  )} .... *${this.client.utils.humanize(x.info.length)}*`
              )
              .sort()
              .join("\n") +
            `\n**${this.queue.length - 10}** Songs are upcoming in the queue`;
        ch.messages.fetch(set.MESSAGE).then((x: any) => {
          x.edit({
            content: `__**Queue List**__\n\n${q}`,
          });
        });
      }
    } else return;
  }

  private async autoplay() {
    if (this.queue.length) return this.play();
    let identifier: string | undefined;
    if (this.previous === null) identifier = "_XBVWlI8TsQ";
    else
      identifier =
        this.previous.info.identifier || this.current.info.identifier;
    let url = `https://youtube.com/watch?v=${identifier}&list=RD${identifier}`;
    let result = await this.client.kazagumo.search(url, { requester: this.client.user });
    if (!result.tracks.length) return this.player.destroy();

    let tracks = result.tracks;
    if (this.previous) {
        tracks = result.tracks.filter((t: any) => t.info.identifier !== this.previous.info.identifier);
        if (tracks.length === 0) {
            tracks = result.tracks;
        }
    }

    try {
      let track =
        tracks[
        Math.floor(Math.random() * Math.floor(tracks.length))
        ];
      this.current = track;
      this.player.play(this.current, { noReplace: false });
    } catch (e) {
      this.player.destroy();
    }
  }
}