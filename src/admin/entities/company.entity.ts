import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity("adm_company")
export class Company {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 50, unique: true })
  name: string;

  @Column('varchar', { length: 100 })
  fantasyName: string;

  @Column('varchar', { length: 50 })
  idDoc: string;

  @Column('varchar', { length: 150 })
  address: string;

  @Column('varchar', { length: 50 })
  email: string;

  @Column('varchar', { length: 50 })
  phone: string;

  @Column('varchar', { length: 50 })
  bankName: string;

  @Column('varchar', { length: 50 })
  bankAccountType: string;

  @Column('varchar', { length: 100 })
  bankAccountNumber: string;

  @Column('varchar', { length: 500 })
  imgUrlLogo: string;
  
  @Column('varchar', { length: 500 })
  imgUrlHeader: string;
  
  @Column('varchar', { length: 500 })
  imgUrlFooter: string;
  
  @Column('varchar', { length: 500 })
  imgUrlTransferData: string;
  
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column('boolean', { default: true })
  active: boolean;

  @OneToMany(
    () => User,
    (user) => user.company
  )
  user: User;
}
