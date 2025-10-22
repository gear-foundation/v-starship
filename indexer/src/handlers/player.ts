import { Block } from '@subsquid/substrate-processor';
import { In } from 'typeorm';
import { getBlockCommonData, isSailsEvent, isUserMessageSentEvent } from '../helpers';
import { Game, Player } from '../model';
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
  private _addressToPlayer: Map<string, Player>;
  private _games: Game[];

  public async init() {
    this._decoder = await SailsDecoder.new('assets/starship.idl');
    this._addressToPlayer = new Map();
    this._games = [];
  }

  public clear() {
    this._addressToPlayer.clear();
    this._games = [];
  }

  public async save() {
    const players = Array.from(this._addressToPlayer.values());

    await Promise.all([this._ctx.store.save(players), this._ctx.store.save(this._games)]);
  }

  private _isValidPayload(payload: unknown, key: string, method: string): payload is Record<string, unknown> {
    if (!isObject(payload) || !(key in payload)) {
      this._ctx.log.error(`Invalid payload structure for ${method} event. '${key}' key is missing`);

      return false;
    }

    return true;
  }

  private _processGame(props: Game) {
    const game = new Game(props);

    this._games.push(game);
    this._ctx.log.info(`Game recorded for ${game.playerAddress}: ${game.points} points at ${game.timestamp.getTime()}`);
  }

  public async process(ctx: ProcessorContext) {
    await super.process(ctx);

    const playerAddresses = new Set<string>();
    const eventsToProcess = <
      { event: EventMessage; playerAddress: string; messageId: `0x${string}`; block: Block }[]
    >[];

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
        eventsToProcess.push({ event: decodedEvent, playerAddress, messageId: event.args.message.id, block });
      }
    }

    if (playerAddresses.size !== 0) {
      const ids = Array.from(playerAddresses);
      const storedPlayers = await ctx.store.find(Player, { where: { id: In(ids) } });

      this._addressToPlayer = new Map(storedPlayers.map((player) => [player.id, player]));
    }

    for (const { event, playerAddress, messageId, block } of eventsToProcess) {
      const { method, payload } = event;

      const existingPlayer = this._addressToPlayer.get(playerAddress);
      const player = existingPlayer || new Player(getPlayerProps({ id: playerAddress }));
      const prevPlayer = { ...player };

      switch (method) {
        case 'PointsAdded': {
          if (!this._isValidPayload(payload, 'points', method)) continue;

          const points = Number(payload.points);
          const timestamp = getBlockCommonData(block).blockTimestamp;

          player.score += points;
          this._processGame({ id: messageId, playerAddress, points, timestamp });
          break;
        }

        case 'NewShipBought': {
          if (!this._isValidPayload(payload, 'level', method)) continue;

          player.shipLevel = Number(payload.level);
          break;
        }

        case 'NameSet': {
          if (!this._isValidPayload(payload, 'name', method)) continue;

          player.name = String(payload.name);
          break;
        }
      }

      if (existingPlayer) {
        ctx.log.info(`Player ${player.id} updated: ${JSON.stringify(prevPlayer)} => ${JSON.stringify(player)}`);
      } else {
        ctx.log.info(`New player ${player.id} added: ${JSON.stringify(player)}`);
      }

      this._addressToPlayer.set(playerAddress, player);
    }
  }
}
