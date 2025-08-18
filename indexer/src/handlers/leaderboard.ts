import { getBlockCommonData, isSailsEvent, isUserMessageSentEvent } from '../helpers';
import { Player } from '../model';
import { ProcessorContext } from '../processor';
import { SailsDecoder } from '../sails-decoder';
import { BlockCommonData, UserMessageSentEvent } from '../types';
import { BaseHandler } from './base';

class LeaderboardHandler extends BaseHandler {
  private _decoder: SailsDecoder;
  private _data: Map<string, Player>;

  public async init() {
    this._decoder = await SailsDecoder.new('assets/starship.idl');
  }

  public async clear() {
    this._data.clear();
  }

  public async save() {
    const values = this._data.values();

    this._ctx.store.save(Array.from(values));
  }

  private _handleUserMessageSentEvent(event: UserMessageSentEvent, ctx: ProcessorContext) {
    if (!isSailsEvent(event)) return;

    const { destination } = event.args.message;
    const { service, method, payload } = this._decoder.decodeEvent(event);

    if (service !== 'Starship' || method !== 'PointsAdded') return;

    const player = this._data.get(destination);
    const points = Number(payload);

    ctx.log.info(typeof points);
    ctx.log.info(`Player ${destination} has been awarded ${points} points.`);

    if (player) {
      player.score += points;
    } else {
      this._data.set(destination, { id: destination, score: points });
    }
  }

  public async process(ctx: ProcessorContext) {
    await super.process(ctx);

    for (const block of ctx.blocks) {
      for (const event of block.events) {
        if (!isUserMessageSentEvent(event)) return;

        this._handleUserMessageSentEvent(event, ctx);
      }
    }
  }
}

export { LeaderboardHandler };
