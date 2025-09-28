import { Player } from "shoukaku";
import AvonDispatcher from "./Dispatcher.js";

export default class AvonApi extends Map {
  client: any;
  constructor(client: any) {
    super();
    this.client = client;
  }
  public async handle(
    guild: any,
    member: any,
    channel: any,
    track: any
  ) {
    if (!guild || !member || !member.voice || !member.voice.channel || !channel || !track || !track.info) return null;
    const present = this.get(guild?.id);
    if (!present) {
      const player = await this.client.kazagumo.createPlayer({
        guildId: guild.id,
        voiceId: member.voice.channel.id,
        textId: channel.id,
        deaf: true,
      });
      const dispatcher = new AvonDispatcher(
        this.client,
        guild,
        channel,
        player.player
      );
      dispatcher.queue.push(track);
      dispatcher.updateQueue(guild, dispatcher.queue);
      this.set(guild.id, dispatcher);
      return dispatcher;
    }
    present.channel = channel;
    present.queue.push(track);
    present.updateQueue(guild, present.queue);
    if (!present.current) present.play();
    return null;
  }
  public async reconnect(guild: any, vc: any, txt: any, node: any) {
    const present = this.get(guild.id);
    if (present) return;
    const player = await this.client.kazagumo.createPlayer({
      guildId: guild.id,
      voiceId: vc.id,
      textId: txt.id,
      deaf: true,
    });
    const dispatcher = new AvonDispatcher(this.client, guild, txt, player.player);
    this.set(guild.id, dispatcher);
    return dispatcher;
  }
}
