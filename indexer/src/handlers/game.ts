import { getBlockCommonData, isSailsEvent, isUserMessageSentEvent } from '../helpers';
import { Game } from '../model';
import { ProcessorContext } from '../processor';
import { SailsDecoder } from '../sails-decoder';
import { BaseHandler } from './base';

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

export class GameHandler extends BaseHandler {
  private _decoder: SailsDecoder;
  private _games: Game[];

  public async init() {
    this._decoder = await SailsDecoder.new('assets/starship.idl');
    this._games = [];
  }

  public clear() {
    this._games = [];
  }

  public async save() {
    await this._ctx.store.save(this._games);
  }

  private _isValidPayload(payload: unknown): payload is Record<string, unknown> {
    if (!isObject(payload) || !('player' in payload) || !('points' in payload)) {
      this._ctx.log.error('Invalid payload structure for PointsAdded event');

      return false;
    }

    return true;
  }

  public async process(ctx: ProcessorContext) {
    await super.process(ctx);

    for (const block of ctx.blocks) {
      for (const event of block.events) {
        if (!isUserMessageSentEvent(event) || !isSailsEvent(event)) continue;

        const decodedEvent = this._decoder.decodeEvent(event);
        const { service, method, payload } = decodedEvent;

        if (service !== 'Starship' || method !== 'PointsAdded' || !this._isValidPayload(payload)) continue;

        const id = String(event.args.message.id);
        const { blockTimestamp: timestamp } = getBlockCommonData(block);
        const playerAddress = String(payload.player);
        const points = Number(payload.points);
        const boostersCount = Number(payload.num_spent_boosters);

        const game = new Game({ id, timestamp, playerAddress, points, boostersCount });

        this._ctx.log.info(
          `Game recorded for ${playerAddress}: ${points} points at ${timestamp.getTime()} with ${boostersCount} boosters`
        );

        this._games.push(game);
      }
    }
  }
}
