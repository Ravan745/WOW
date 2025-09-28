import { getPrefix } from "../api/db/prefix.js";
import AvonEvent from "../base/AvonEvent.js";
import Avon from "../structures/Client.js";
import { Message, TextChannel } from "discord.js";
import { KazagumoPlayer, KazagumoTrack, KazagumoSearchResult } from "kazagumo";
import AvonCommand from "../base/AvonCommand.js";

export default class AvonSetup extends AvonEvent {
  public run: (message: Message) => Promise<any>;

  constructor(client: Avon) {
    super(client);
    this.name = "messageCreate";
    this.run = this.handleSetupMessage.bind(this);
  }

  private async handleSetupMessage(message: Message) {
    if (!message.guild || !message.member) return;

    const setup = this.client.utils.getDj(message.guildId);
    if (!setup || setup.CHANNEL !== message.channel.id) return;

    if (await this.isBotOrUserMessage(message)) return;

    if (await this.checkVoiceChannel(message)) return;

    if (await this.isCommand(message)) {
      return this.sendAndDelete(
        message,
        `${this.client.emoji.cross} | Don't use any of my commands here ${this.client.emoji.exclamation}`,
        7000
      );
    }

    await this.handleSongRequest(message);
  }

  private async isBotOrUserMessage(message: Message): Promise<boolean> {
    if (message.author.bot && message.author.id !== this.client.user.id) {
      await message.delete().catch((e) => this.client.logger.error(e));
      return true;
    }
    if (message.author.id === this.client.user.id) return true;
    return false;
  }

  private async checkVoiceChannel(message: Message): Promise<boolean> {
    if (!message.member!.voice.channel) {
      await message.delete().catch((e) => this.client.logger.error(e));
      this.sendAndDelete(
        message,
        `${message.author} ${this.client.emoji.cross} | You must be connected to a voice channel`,
        5000
      );
      return true;
    }

    if (
      message.guild!.members.me?.voice.channel &&
      message.guild!.members.me.voice.channel.id !== message.member!.voice.channel.id
    ) {
      await message.delete().catch((e) => this.client.logger.error(e));
      this.sendAndDelete(
        message,
        `${message.author} ${this.client.emoji.cross} | You must be connected to the same voice channel ${message.guild!.members.me.voice.channel}`,
        5000
      );
      return true;
    }

    return false;
  }

  private async isCommand(message: Message): Promise<boolean> {
    const prefixObj = getPrefix(message.guildId!);
    const prefix = prefixObj.PREFIX ? prefixObj.PREFIX : this.client.config.prefix;

    const regex = new RegExp(`^<@!?${this.client.user.id}>`);
    const pre = message.content.match(regex) ? message.content.match(regex)![0] : prefix;

    const commandName = message.content.trim().split(/ +/).shift()!.toLowerCase();
    const command = this.client.commands.messages.get(commandName) ||
                    this.client.commands.messages.find((c: AvonCommand) => c.aliases && c.aliases.includes(commandName));

    if (command) return true;

    if (message.content.startsWith(pre)) {
      const cmdName = message.content.slice(pre.length).trim().split(/ +/).shift()!.toLowerCase();
      const cmd = this.client.commands.messages.get(cmdName);
      if (cmd) return true;
    }

    return false;
  }

  private async handleSongRequest(message: Message) {
    try {
      const engine = message.content.match(this.client.spotify.spotifyPattern) ? 'spotify' : 'youtube';
      const res = await this.client.kazagumo.search(message.content, { requester: message.author, engine });

      if (!res || !res.tracks.length) {
        return this.sendAndDelete(message, `${this.client.emoji.cross} **No Results** found for the given query!`, 5000);
      }

      await this.handleSearchResult(res, message);
    } catch (error) {
      this.client.logger.error(error);
      this.sendAndDelete(message, `${this.client.emoji.cross} **An error occurred** while searching for the song.`, 5000);
    }
  }

  private async handleSearchResult(res: KazagumoSearchResult, message: Message) {
    if (res.type === 'PLAYLIST') {
      await this.handlePlaylist(res, message);
    } else {
      await this.handleTrack(res.tracks[0], message);
    }
    await message.delete().catch((e) => this.client.logger.error(e));
  }

  private async handlePlaylist(res: KazagumoSearchResult, message: Message) {
    let dispatcher = this.client.api.get(message.guildId!);
    if (!dispatcher) {
      dispatcher = await this.createPlayer(message);
    }

    for (const track of res.tracks) {
      dispatcher.queue.add(track);
    }

    if (!dispatcher.playing && !dispatcher.paused) dispatcher.play();
    dispatcher.channel = message.channel;
  }

  private async handleTrack(track: KazagumoTrack, message: Message) {
    const dispatcher = await this.client.api.handle(
      message.guild!,
      message.member!,
      message.channel,
      track
    );
    this.client.api.set(message.guildId!, dispatcher);
    dispatcher?.play();
  }

  private async createPlayer(message: Message): Promise<KazagumoPlayer> {
    const dispatcher = await this.client.kazagumo.createPlayer({
      guildId: message.guildId!,
      voiceId: message.member!.voice.channel!.id,
      textId: message.channel.id,
      deaf: true,
    });
    this.client.api.set(message.guildId!, dispatcher);
    return dispatcher;
  }

  private sendAndDelete(message: Message, content: string, timeout: number) {
    if (!(message.channel instanceof TextChannel)) return;
    message.channel.send({ content }).then((x: Message) => {
      setTimeout(() => {
        x.delete().catch((e) => this.client.logger.error(e));
      }, timeout);
    });
  }
}
