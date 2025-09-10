import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./role.entity";
import { Permission } from "./permission.entity";

@Entity("adm_role_permission")
export class RolePermission {
  
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Role,
    (role) => role.rolePermission
  )
  role: Role;

  @ManyToOne(
    () => Permission,
    (permission) => permission.rolePermission,
    { eager: true }
  )
  permission: Permission;
}
