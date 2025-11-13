/* eslint-disable */

import {
  ActorId,
  TransactionBuilder,
  QueryBuilder,
  getServiceNamePrefix,
  getFnNamePrefix,
  ZERO_ADDRESS,
} from 'sails-js';
import { GearApi, BaseGearProgram, HexString } from '@gear-js/api';
import { TypeRegistry } from '@polkadot/types';

export interface Config {
  name: string;
  description: string;
  collection_tags: Array<string>;
  collection_banner: string;
  collection_logo: string;
  user_mint_limit: number | null;
  additional_links: AdditionalLinks | null;
  royalty: number;
  payment_for_mint: number | string | bigint;
  transferable: number | string | bigint | null;
  sellable: number | string | bigint | null;
  variable_meta: boolean;
}

export interface AdditionalLinks {
  external_url: string | null;
  telegram: string | null;
  xcom: string | null;
  medium: string | null;
  discord: string | null;
}

export interface ImageData {
  limit_copies: number | null;
  name: string | null;
}

export interface NftState {
  tokens: Array<[number | string | bigint, NftData]>;
  owners: Array<[ActorId, Array<number | string | bigint>]>;
  token_approvals: Array<[number | string | bigint, ActorId]>;
  config: Config;
  nonce: number | string | bigint;
  img_links_and_data: Array<[string, ImageData]>;
  collection_owner: ActorId;
  total_number_of_tokens: number | string | bigint | null;
  permission_to_mint: Array<ActorId> | null;
  marketplace_address: ActorId;
  admins: Array<ActorId>;
}

export interface NftData {
  owner: ActorId;
  name: string;
  description: string;
  metadata: Array<string>;
  media_url: string;
  mint_time: number | string | bigint;
}

export interface TokenInfo {
  token_owner: ActorId;
  approval: ActorId | null;
  sellable: boolean;
  collection_owner: ActorId;
  royalty: number;
}

export class SailsProgram {
  public readonly registry: TypeRegistry;
  public readonly nft: Nft;
  private _program?: BaseGearProgram;

  constructor(
    public api: GearApi,
    programId?: `0x${string}`,
  ) {
    const types: Record<string, any> = {
      Config: {
        name: 'String',
        description: 'String',
        collection_tags: 'Vec<String>',
        collection_banner: 'String',
        collection_logo: 'String',
        user_mint_limit: 'Option<u32>',
        additional_links: 'Option<AdditionalLinks>',
        royalty: 'u16',
        payment_for_mint: 'u128',
        transferable: 'Option<u64>',
        sellable: 'Option<u64>',
        variable_meta: 'bool',
      },
      AdditionalLinks: {
        external_url: 'Option<String>',
        telegram: 'Option<String>',
        xcom: 'Option<String>',
        medium: 'Option<String>',
        discord: 'Option<String>',
      },
      ImageData: { limit_copies: 'Option<u32>', name: 'Option<String>' },
      NftState: {
        tokens: 'Vec<(u64, NftData)>',
        owners: 'Vec<([u8;32], Vec<u64>)>',
        token_approvals: 'Vec<(u64, [u8;32])>',
        config: 'Config',
        nonce: 'u64',
        img_links_and_data: 'Vec<(String, ImageData)>',
        collection_owner: '[u8;32]',
        total_number_of_tokens: 'Option<u64>',
        permission_to_mint: 'Option<Vec<[u8;32]>>',
        marketplace_address: '[u8;32]',
        admins: 'Vec<[u8;32]>',
      },
      NftData: {
        owner: '[u8;32]',
        name: 'String',
        description: 'String',
        metadata: 'Vec<String>',
        media_url: 'String',
        mint_time: 'u64',
      },
      TokenInfo: {
        token_owner: '[u8;32]',
        approval: 'Option<[u8;32]>',
        sellable: 'bool',
        collection_owner: '[u8;32]',
        royalty: 'u16',
      },
    };

    this.registry = new TypeRegistry();
    this.registry.setKnownTypes({ types });
    this.registry.register(types);
    if (programId) {
      this._program = new BaseGearProgram(programId, api);
    }

    this.nft = new Nft(this);
  }

