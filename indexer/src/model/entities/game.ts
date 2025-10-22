import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Game {
  constructor(props?: Game) {
    Object.assign(this, props);
  }

  @PrimaryColumn()
  id: string;

  @Column('timestamp with time zone')
  timestamp: Date;

  @Column('varchar', { name: 'player_address' })
  playerAddress: string;

  @Column('int4')
  points: number;

  @Column('int2', { name: 'boosters_count' })
  boostersCount: number;
}
