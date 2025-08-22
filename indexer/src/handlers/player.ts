import { In } from 'typeorm';
import { isSailsEvent, isUserMessageSentEvent } from '../helpers';
import { Player } from '../model';
import { ProcessorContext } from '../processor';
import { SailsDecoder } from '../sails-decoder';
import { BaseHandler } from './base';

type EventMessage = ReturnType<SailsDecoder['decodeEvent']>;

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const getPlayerProps = (props: { id: string; score?: number; shipLevel?: number; name?: string }): Player => ({
  id: props.id,
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

  private _isValidPayload(payload: unknown, key: string, method: string): payload is Record<string, unknown> {
    if (!isObject(payload) || !(key in payload)) {
      this._ctx.log.error(`Invalid payload structure for ${method} event. '${key}' key is missing`);

      return false;
    }

    return true;
  }

  public async process(ctx: ProcessorContext) {
    await super.process(ctx);

    const playerAddresses = new Set<string>();
    const eventsToProcess = <{ event: EventMessage; playerAddress: string }[]>[];

    for (const block of ctx.blocks) {
      for (const event of block.events) {
        if (!isUserMessageSentEvent(event) || !isSailsEvent(event)) continue;

        const decodedEvent = this._decoder.decodeEvent(event);
        const { service, method, payload } = decodedEvent;

        if (
          service !== 'Starship' ||
          !['PointsAdded', 'NewShipBought', 'NameSet'].includes(method) ||
          !this._isValidPayload(payload, 'player', method)
        )
          continue;

        const playerAddress = String(payload.player);

        playerAddresses.add(playerAddress);
        eventsToProcess.push({ event: decodedEvent, playerAddress });
      }
    }

    if (playerAddresses.size !== 0) {
      const ids = Array.from(playerAddresses);
      const storedPlayers = await ctx.store.find(Player, { where: { id: In(ids) } });

      this._data = new Map(storedPlayers.map((player) => [player.id, player]));
    }

    for (const { event, playerAddress } of eventsToProcess) {
      const { method, payload } = event;

      const existingPlayer = this._data.get(playerAddress);
      const player = existingPlayer || new Player(getPlayerProps({ id: playerAddress }));
      const prevPlayer = { ...player };

      switch (method) {
        case 'PointsAdded': {
          if (!this._isValidPayload(payload, 'points', method)) break;

          player.score += Number(payload.points);
          break;
        }

        case 'NewShipBought': {
          if (!this._isValidPayload(payload, 'level', method)) break;

          player.shipLevel = Number(payload.level);
          break;
        }

        case 'NameSet': {
          if (!this._isValidPayload(payload, 'name', method)) break;

          player.name = String(payload.name);
          break;
        }
      }

      if (existingPlayer) {
        ctx.log.info(`Player ${player.id} updated: ${JSON.stringify(prevPlayer)} => ${JSON.stringify(player)}`);
      } else {
        ctx.log.info(`New player ${player.id} added: ${JSON.stringify(player)}`);
      }

      this._data.set(playerAddress, player);
    }
  }
}
