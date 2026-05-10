// import { Injectable } from '@nestjs/common';
// import { Cron, CronExpression } from '@nestjs/schedule';
// import { AuthService } from './auth.service';

// @Injectable()
// export class TokenCleanupService {
//   constructor(private authService: AuthService) {}

//   @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
//   async handleTokenCleanup() {
//     console.log('🧹 [CRON] Starting token cleanup...');
//     await this.authService.cleanupExpiredTokens();
//   }

//   // Optional: More frequent cleanup for very active systems
//   @Cron(CronExpression.EVERY_6_HOURS)
//   async handleFrequentCleanup() {
//     console.log('🧹 [CRON] Starting frequent token cleanup...');
//     await this.authService.cleanupExpiredTokens();
//   }
// }
