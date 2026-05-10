import { Exclude } from 'class-transformer';
import { Comment } from 'src/modules/comments/entities/comment.entity';
import { Like } from 'src/modules/likes/entities/like.entity';
import { Post } from 'src/modules/posts/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  first_name: string;

  @Column({ type: 'varchar', length: 100 })
  last_name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 50, default: 'admin' })
  role: string;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @Column({ default: 0 })
  token_version: number;

  @Column({ type: 'boolean', default: false })
  has_refresh_token: boolean;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  remember_token?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
