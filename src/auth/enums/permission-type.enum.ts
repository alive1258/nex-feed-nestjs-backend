export enum Permission {
  /* =========================
     AWS IAM–style mental models
     User Management 
  ========================= */
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_MANAGE = 'user:*',

  POSTS_CREATE = 'posts:create',
  POSTS_VIEW = 'posts:view',
  POSTS_UPDATE = 'posts:update',
  POSTS_DELETE = 'posts:delete',

  POSTS_LIKE = 'posts:like',
  POSTS_COMMENT = 'posts:comment',
  POSTS_REPLY = 'posts:reply',

  /* =========================
     Profile
  ========================= */
  PROFILE_READ = 'profile:read',
  PROFILE_UPDATE = 'profile:update',
}
