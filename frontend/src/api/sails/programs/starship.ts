/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { GearApi, Program, HexString, decodeAddress } from '@gear-js/api';
import { TypeRegistry } from '@polkadot/types';
import {
  TransactionBuilder,
  ActorId,
  throwOnErrorReply,
  getServiceNamePrefix,
  getFnNamePrefix,
  ZERO_ADDRESS,
} from 'sails-js';

export interface Config {
  ft_contract: ActorId;
  ship_price: number | string | bigint;
  one_point_in_value: number | string | bigint;
}

export interface PlayerInfo {
  earned_points: number | string | bigint;
  level: number;
  ship: number;
}

export class SailsProgram {
  public readonly registry: TypeRegistry;
  public readonly starship: Starship;
  private _program!: Program;

  constructor(
    public api: GearApi,
    programId?: `0x${string}`,
  ) {
    const types: Record<string, any> = {
      Config: { ft_contract: '[u8;32]', ship_price: 'u128', one_point_in_value: 'u128' },
      PlayerInfo: { earned_points: 'u128', level: 'u16', ship: 'u16' },
    };

    this.registry = new TypeRegistry();
    this.registry.setKnownTypes({ types });
    this.registry.register(types);
    if (programId) {
      this._program = new Program(programId, api);
    }

    this.starship = new Starship(this);
  }

  public get programId(): `0x${string}` {
    if (!this._program) throw new Error(`Program ID is not set`);
    return this._program.id;
  }

  newCtorFromCode(code: Uint8Array | Buffer | HexString, config: Config): TransactionBuilder<null> {
    const builder = new TransactionBuilder<null>(
      this.api,
      this.registry,
      'upload_program',
      ['New', config],
      '(String, Config)',
      'String',
      code,
      async (programId) => {
        this._program = await Program.new(programId, this.api);
      },
    );
    return builder;
  }

  newCtorFromCodeId(codeId: `0x${string}`, config: Config) {
    const builder = new TransactionBuilder<null>(
      this.api,
      this.registry,
      'create_program',
      ['New', config],
      '(String, Config)',
      'String',
      codeId,
      async (programId) => {
        this._program = await Program.new(programId, this.api);
      },
    );
    return builder;
  }
}

export class Starship {
  constructor(private _program: SailsProgram) {}

  public addPoints(points: number | string | bigint, new_level: boolean): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Starship', 'AddPoints', points, new_level],
      '(String, String, u128, bool)',
      'Null',
      this._program.programId,
    );
  }

  public burnPoints(points: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Starship', 'BurnPoints', points],
      '(String, String, u128)',
      'Null',
      this._program.programId,
    );
  }

  public buyNewShip(): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Starship', 'BuyNewShip'],
      '(String, String)',
      'Null',
      this._program.programId,
    );
  }

  public buyPoints(points_amount: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Starship', 'BuyPoints', points_amount],
      '(String, String, u128)',
      'Null',
      this._program.programId,
    );
  }

  public changeAdmin(new_admin: ActorId): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Starship', 'ChangeAdmin', new_admin],
      '(String, String, [u8;32])',
      'Null',
      this._program.programId,
    );
  }

  public changeConfig(config: Config): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Starship', 'ChangeConfig', config],
      '(String, String, Config)',
      'Null',
      this._program.programId,
    );
  }

  public withdrawalOfValues(to: ActorId): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Starship', 'WithdrawalOfValues', to],
      '(String, String, [u8;32])',
      'Null',
      this._program.programId,
    );
  }

  public async allPlayersInfo(
    originAddress?: string,
    value?: number | string | bigint,
    atBlock?: `0x${string}`,
  ): Promise<Array<[ActorId, PlayerInfo]>> {
    const payload = this._program.registry.createType('(String, String)', ['Starship', 'AllPlayersInfo']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, Vec<([u8;32], PlayerInfo)>)', reply.payload);
    return result[2].toJSON() as unknown as Array<[ActorId, PlayerInfo]>;
  }

  public async config(
    originAddress?: string,
    value?: number | string | bigint,
    atBlock?: `0x${string}`,
  ): Promise<Config> {
    const payload = this._program.registry.createType('(String, String)', ['Starship', 'Config']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, Config)', reply.payload);
    return result[2].toJSON() as unknown as Config;
  }

  public async playersInfo(
    player: ActorId,
    originAddress?: string,
    value?: number | string | bigint,
    atBlock?: `0x${string}`,
  ): Promise<PlayerInfo> {
    const payload = this._program.registry
      .createType('(String, String, [u8;32])', ['Starship', 'PlayersInfo', player])
      .toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    throwOnErrorReply(reply.code, reply.payload.toU8a(), this._program.api.specVersion, this._program.registry);
    const result = this._program.registry.createType('(String, String, PlayerInfo)', reply.payload);
    return result[2].toJSON() as unknown as PlayerInfo;
  }

  public subscribeToPointsBurnedEvent(callback: (data: bigint) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Starship' && getFnNamePrefix(payload) === 'PointsBurned') {
        callback(
          this._program.registry
            .createType('(String, String, u128)', message.payload)[2]
            .toBigInt() as unknown as bigint,
        );
      }
    });
  }

  public subscribeToPointsAddedEvent(callback: (data: bigint) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Starship' && getFnNamePrefix(payload) === 'PointsAdded') {
        callback(
          this._program.registry
            .createType('(String, String, u128)', message.payload)[2]
            .toBigInt() as unknown as bigint,
        );
      }
    });
  }

  public subscribeToPointsBoughtEvent(callback: (data: bigint) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Starship' && getFnNamePrefix(payload) === 'PointsBought') {
        callback(
          this._program.registry
            .createType('(String, String, u128)', message.payload)[2]
            .toBigInt() as unknown as bigint,
        );
      }
    });
  }

  public subscribeToNewShipBoughtEvent(callback: (data: null) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Starship' && getFnNamePrefix(payload) === 'NewShipBought') {
        callback(null);
      }
    });
  }

  public subscribeToValuesHaveBeenWithdrawnEvent(callback: (data: null) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Starship' && getFnNamePrefix(payload) === 'ValuesHaveBeenWithdrawn') {
        callback(null);
      }
    });
  }

  public subscribeToConfigChangedEvent(callback: (data: Config) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Starship' && getFnNamePrefix(payload) === 'ConfigChanged') {
        callback(
          this._program.registry
            .createType('(String, String, Config)', message.payload)[2]
            .toJSON() as unknown as Config,
        );
      }
    });
  }

  public subscribeToAdminChangedEvent(callback: (data: ActorId) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Starship' && getFnNamePrefix(payload) === 'AdminChanged') {
        callback(
          this._program.registry
            .createType('(String, String, [u8;32])', message.payload)[2]
            .toJSON() as unknown as ActorId,
        );
      }
    });
  }
}