  public get programId(): `0x${string}` {
    if (!this._program) throw new Error(`Program ID is not set`);
    return this._program.id;
  }

  newCtorFromCode(
    code: Uint8Array | Buffer | HexString,
    collection_owner: ActorId,
    config: Config,
    img_links_and_data: Array<[string, ImageData]>,
    permission_to_mint: Array<ActorId> | null,
  ): TransactionBuilder<null> {
    const builder = new TransactionBuilder<null>(
      this.api,
      this.registry,
      'upload_program',
      null,
      'New',
      [collection_owner, config, img_links_and_data, permission_to_mint],
      '([u8;32], Config, Vec<(String, ImageData)>, Option<Vec<[u8;32]>>)',
      'String',
      code,
      async (programId) => {
        this._program = await BaseGearProgram.new(programId, this.api);
      },
    );
    return builder;
  }

  newCtorFromCodeId(
    codeId: `0x${string}`,
    collection_owner: ActorId,
    config: Config,
    img_links_and_data: Array<[string, ImageData]>,
    permission_to_mint: Array<ActorId> | null,
  ) {
    const builder = new TransactionBuilder<null>(
      this.api,
      this.registry,
      'create_program',
      null,
      'New',
      [collection_owner, config, img_links_and_data, permission_to_mint],
      '([u8;32], Config, Vec<(String, ImageData)>, Option<Vec<[u8;32]>>)',
      'String',
      codeId,
      async (programId) => {
        this._program = await BaseGearProgram.new(programId, this.api);
      },
    );
    return builder;
  }
}

export class Nft {
  constructor(private _program: SailsProgram) {}

