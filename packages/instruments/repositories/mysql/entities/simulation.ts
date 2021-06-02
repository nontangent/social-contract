import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { ISimulation } from '@social-contract/instruments/models';
import { SystemResult } from './system-result';

@Entity({name: 'simulations'})
export class Simulation implements ISimulation {

  @PrimaryColumn()
  id!: string;

  @Column()
  initialState!: string;

  @Column()
  description!: string;

  @OneToMany(() => SystemResult, result => result.simulation)
  results!: SystemResult[];

  @Column()
  playersInfo!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(simulation?: ISimulation) {
    Object.assign(this, simulation);
    this.playersInfo = JSON.stringify(simulation?.playersInfo);
  }

}