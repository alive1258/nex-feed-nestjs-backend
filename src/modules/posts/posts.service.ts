import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post, PostPrivacy } from './entities/post.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { FileUploadsService } from 'src/common/file-uploads/file-uploads.service';
import { DataQueryService } from 'src/common/data-query/data-query.service';
import { Request } from 'express';
import { MulterFile } from 'src/common/types/file.types';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly fileUploadsService: FileUploadsService,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /**
   * Create a new post
   */
  async create(
    req: Request,
    createPostDto: CreatePostDto,
    file?: MulterFile,
  ): Promise<Post> {
    const userId = req?.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Authentication required.');
    }

    // Trim content
    createPostDto.content = createPostDto.content.trim();

    // Handle optional file upload
    let imageUrl: string | undefined;
    if (file) {
      const uploadedFiles = await this.fileUploadsService.fileUploads([file]);
      imageUrl = uploadedFiles[0];
    }

    // Set default privacy if not provided
    const privacy = createPostDto.privacy || PostPrivacy.PUBLIC;

    const newPost = this.postRepository.create({
      content: createPostDto.content,
      privacy,
      image: imageUrl,
      userId: String(userId),
    });

    return this.postRepository.save(newPost);
  }

  /**
   * Get feed posts (public + user's private posts)
   */
  async findAll(
    req: Request,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ posts: Post[]; total: number }> {
    const userId = req?.user?.sub;
    const skip = (page - 1) * limit;

    // Build query conditions
    let whereConditions: FindOptionsWhere<Post>[] = [
      { privacy: PostPrivacy.PUBLIC },
    ];

    // If user is authenticated, include their private posts
    if (userId) {
      whereConditions.push({
        privacy: PostPrivacy.PRIVATE,
        userId: String(userId),
      });
    }

    const [posts, total] = await this.postRepository.findAndCount({
      where: whereConditions,
      relations: ['user', 'comments', 'likes'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { posts, total };
  }

  /**
   * Find one post by ID
   */
  async findOne(id: string, req: Request): Promise<Post> {
    const userId = req?.user?.sub;

    const post = await this.postRepository.findOne({
      where: { id },
      relations: [
        'user',
        'comments',
        'comments.user',
        'comments.likes',
        'likes',
        'likes.user',
      ],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Check privacy: if private and user is not the author, deny access
    if (
      post.privacy === PostPrivacy.PRIVATE &&
      (!userId || post.userId !== userId)
    ) {
      throw new ForbiddenException(
        'You do not have permission to view this private post',
      );
    }

    return post;
  }

  /**
   * Update a post
   */
  async update(
    id: string,
    req: Request,
    updatePostDto: UpdatePostDto,
    file?: MulterFile,
  ): Promise<Post> {
    const userId = req?.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Authentication required.');
    }

    // Find the post
    const post = await this.findOne(id, req);

    // Check ownership
    if (post.userId !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    // Handle new file upload if provided
    let imageUrl: string | undefined = post.image;
    if (file) {
      const uploadedFiles = await this.fileUploadsService.fileUploads([file]);
      imageUrl = uploadedFiles[0];
    } else if (updatePostDto.content === undefined && file === undefined) {
      // If no new image and content is not being updated, keep existing
      imageUrl = post.image;
    }

    // Update post
    Object.assign(post, {
      ...(updatePostDto.content && { content: updatePostDto.content.trim() }),
      ...(updatePostDto.privacy && { privacy: updatePostDto.privacy }),
      ...(file && { image: imageUrl }),
    });

    return this.postRepository.save(post);
  }

  /**
   * Remove a post
   */
  async remove(id: string, req: Request): Promise<{ message: string }> {
    const userId = req?.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Authentication required.');
    }

    const post = await this.findOne(id, req);

    // Check ownership
    if (post.userId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postRepository.remove(post);
    return { message: `Post with ID ${id} has been deleted successfully` };
  }

  /**
   * Get posts by user ID
   */
  async findByUser(
    userId: string,
    req: Request,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ posts: Post[]; total: number }> {
    const currentUserId = req?.user?.sub;
    const skip = (page - 1) * limit;

    let whereConditions: FindOptionsWhere<Post> = { userId };

    // If current user is not the owner, only show public posts
    if (currentUserId !== userId) {
      whereConditions = { userId, privacy: PostPrivacy.PUBLIC };
    }

    const [posts, total] = await this.postRepository.findAndCount({
      where: whereConditions,
      relations: ['user', 'comments', 'likes'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { posts, total };
  }

  /**
   * Get post with like status for current user
   */
  async getPostWithLikeStatus(id: string, req: Request): Promise<any> {
    const post = await this.findOne(id, req);
    const userId = req?.user?.sub;

    let isLiked = false;
    if (userId && post.likes) {
      isLiked = post.likes.some((like) => like.userId === userId);
    }

    return {
      ...post,
      likeCount: post.likes?.length || 0,
      commentCount: post.comments?.length || 0,
      isLikedByCurrentUser: isLiked,
    };
  }
}
