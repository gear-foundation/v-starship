import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
class Player {
  constructor(props?: Player) {
    Object.assign(this, props);
  }

  @PrimaryColumn()
  id: string;

  @Column('varchar')
  address: string;

  @Column('int4')
  score: number;

  @Column('int2', { name: 'ship_level' })
  shipLevel: number;

  @Column('varchar', { nullable: true })
  name: string | null;
}

export { Player };
