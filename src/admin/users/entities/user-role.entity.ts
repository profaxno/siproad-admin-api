import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Role } from "../../roles/entities/role.entity";

@Entity("adm_user_role")
export class UserRole {
  
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => User,
    (user) => user.userRole
  )
  user: User;

  @ManyToOne(
    () => Role,
    (user) => user.userRole,
    { eager: true }
  )
  role: Role;
}
