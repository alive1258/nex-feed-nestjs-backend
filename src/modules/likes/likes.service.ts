// likes.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';

import { Like } from './entities/like.entity';
import { CreateLikeDto } from './dto/create-like.dto';

import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  /**
   * Toggle Like (Facebook Style)
   */
  async toggleLike(req: Request, createLikeDto: CreateLikeDto) {
    const userId = req?.user?.sub;

    if (!userId) {
      throw new UnauthorizedException('Authentication required');
    }

    const { postId, commentId } = createLikeDto;

    // Must provide one target
    if (!postId && !commentId) {
      throw new BadRequestException('postId or commentId is required');
    }

    // Cannot like both together
    if (postId && commentId) {
      throw new BadRequestException('You can like either a post or a comment');
    }

    /**
     * =========================
     * POST LIKE
     * =========================
     */
    if (postId) {
      const post = await this.postRepository.findOne({
        where: { id: postId },
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      const existingLike = await this.likeRepository.findOne({
        where: {
          userId: String(userId),
          postId,
        },
      });

      // Unlike
      if (existingLike) {
        await this.likeRepository.remove(existingLike);

        return {
          liked: false,
          message: 'Post unliked successfully',
        };
      }

      // Like
      const like = this.likeRepository.create({
        userId: String(userId),
        postId,
      });

      await this.likeRepository.save(like);

      return {
        liked: true,
        message: 'Post liked successfully',
      };
    }

    /**
     * =========================
     * COMMENT LIKE
     * =========================
     */
    if (commentId) {
      const comment = await this.commentRepository.findOne({
        where: { id: commentId },
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      const existingLike = await this.likeRepository.findOne({
        where: {
          userId: String(userId),
          commentId,
        },
      });

      // Unlike
      if (existingLike) {
        await this.likeRepository.remove(existingLike);

        return {
          liked: false,
          message: 'Comment unliked successfully',
        };
      }

      // Like
      const like = this.likeRepository.create({
        userId: String(userId),
        commentId,
      });

      await this.likeRepository.save(like);

      return {
        liked: true,
        message: 'Comment liked successfully',
      };
    }
  }

  /**
   * Get Likes Count
   */
  async getLikesCount(postId?: string, commentId?: string) {
    if (postId) {
      const count = await this.likeRepository.count({
        where: { postId },
      });

      return {
        type: 'post',
        count,
      };
    }

    if (commentId) {
      const count = await this.likeRepository.count({
        where: { commentId },
      });

      return {
        type: 'comment',
        count,
      };
    }

    throw new BadRequestException('postId or commentId required');
  }
}