  public addAdmin(admin: ActorId): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      'Nft',
      'AddAdmin',
      admin,
      '[u8;32]',
      'Null',
      this._program.programId,
    );
  }

  public addMetadata(nft_id: number | string | bigint, metadata: string): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      'Nft',
      'AddMetadata',
      [nft_id, metadata],
      '(u64, String)',
      'Null',
      this._program.programId,
    );
  }

  public addUsersForMint(users: Array<ActorId>): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      'Nft',
      'AddUsersForMint',
      users,
      'Vec<[u8;32]>',
      'Null',
      this._program.programId,
    );
  }

  public approve(to: ActorId, token_id: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      'Nft',
      'Approve',
      [to, token_id],
      '([u8;32], u64)',
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
      'Nft',
      'ChangeConfig',
      config,
      'Config',
      'Null',
      this._program.programId,
    );
  }

  public changeImgLink(nft_id: number | string | bigint, img_link: string): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      'Nft',
      'ChangeImgLink',
      [nft_id, img_link],
      '(u64, String)',
      'Null',
      this._program.programId,
    );
  }

  public changeMetadata(nft_id: number | string | bigint, metadata: Array<string>): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      'Nft',
      'ChangeMetadata',
      [nft_id, metadata],
      '(u64, Vec<String>)',
      'Null',
      this._program.programId,
    );
  }

  public deleteMetadata(nft_id: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      'Nft',
      'DeleteMetadata',
      nft_id,
      'u64',
      'Null',
      this._program.programId,
    );
  }

  public deleteUserForMint(user: ActorId): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      'Nft',
      'DeleteUserForMint',
      user,
      '[u8;32]',
      'Null',
      this._program.programId,
    );
  }

  public expand(additional_links: Array<[string, ImageData]>): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      'Nft',
      'Expand',
      additional_links,
      'Vec<(String, ImageData)>',
      'Null',
      this._program.programId,
    );
  }

  public liftRestrictionsMint(): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      'Nft',
      'LiftRestrictionsMint',
      null,
      null,
      'Null',
      this._program.programId,
    );
  }

  public mint(minter: ActorId, img_link_id: number | string | bigint | null): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      'Nft',
      'Mint',
      [minter, img_link_id],
      '([u8;32], Option<u64>)',
      'Null',
      this._program.programId,
    );
  }

  public removeAdmin(admin: ActorId): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      'Nft',
      'RemoveAdmin',
      admin,
      '[u8;32]',
      'Null',
      this._program.programId,
    );
  }

  public revokeApprove(token_id: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      'Nft',
      'RevokeApprove',
      token_id,
      'u64',
      'Null',
      this._program.programId,
    );
  }

  public transferFrom($from: ActorId, to: ActorId, token_id: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      'Nft',
      'TransferFrom',
      [$from, to, token_id],
      '([u8;32], [u8;32], u64)',
      'Null',
      this._program.programId,
    );
  }

  public all(): QueryBuilder<NftState> {
    return new QueryBuilder<NftState>(
      this._program.api,
      this._program.registry,
      this._program.programId,
      'Nft',
      'All',
      null,
      null,
      'NftState',
    );
  }

  public canDelete(): QueryBuilder<boolean> {
    return new QueryBuilder<boolean>(
      this._program.api,
      this._program.registry,
      this._program.programId,
      'Nft',
      'CanDelete',
      null,
      null,
      'bool',
    );
  }

  public collectionOwner(): QueryBuilder<ActorId> {
    return new QueryBuilder<ActorId>(
      this._program.api,
      this._program.registry,
      this._program.programId,
      'Nft',
      'CollectionOwner',
      null,
      null,
      '[u8;32]',
    );
  }

  public config(): QueryBuilder<Config> {
    return new QueryBuilder<Config>(
      this._program.api,
      this._program.registry,
      this._program.programId,
      'Nft',
      'Config',
      null,
      null,
      'Config',
    );
  }

  public description(): QueryBuilder<string> {
    return new QueryBuilder<string>(
      this._program.api,
      this._program.registry,
      this._program.programId,
      'Nft',
      'Description',
      null,
      null,
      'String',
    );
  }

  public getPaymentForMint(): QueryBuilder<bigint> {
    return new QueryBuilder<bigint>(
      this._program.api,
      this._program.registry,
      this._program.programId,
      'Nft',
      'GetPaymentForMint',
      null,
      null,
      'u128',
    );
  }

  public getTokenInfo(token_id: number | string | bigint): QueryBuilder<TokenInfo> {
    return new QueryBuilder<TokenInfo>(
      this._program.api,
      this._program.registry,
      this._program.programId,
      'Nft',
      'GetTokenInfo',
      token_id,
      'u64',
      'TokenInfo',
    );
  }

  public getTokensIdByOwner(owner_id: ActorId): QueryBuilder<Array<number | string | bigint>> {
    return new QueryBuilder<Array<number | string | bigint>>(
      this._program.api,
      this._program.registry,
      this._program.programId,
      'Nft',
      'GetTokensIdByOwner',
      owner_id,
      '[u8;32]',
      'Vec<u64>',
    );
  }

  public getTokensInfoByOwner(owner_id: ActorId): QueryBuilder<Array<NftData>> {
    return new QueryBuilder<Array<NftData>>(
      this._program.api,
      this._program.registry,
      this._program.programId,
      'Nft',
      'GetTokensInfoByOwner',
      owner_id,
      '[u8;32]',
      'Vec<NftData>',
    );
  }

  public imgLinksAndData(): QueryBuilder<Array<[string, ImageData]>> {
    return new QueryBuilder<Array<[string, ImageData]>>(
      this._program.api,
      this._program.registry,
      this._program.programId,
      'Nft',
      'ImgLinksAndData',
      null,
      null,
      'Vec<(String, ImageData)>',
    );
  }

  public marketplaceAddress(): QueryBuilder<ActorId> {
    return new QueryBuilder<ActorId>(
      this._program.api,
      this._program.registry,
      this._program.programId,
      'Nft',
      'MarketplaceAddress',
      null,
      null,
      '[u8;32]',
    );
  }

  public name(): QueryBuilder<string> {
    return new QueryBuilder<string>(
      this._program.api,
      this._program.registry,
      this._program.programId,
      'Nft',
      'Name',
      null,
      null,
      'String',
    );
  }

  public nonce(): QueryBuilder<bigint> {
    return new QueryBuilder<bigint>(
      this._program.api,
      this._program.registry,
      this._program.programId,
      'Nft',
      'Nonce',
      null,
      null,
      'u64',
    );
  }

  public permissionToMint(): QueryBuilder<Array<ActorId> | null> {
    return new QueryBuilder<Array<ActorId> | null>(
      this._program.api,
      this._program.registry,
      this._program.programId,
      'Nft',
      'PermissionToMint',
      null,
      null,
      'Option<Vec<[u8;32]>>',
    );
  }

  public totalNumberOfTokens(): QueryBuilder<number | string | bigint | null> {
    return new QueryBuilder<number | string | bigint | null>(
      this._program.api,
      this._program.registry,
      this._program.programId,
      'Nft',
      'TotalNumberOfTokens',
      null,
      null,
      'Option<u64>',
    );
  }

  public subscribeToTransferredEvent(
    callback: (data: {
      owner: ActorId;
      recipient: ActorId;
      token_id: number | string | bigint;
    }) => void | Promise<void>,
  ): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Nft' && getFnNamePrefix(payload) === 'Transferred') {
        callback(
          this._program.registry
            .createType(
              '(String, String, {"owner":"[u8;32]","recipient":"[u8;32]","token_id":"u64"})',
              message.payload,
            )[2]
            .toJSON() as unknown as { owner: ActorId; recipient: ActorId; token_id: number | string | bigint },
        );
      }
    });
  }

  public subscribeToMintedEvent(
    callback: (data: { token_id: number | string | bigint; nft_data: NftData }) => void | Promise<void>,
  ): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Nft' && getFnNamePrefix(payload) === 'Minted') {
        callback(
          this._program.registry
            .createType('(String, String, {"token_id":"u64","nft_data":"NftData"})', message.payload)[2]
            .toJSON() as unknown as { token_id: number | string | bigint; nft_data: NftData },
        );
      }
    });
  }

  public subscribeToInitializedEvent(
    callback: (data: {
      config: Config;
      total_number_of_tokens: number | string | bigint | null;
      permission_to_mint: Array<ActorId> | null;
    }) => void | Promise<void>,
  ): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Nft' && getFnNamePrefix(payload) === 'Initialized') {
        callback(
          this._program.registry
            .createType(
              '(String, String, {"config":"Config","total_number_of_tokens":"Option<u64>","permission_to_mint":"Option<Vec<[u8;32]>>"})',
              message.payload,
            )[2]
            .toJSON() as unknown as {
            config: Config;
            total_number_of_tokens: number | string | bigint | null;
            permission_to_mint: Array<ActorId> | null;
          },
        );
      }
    });
  }

  public subscribeToApprovedEvent(
    callback: (data: { to: ActorId; token_id: number | string | bigint }) => void | Promise<void>,
  ): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Nft' && getFnNamePrefix(payload) === 'Approved') {
        callback(
          this._program.registry
            .createType('(String, String, {"to":"[u8;32]","token_id":"u64"})', message.payload)[2]
            .toJSON() as unknown as { to: ActorId; token_id: number | string | bigint },
        );
      }
    });
  }

  public subscribeToApprovalRevokedEvent(
    callback: (data: { token_id: number | string | bigint }) => void | Promise<void>,
  ): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Nft' && getFnNamePrefix(payload) === 'ApprovalRevoked') {
        callback(
          this._program.registry
            .createType('(String, String, {"token_id":"u64"})', message.payload)[2]
            .toJSON() as unknown as { token_id: number | string | bigint },
        );
      }
    });
  }

  public subscribeToExpandedEvent(
    callback: (data: {
      additional_links: Array<[string, ImageData]>;
      total_number_of_tokens: number | string | bigint | null;
    }) => void | Promise<void>,
  ): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Nft' && getFnNamePrefix(payload) === 'Expanded') {
        callback(
          this._program.registry
            .createType(
              '(String, String, {"additional_links":"Vec<(String, ImageData)>","total_number_of_tokens":"Option<u64>"})',
              message.payload,
            )[2]
            .toJSON() as unknown as {
            additional_links: Array<[string, ImageData]>;
            total_number_of_tokens: number | string | bigint | null;
          },
        );
      }
    });
  }

  public subscribeToConfigChangedEvent(
    callback: (data: { config: Config }) => void | Promise<void>,
  ): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Nft' && getFnNamePrefix(payload) === 'ConfigChanged') {
        callback(
          this._program.registry
            .createType('(String, String, {"config":"Config"})', message.payload)[2]
            .toJSON() as unknown as { config: Config },
        );
      }
    });
  }

  public subscribeToUsersForMintAddedEvent(
    callback: (data: { users: Array<ActorId> }) => void | Promise<void>,
  ): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Nft' && getFnNamePrefix(payload) === 'UsersForMintAdded') {
        callback(
          this._program.registry
            .createType('(String, String, {"users":"Vec<[u8;32]>"})', message.payload)[2]
            .toJSON() as unknown as { users: Array<ActorId> },
        );
      }
    });
  }

  public subscribeToUserForMintDeletedEvent(
    callback: (data: { user: ActorId }) => void | Promise<void>,
  ): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Nft' && getFnNamePrefix(payload) === 'UserForMintDeleted') {
        callback(
          this._program.registry
            .createType('(String, String, {"user":"[u8;32]"})', message.payload)[2]
            .toJSON() as unknown as { user: ActorId },
        );
      }
    });
  }

  public subscribeToLiftRestrictionMintEvent(callback: (data: null) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Nft' && getFnNamePrefix(payload) === 'LiftRestrictionMint') {
        callback(null);
      }
    });
  }

  public subscribeToAdminAddedEvent(callback: (data: { admin: ActorId }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Nft' && getFnNamePrefix(payload) === 'AdminAdded') {
        callback(
          this._program.registry
            .createType('(String, String, {"admin":"[u8;32]"})', message.payload)[2]
            .toJSON() as unknown as { admin: ActorId },
        );
      }
    });
  }

  public subscribeToAdminRemovedEvent(
    callback: (data: { admin: ActorId }) => void | Promise<void>,
  ): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Nft' && getFnNamePrefix(payload) === 'AdminRemoved') {
        callback(
          this._program.registry
            .createType('(String, String, {"admin":"[u8;32]"})', message.payload)[2]
            .toJSON() as unknown as { admin: ActorId },
        );
      }
    });
  }

  public subscribeToMetadataAddedEvent(
    callback: (data: { nft_id: number | string | bigint; metadata: string }) => void | Promise<void>,
  ): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Nft' && getFnNamePrefix(payload) === 'MetadataAdded') {
        callback(
          this._program.registry
            .createType('(String, String, {"nft_id":"u64","metadata":"String"})', message.payload)[2]
            .toJSON() as unknown as { nft_id: number | string | bigint; metadata: string },
        );
      }
    });
  }

  public subscribeToImageLinkChangedEvent(
    callback: (data: { nft_id: number | string | bigint; img_link: string }) => void | Promise<void>,
  ): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Nft' && getFnNamePrefix(payload) === 'ImageLinkChanged') {
        callback(
          this._program.registry
            .createType('(String, String, {"nft_id":"u64","img_link":"String"})', message.payload)[2]
            .toJSON() as unknown as { nft_id: number | string | bigint; img_link: string },
        );
      }
    });
  }

  public subscribeToMetadataChangedEvent(
    callback: (data: { nft_id: number | string | bigint; metadata: Array<string> }) => void | Promise<void>,
  ): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Nft' && getFnNamePrefix(payload) === 'MetadataChanged') {
        callback(
          this._program.registry
            .createType('(String, String, {"nft_id":"u64","metadata":"Vec<String>"})', message.payload)[2]
            .toJSON() as unknown as { nft_id: number | string | bigint; metadata: Array<string> },
        );
      }
    });
  }

  public subscribeToMetadataDeletedEvent(
    callback: (data: { nft_id: number | string | bigint }) => void | Promise<void>,
  ): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Nft' && getFnNamePrefix(payload) === 'MetadataDeleted') {
        callback(
          this._program.registry
            .createType('(String, String, {"nft_id":"u64"})', message.payload)[2]
            .toJSON() as unknown as { nft_id: number | string | bigint },
        );
      }
    });
  }
}
