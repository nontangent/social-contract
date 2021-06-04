import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ISystemResult } from '@social-contract/instruments/models';
import { Simulation } from './simulation';

@Entity({name: 'results'})
export class SystemResult {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Simulation, simulation => simulation.results)
  simulation!: Simulation;

  simulationId!: string;

  @Column()
  t!: number;

  @Column()
  ownerId!: string;

  @Column({type: 'float', nullable: true})
  reported!: number;

  @Column({type: 'float', nullable: true})
  true!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(result: ISystemResult) {
    Object.assign(this, result);
  }

}