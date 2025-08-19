import { isSailsEvent, isUserMessageSentEvent } from '../helpers';
import { Player } from '../model';
import { ProcessorContext } from '../processor';
import { SailsDecoder } from '../sails-decoder';
import { UserMessageSentEvent } from '../types';
import { BaseHandler } from './base';

class LeaderboardHandler extends BaseHandler {
  private _decoder: SailsDecoder;
  private _data: Map<string, Player>;

  public async init() {
    this._decoder = await SailsDecoder.new('assets/starship.idl');
    this._data = new Map();
  }

  public async clear() {
    this._data.clear();
  }

  public async save() {
    const values = this._data.values();

    await this._ctx.store.save(Array.from(values));
  }

  private _handleUserMessageSentEvent(event: UserMessageSentEvent) {
    if (!isSailsEvent(event)) return;

    const { service, method, payload } = this._decoder.decodeEvent(event);

    if (service !== 'Starship' || method !== 'PointsAdded') return;

    if (typeof payload !== 'object' || payload === null || !('player' in payload) || !('points' in payload))
      throw new Error('Invalid payload structure');

    const playerAddress = String(payload.player);
    const points = Number(payload.points);
    const player = this._data.get(playerAddress);

    if (player) {
      player.score += points;
    } else {
      this._data.set(playerAddress, new Player({ id: playerAddress, score: points }));
    }
  }

  public async process(ctx: ProcessorContext) {
    await super.process(ctx);

    // @ts-ignore
    const storedPlayers = await ctx.store.find(Player);
    this._data = new Map(storedPlayers.map((player) => [player.id, player]));

    for (const block of ctx.blocks) {
      for (const event of block.events) {
        if (!isUserMessageSentEvent(event)) continue;

        this._handleUserMessageSentEvent(event);
      }
    }
  }
}

export { LeaderboardHandler };
