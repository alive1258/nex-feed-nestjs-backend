export class Mail {}
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class OTP {
  /**
   * Primary key
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   *  user id
   */
  @Column({ type: 'uuid' }) // <-- this must match the type of User.id
  added_by: string;

  /**
   * otp code
   */
  @Column({
    type: 'varchar',
    nullable: false,
  })
  @Exclude()
  otp_code: string;

  /**
   * attempt
   */
  @Column({
    type: 'int',
    nullable: false,
  })
  attempt: number;

  /**
   * expire at
   */
  @Column({
    type: 'timestamp',
    nullable: false,
  })
  expire_at: Date;

  /**
   * created at
   */
  @CreateDateColumn()
  created_at: Date;

  /**
   * updated at
   */
  @UpdateDateColumn()
  updated_at: Date;
}
