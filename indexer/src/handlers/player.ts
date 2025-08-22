import { isSailsEvent, isUserMessageSentEvent } from '../helpers';
import { Player } from '../model';
import { ProcessorContext } from '../processor';
import { SailsDecoder } from '../sails-decoder';
import { UserMessageSentEvent } from '../types';
import { BaseHandler } from './base';

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const getPlayerProps = (props: { address: string; score?: number; shipLevel?: number; name?: string }): Player => ({
  id: props.address,
  score: props.score ?? 0,
  shipLevel: props.shipLevel ?? 1,
  name: props.name ?? null,
});

export class PlayerHandler extends BaseHandler {
  private _decoder: SailsDecoder;
  private _data: Map<string, Player>;

  public async init() {
    this._decoder = await SailsDecoder.new('assets/starship.idl');
    this._data = new Map();
  }

  public clear() {
    this._data.clear();
  }

  public async save() {
    const values = this._data.values();

    await this._ctx.store.save(Array.from(values));
  }

  private _updateScore(payload: unknown, ctx: ProcessorContext) {
    if (!isObject(payload) || !('player' in payload) || !('points' in payload))
      return ctx.log.error('Invalid payload structure for PointsAdded event');

    const playerAddress = String(payload.player);
    const points = Number(payload.points);
    const player = this._data.get(playerAddress);

    if (player) {
      const prevScore = player.score;

      player.score += points;

      ctx.log.info(`Player ${playerAddress} score updated: ${prevScore} -> ${player.score} (+${points})`);
    } else {
      const props = getPlayerProps({ address: playerAddress, score: points });

      this._data.set(playerAddress, new Player(props));

      ctx.log.info(`Player added as a result of PointsAdded event: ${JSON.stringify(props)}`);
    }
  }

  private _updateShipLevel(payload: unknown, ctx: ProcessorContext) {
    if (!isObject(payload) || !('player' in payload) || !('level' in payload))
      return ctx.log.error('Invalid payload structure for NewShipBought event');

    const playerAddress = String(payload.player);
    const level = Number(payload.level);
    const player = this._data.get(playerAddress);

    if (player) {
      const prevShipLevel = player.shipLevel;

      player.shipLevel = level;

      ctx.log.info(`Player ${playerAddress} ship level updated: ${prevShipLevel} -> ${level}`);
    } else {
      const props = getPlayerProps({ address: playerAddress, shipLevel: level });

      this._data.set(playerAddress, new Player(props));

      ctx.log.warn(`Player added as a result of NewShipBought event: ${JSON.stringify(props)}`);
    }
  }

  private _updateName(payload: unknown, ctx: ProcessorContext) {
    if (!isObject(payload) || !('player' in payload) || !('name' in payload))
      return ctx.log.error('Invalid payload structure for NameSet event');

    const playerAddress = String(payload.player);
    const name = String(payload.name);
    const player = this._data.get(playerAddress);

    if (player) {
      const prevName = player.name;

      player.name = name;

      ctx.log.info(`Player ${playerAddress} name updated: ${prevName} -> ${name}`);
    } else {
      const props = getPlayerProps({ address: playerAddress, name });

      this._data.set(playerAddress, new Player(props));

      ctx.log.warn(`Player added as a result of NameSet event: ${JSON.stringify(props)}`);
    }
  }

  private _updatePlayer(event: UserMessageSentEvent, ctx: ProcessorContext) {
    if (!isSailsEvent(event)) return;

    const { service, method, payload } = this._decoder.decodeEvent(event);

    if (service !== 'Starship') return;

    switch (method) {
      case 'PointsAdded':
        return this._updateScore(payload, ctx);
      case 'NewShipBought':
        return this._updateShipLevel(payload, ctx);
      case 'NameSet':
        return this._updateName(payload, ctx);
    }
  }

  public async process(ctx: ProcessorContext) {
    await super.process(ctx);

    const storedPlayers = await ctx.store.find(Player);
    this._data = new Map(storedPlayers.map((player) => [player.id, player]));

    for (const block of ctx.blocks) {
      for (const event of block.events) {
        if (!isUserMessageSentEvent(event)) continue;

        this._updatePlayer(event, ctx);
      }
    }
  }
}
