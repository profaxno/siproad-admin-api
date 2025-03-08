import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Company } from "./company.entity";
import { UserRole } from "./user-role.entity";
import { RolePermission } from "./role-permission.entity";

@Entity("adm_role")
export class Role {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 50 })
  name: string;

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
    (userRole) => userRole.role
  )
  userRole: UserRole;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.role,
    { eager: true }
  )
  rolePermission: RolePermission[];
}
