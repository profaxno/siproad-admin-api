import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserRole } from "./user-role.entity";
import { Company } from "src/admin/companies/entities/company.entity";

@Entity("adm_user")
export class User {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 50 })
  name: string;

  @Column('varchar', { length: 50 })
  email: string;

  @Column('varchar', { length: 100 })
  password: string;

  @Column('tinyint', { default: 1, unsigned: true })
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
