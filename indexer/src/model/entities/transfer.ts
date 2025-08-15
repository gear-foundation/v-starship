import { Column, Entity, PrimaryColumn } from 'typeorm';

// !Always specify name of the entity in snake_case!
@Entity({ name: 'vft_transfer' })
export class VftTransfer {
  constructor(props: Partial<VftTransfer>) {
    Object.assign(this, props);
  }

  @PrimaryColumn()
  id: string;

  // !Always specify name of the column in snake_case!
  @Column('bigint', { name: 'block_number' })
  blockNumber: bigint;
}
