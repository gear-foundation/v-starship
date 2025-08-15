import { getBlockCommonData, isSailsEvent, isUserMessageSentEvent } from '../helpers';
import { VftTransfer } from '../model';
import { ProcessorContext } from '../processor';
import { SailsDecoder } from '../sails-decoder';
import { BlockCommonData, UserMessageSentEvent } from '../types';
import { BaseHandler } from './base';

export class StubHandler extends BaseHandler {
  private _programDecoder: SailsDecoder;
  // TODO: replace with necessary data structures
  private _transfers: Map<string, VftTransfer>;

  public async init(): Promise<void> {
    // TODO: Implement if any initial setup is required
    // Otherwise just remove this method
    this._programDecoder = await SailsDecoder.new('assets/vft.idl');
  }

  public async clear(): Promise<void> {
    // TODO: Implement cleanup logic here
    this._transfers.clear();
  }

  public async save(): Promise<void> {
    // TODO: Implement save logic here
    this._ctx.store.save(Array.from(this._transfers.values()));
  }

  public async process(ctx: ProcessorContext): Promise<void> {
    // Always call super.process(ctx) first
    await super.process(ctx);

    for (const block of ctx.blocks) {
      const common = getBlockCommonData(block);

      for (const event of block.events) {
        if (isUserMessageSentEvent(event)) {
          this._handleUserMessageSentEvent(event, common);
        }
      }
    }
  }

  private _handleUserMessageSentEvent(event: UserMessageSentEvent, common: BlockCommonData) {
    if (isSailsEvent(event)) {
      const { service, method, payload } = this._programDecoder.decodeEvent(event);

      if (service === 'AwesomeService') {
        this._handleAwesomeService(method, payload, common);
      }
    }
  }

  private _handleAwesomeService(method: string, payload: any, common: BlockCommonData) {
    switch (method) {
      case 'Transfer': {
        this._transfers.set(payload.id, {
          id: payload.id,
          blockNumber: common.blockNumber,
        });
      }
    }
  }
}
