import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Request } from 'express';
import { Comment } from './entities/comment.entity';
import { Post } from '../posts/entities/post.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly postService: PostsService,
  ) {}

  /**
   * Create a new comment or reply
   */
  async create(
    req: Request,
    postId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const userId = req?.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Authentication required.');
    }

    // Check if post exists and user has permission to view it
    await this.postService.findOne(postId, req);

    const comment = this.commentRepository.create({
      content: createCommentDto.content.trim(),
      userId: String(userId),
      postId: postId,
    });

    // Handle reply
    if (createCommentDto.parentCommentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: createCommentDto.parentCommentId, postId },
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      comment.parentCommentId = createCommentDto.parentCommentId;
    }

    return await this.commentRepository.save(comment);
  }

  /**
   * Get all comments for a post
   */
  // async findByPost(postId: string, req: Request): Promise<Comment[]> {
  //   // Check if post exists and user has permission
  //   await this.postService.findOne(postId, req);

  //   const comments = await this.commentRepository.find({
  //     where: {
  //       postId,
  //       parentCommentId: IsNull(),
  //     },
  //     relations: [
  //       'user',
  //       'replies',
  //       'replies.user',
  //       'likes',
  //       'likes.user',
  //       'replies.likes',
  //       'replies.likes.user',
  //     ],
  //     order: { createdAt: 'DESC' },
  //   });

  //   // Transform replies
  //   const transformedComments = comments.map((comment) => ({
  //     ...comment,
  //     replies: comment.replies?.sort(
  //       (a, b) =>
  //         new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  //     ),
  //   }));

  //   return transformedComments;
  // }

  async findByPost(postId: string, req: Request): Promise<Comment[]> {
    // Check if post exists and user has permission
    await this.postService.findOne(postId, req);

    const comments = await this.commentRepository
      .createQueryBuilder('comment')

      .leftJoinAndSelect('comment.user', 'user')

      .leftJoinAndSelect('comment.replies', 'replies')

      .leftJoinAndSelect('replies.user', 'replyUser')

      .leftJoinAndSelect('comment.likes', 'likes')

      .leftJoinAndSelect('likes.user', 'likeUser')

      .leftJoinAndSelect('replies.likes', 'replyLikes')

      .leftJoinAndSelect('replyLikes.user', 'replyLikeUser')

      .select([
        // Comment
        'comment.id',
        'comment.content',
        'comment.userId',
        'comment.postId',
        'comment.parentCommentId',
        'comment.createdAt',

        // Comment User
        'user.id',
        'user.first_name',
        'user.last_name',
        'user.email',

        // Replies
        'replies.id',
        'replies.content',
        'replies.userId',
        'replies.parentCommentId',
        'replies.createdAt',

        // Reply User
        'replyUser.id',
        'replyUser.first_name',
        'replyUser.last_name',
        'replyUser.email',

        // Likes
        'likes.id',
        'likes.userId',

        // Reply Likes
        'replyLikes.id',
        'replyLikes.userId',
      ])

      .where('comment.postId = :postId', { postId })

      .andWhere('comment.parentCommentId IS NULL')

      .orderBy('comment.createdAt', 'DESC')

      .addOrderBy('replies.createdAt', 'ASC')

      .getMany();

    return comments;
  }

  /**
   * Get single comment by ID
   */
  async findOne(id: string, req: Request): Promise<any> {
    const comment = await this.commentRepository.findOne({
      where: { id },

      relations: [
        'user',
        'post',
        'likes',
        'likes.user',
        'replies',
        'replies.user',
        'replies.likes',
      ],

      select: {
        id: true,
        content: true,
        userId: true,
        postId: true,
        parentCommentId: true,
        createdAt: true,
        updatedAt: true,

        user: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
        },

        replies: {
          id: true,
          content: true,
          userId: true,
          createdAt: true,

          user: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },

        likes: {
          id: true,
          userId: true,
        },
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    // Check post permission
    await this.postService.findOne(comment.postId, req);

    return comment;
  }

  /**
   * Update a comment
   */
  async update(
    id: string,
    req: Request,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const userId = req?.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Authentication required.');
    }

    const comment = await this.findOne(id, req);

    // Check ownership
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    if (updateCommentDto.content) {
      comment.content = updateCommentDto.content.trim();
    }

    return await this.commentRepository.save(comment);
  }

  /**
   * Delete a comment
   */
  async remove(id: string, req: Request): Promise<{ message: string }> {
    const userId = req?.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Authentication required.');
    }

    const comment = await this.findOne(id, req);

    // Check ownership
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentRepository.remove(comment);
    return { message: `Comment with ID ${id} has been deleted successfully` };
  }

  /**
   * Get comment with like status
   */
  async getCommentWithLikeStatus(id: string, req: Request): Promise<any> {
    const comment = await this.findOne(id, req);
    const userId = req?.user?.sub;

    let isLiked = false;
    if (userId && comment.likes) {
      isLiked = comment.likes.some((like) => like.userId === userId);
    }

    return {
      ...comment,
      likeCount: comment.likes?.length || 0,
      isLikedByCurrentUser: isLiked,
    };
  }

  /**
   * Get replies for a comment
   */
  async getReplies(commentId: string, req: Request): Promise<Comment[]> {
    const comment = await this.findOne(commentId, req);

    const replies = await this.commentRepository.find({
      where: { parentCommentId: commentId },
      relations: ['user', 'likes', 'likes.user'],
      order: { createdAt: 'ASC' },
    });

    return replies;
  }
}
