import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Company } from "./company.entity";

@Entity("adm_user")
export class User {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    length: 255
  })
  fullName: string;

  @Column('varchar', {
    length: 255,
    unique: true
  })
  email: string;

  @Column('varchar', {
    length: 20
  })
  password: string;

  // TODO: falta agregar createAt y UpdatedAt

  @Column('boolean', {
    default: true
  })
  active: boolean;

  @ManyToOne(
    () => Company,
    (company) => company.user,
    { eager: true }
  )
  company: Company;
}
