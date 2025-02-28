import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Company } from "./company.entity";
import { UserRole } from "./user-role.entity";

@Entity("adm_user")
export class User {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 90 })
  name: string;

  @Column('varchar', { length: 45, unique: true })
  email: string;

  @Column('varchar', { length: 255 })
  password: string;

  @Column('tinyint', { unsigned: true })
  status: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column('boolean', { default: true })
  active: boolean;

  @ManyToOne(
    () => Company,
    (company) => company.user,
    { eager: true }
  )
  company: Company;

  @OneToMany(
    () => UserRole,
    (userRole) => userRole.user,
    { eager: true }
  )
  userRole: UserRole[];
}
