import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
class Player {
  constructor(props: Partial<Player>) {
    Object.assign(this, props);
  }

  @PrimaryColumn()
  id: string;

  @Column('int4')
  score: number;
}

export { Player };
