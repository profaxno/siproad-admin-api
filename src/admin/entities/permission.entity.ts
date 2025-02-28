import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RolePermission } from "./role-permission.entity";

@Entity("adm_permission")
export class Permission {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 45, unique: true })
  label: string;

  @Column('varchar', { length: 45, unique: true })
  code: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
    
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column('boolean', { default: true })
  active: boolean;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission
  )
  rolePermission: RolePermission;
}
