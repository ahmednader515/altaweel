import { PrismaClient } from "@prisma/client";

// Note: Environment variables should be loaded from .env file
// If running with ts-node, you may need to install dotenv or use a different method
// For PowerShell: $env:DATABASE_URL="..." before running

/**
 * Database Migration Script
 * Migrates all data from the old Aiven database to the new Prisma database
 * 
 * Environment Variables Required:
 * - OLD_DATABASE_URL: Connection string for the old Aiven database
 * - OLD_DIRECT_DATABASE_URL: Direct connection string for the old Aiven database (optional, falls back to OLD_DATABASE_URL)
 * - DATABASE_URL: Connection string for the new Prisma database
 * - DIRECT_DATABASE_URL: Direct connection string for the new Prisma database
 */

// Get environment variables
// IMPORTANT: OLD_DATABASE_URL must be set to the old Aiven database URL
// DATABASE_URL should point to the new Prisma database
const oldDatabaseUrl = process.env.OLD_DATABASE_URL;
const oldDirectDatabaseUrl = process.env.OLD_DIRECT_DATABASE_URL || oldDatabaseUrl;
const newDatabaseUrl = process.env.DATABASE_URL;
const newDirectDatabaseUrl = process.env.DIRECT_DATABASE_URL || newDatabaseUrl;

if (!oldDatabaseUrl) {
  throw new Error(
    "OLD_DATABASE_URL environment variable is required. " +
    "Please set it to your old Aiven database connection string. " +
    "If you've already updated DATABASE_URL to point to the new database, " +
    "you need to save the old Aiven URL as OLD_DATABASE_URL in your .env file."
  );
}

if (!newDatabaseUrl) {
  throw new Error("DATABASE_URL environment variable is required for the new Prisma database");
}

// Create Prisma clients for both databases
const oldDb = new PrismaClient({
  datasources: {
    db: { url: oldDatabaseUrl },
  },
});

const newDb = new PrismaClient({
  datasources: {
    db: { url: newDatabaseUrl },
  },
});

interface MigrationStats {
  users: number;
  courses: number;
  attachments: number;
  chapters: number;
  chapterAttachments: number;
  purchases: number;
  userProgress: number;
  balanceTransactions: number;
  quizzes: number;
  questions: number;
  quizResults: number;
  quizAnswers: number;
}

async function migrateUsers(): Promise<number> {
  console.log("📦 Migrating Users...");
  const users = await oldDb.user.findMany();
  let count = 0;

  for (const user of users) {
    try {
      await newDb.user.upsert({
        where: { id: user.id },
        update: {
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          parentPhoneNumber: user.parentPhoneNumber,
          hashedPassword: user.hashedPassword,
          image: user.image,
          role: user.role,
          balance: user.balance,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        create: {
          id: user.id,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          parentPhoneNumber: user.parentPhoneNumber,
          hashedPassword: user.hashedPassword,
          image: user.image,
          role: user.role,
          balance: user.balance,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
      count++;
    } catch (error) {
      console.error(`Error migrating user ${user.id}:`, error);
    }
  }

  console.log(`✅ Migrated ${count} users`);
  return count;
}

async function migrateCourses(): Promise<number> {
  console.log("📦 Migrating Courses...");
  const courses = await oldDb.course.findMany();
  let count = 0;

  for (const course of courses) {
    try {
      await newDb.course.upsert({
        where: { id: course.id },
        update: {
          userId: course.userId,
          title: course.title,
          description: course.description,
          imageUrl: course.imageUrl,
          price: course.price,
          isPublished: course.isPublished,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
        },
        create: {
          id: course.id,
          userId: course.userId,
          title: course.title,
          description: course.description,
          imageUrl: course.imageUrl,
          price: course.price,
          isPublished: course.isPublished,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
        },
      });
      count++;
    } catch (error) {
      console.error(`Error migrating course ${course.id}:`, error);
    }
  }

  console.log(`✅ Migrated ${count} courses`);
  return count;
}

async function migrateAttachments(): Promise<number> {
  console.log("📦 Migrating Attachments...");
  const attachments = await oldDb.attachment.findMany();
  let count = 0;

  for (const attachment of attachments) {
    try {
      await newDb.attachment.upsert({
        where: { id: attachment.id },
        update: {
          name: attachment.name,
          url: attachment.url,
          courseId: attachment.courseId,
          createdAt: attachment.createdAt,
          updatedAt: attachment.updatedAt,
        },
        create: {
          id: attachment.id,
          name: attachment.name,
          url: attachment.url,
          courseId: attachment.courseId,
          createdAt: attachment.createdAt,
          updatedAt: attachment.updatedAt,
        },
      });
      count++;
    } catch (error) {
      console.error(`Error migrating attachment ${attachment.id}:`, error);
    }
  }

  console.log(`✅ Migrated ${count} attachments`);
  return count;
}

async function migrateChapters(): Promise<number> {
  console.log("📦 Migrating Chapters...");
  const chapters = await oldDb.chapter.findMany();
  let count = 0;

  for (const chapter of chapters) {
    try {
      await newDb.chapter.upsert({
        where: { id: chapter.id },
        update: {
          title: chapter.title,
          description: chapter.description,
          videoUrl: chapter.videoUrl,
          videoType: chapter.videoType,
          youtubeVideoId: chapter.youtubeVideoId,
          documentUrl: chapter.documentUrl,
          documentName: chapter.documentName,
          position: chapter.position,
          isPublished: chapter.isPublished,
          isFree: chapter.isFree,
          courseId: chapter.courseId,
          createdAt: chapter.createdAt,
          updatedAt: chapter.updatedAt,
        },
        create: {
          id: chapter.id,
          title: chapter.title,
          description: chapter.description,
          videoUrl: chapter.videoUrl,
          videoType: chapter.videoType,
          youtubeVideoId: chapter.youtubeVideoId,
          documentUrl: chapter.documentUrl,
          documentName: chapter.documentName,
          position: chapter.position,
          isPublished: chapter.isPublished,
          isFree: chapter.isFree,
          courseId: chapter.courseId,
          createdAt: chapter.createdAt,
          updatedAt: chapter.updatedAt,
        },
      });
      count++;
    } catch (error) {
      console.error(`Error migrating chapter ${chapter.id}:`, error);
    }
  }

  console.log(`✅ Migrated ${count} chapters`);
  return count;
}

async function migrateChapterAttachments(): Promise<number> {
  console.log("📦 Migrating Chapter Attachments...");
  const chapterAttachments = await oldDb.chapterAttachment.findMany();
  let count = 0;

  for (const attachment of chapterAttachments) {
    try {
      await newDb.chapterAttachment.upsert({
        where: { id: attachment.id },
        update: {
          name: attachment.name,
          url: attachment.url,
          position: attachment.position,
          chapterId: attachment.chapterId,
          createdAt: attachment.createdAt,
          updatedAt: attachment.updatedAt,
        },
        create: {
          id: attachment.id,
          name: attachment.name,
          url: attachment.url,
          position: attachment.position,
          chapterId: attachment.chapterId,
          createdAt: attachment.createdAt,
          updatedAt: attachment.updatedAt,
        },
      });
      count++;
    } catch (error) {
      console.error(`Error migrating chapter attachment ${attachment.id}:`, error);
    }
  }

  console.log(`✅ Migrated ${count} chapter attachments`);
  return count;
}

async function migratePurchases(): Promise<number> {
  console.log("📦 Migrating Purchases...");
  const purchases = await oldDb.purchase.findMany();
  let count = 0;

  for (const purchase of purchases) {
    try {
      await newDb.purchase.upsert({
        where: { id: purchase.id },
        update: {
          userId: purchase.userId,
          courseId: purchase.courseId,
          status: purchase.status,
          createdAt: purchase.createdAt,
          updatedAt: purchase.updatedAt,
        },
        create: {
          id: purchase.id,
          userId: purchase.userId,
          courseId: purchase.courseId,
          status: purchase.status,
          createdAt: purchase.createdAt,
          updatedAt: purchase.updatedAt,
        },
      });
      count++;
    } catch (error) {
      console.error(`Error migrating purchase ${purchase.id}:`, error);
    }
  }

  console.log(`✅ Migrated ${count} purchases`);
  return count;
}

async function migrateUserProgress(): Promise<number> {
  console.log("📦 Migrating User Progress...");
  const userProgress = await oldDb.userProgress.findMany();
  let count = 0;

  for (const progress of userProgress) {
    try {
      await newDb.userProgress.upsert({
        where: {
          userId_chapterId: {
            userId: progress.userId,
            chapterId: progress.chapterId,
          },
        },
        update: {
          isCompleted: progress.isCompleted,
          createdAt: progress.createdAt,
          updatedAt: progress.updatedAt,
        },
        create: {
          id: progress.id,
          userId: progress.userId,
          chapterId: progress.chapterId,
          isCompleted: progress.isCompleted,
          createdAt: progress.createdAt,
          updatedAt: progress.updatedAt,
        },
      });
      count++;
    } catch (error) {
      console.error(`Error migrating user progress ${progress.id}:`, error);
    }
  }

  console.log(`✅ Migrated ${count} user progress records`);
  return count;
}

async function migrateBalanceTransactions(): Promise<number> {
  console.log("📦 Migrating Balance Transactions...");
  const transactions = await oldDb.balanceTransaction.findMany();
  let count = 0;

  for (const transaction of transactions) {
    try {
      await newDb.balanceTransaction.upsert({
        where: { id: transaction.id },
        update: {
          userId: transaction.userId,
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
        },
        create: {
          id: transaction.id,
          userId: transaction.userId,
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
        },
      });
      count++;
    } catch (error) {
      console.error(`Error migrating balance transaction ${transaction.id}:`, error);
    }
  }

  console.log(`✅ Migrated ${count} balance transactions`);
  return count;
}

async function migrateQuizzes(): Promise<number> {
  console.log("📦 Migrating Quizzes...");
  const quizzes = await oldDb.quiz.findMany();
  let count = 0;

  for (const quiz of quizzes) {
    try {
      await newDb.quiz.upsert({
        where: { id: quiz.id },
        update: {
          title: quiz.title,
          description: quiz.description,
          position: quiz.position,
          isPublished: quiz.isPublished,
          timer: quiz.timer,
          maxAttempts: quiz.maxAttempts,
          courseId: quiz.courseId,
          createdAt: quiz.createdAt,
          updatedAt: quiz.updatedAt,
        },
        create: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          position: quiz.position,
          isPublished: quiz.isPublished,
          timer: quiz.timer,
          maxAttempts: quiz.maxAttempts,
          courseId: quiz.courseId,
          createdAt: quiz.createdAt,
          updatedAt: quiz.updatedAt,
        },
      });
      count++;
    } catch (error) {
      console.error(`Error migrating quiz ${quiz.id}:`, error);
    }
  }

  console.log(`✅ Migrated ${count} quizzes`);
  return count;
}

async function migrateQuestions(): Promise<number> {
  console.log("📦 Migrating Questions...");
  const questions = await oldDb.question.findMany();
  let count = 0;

  for (const question of questions) {
    try {
      await newDb.question.upsert({
        where: { id: question.id },
        update: {
          text: question.text,
          type: question.type,
          options: question.options,
          correctAnswer: question.correctAnswer,
          points: question.points,
          imageUrl: question.imageUrl,
          position: question.position,
          quizId: question.quizId,
          createdAt: question.createdAt,
          updatedAt: question.updatedAt,
        },
        create: {
          id: question.id,
          text: question.text,
          type: question.type,
          options: question.options,
          correctAnswer: question.correctAnswer,
          points: question.points,
          imageUrl: question.imageUrl,
          position: question.position,
          quizId: question.quizId,
          createdAt: question.createdAt,
          updatedAt: question.updatedAt,
        },
      });
      count++;
    } catch (error) {
      console.error(`Error migrating question ${question.id}:`, error);
    }
  }

  console.log(`✅ Migrated ${count} questions`);
  return count;
}

async function migrateQuizResults(): Promise<number> {
  console.log("📦 Migrating Quiz Results...");
  const quizResults = await oldDb.quizResult.findMany();
  let count = 0;

  for (const result of quizResults) {
    try {
      await newDb.quizResult.upsert({
        where: { id: result.id },
        update: {
          studentId: result.studentId,
          quizId: result.quizId,
          score: result.score,
          totalPoints: result.totalPoints,
          percentage: result.percentage,
          attemptNumber: result.attemptNumber,
          submittedAt: result.submittedAt,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
        },
        create: {
          id: result.id,
          studentId: result.studentId,
          quizId: result.quizId,
          score: result.score,
          totalPoints: result.totalPoints,
          percentage: result.percentage,
          attemptNumber: result.attemptNumber,
          submittedAt: result.submittedAt,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
        },
      });
      count++;
    } catch (error) {
      console.error(`Error migrating quiz result ${result.id}:`, error);
    }
  }

  console.log(`✅ Migrated ${count} quiz results`);
  return count;
}

async function migrateQuizAnswers(): Promise<number> {
  console.log("📦 Migrating Quiz Answers...");
  const quizAnswers = await oldDb.quizAnswer.findMany();
  let count = 0;

  for (const answer of quizAnswers) {
    try {
      await newDb.quizAnswer.upsert({
        where: { id: answer.id },
        update: {
          questionId: answer.questionId,
          quizResultId: answer.quizResultId,
          studentAnswer: answer.studentAnswer,
          correctAnswer: answer.correctAnswer,
          isCorrect: answer.isCorrect,
          pointsEarned: answer.pointsEarned,
          createdAt: answer.createdAt,
          updatedAt: answer.updatedAt,
        },
        create: {
          id: answer.id,
          questionId: answer.questionId,
          quizResultId: answer.quizResultId,
          studentAnswer: answer.studentAnswer,
          correctAnswer: answer.correctAnswer,
          isCorrect: answer.isCorrect,
          pointsEarned: answer.pointsEarned,
          createdAt: answer.createdAt,
          updatedAt: answer.updatedAt,
        },
      });
      count++;
    } catch (error) {
      console.error(`Error migrating quiz answer ${answer.id}:`, error);
    }
  }

  console.log(`✅ Migrated ${count} quiz answers`);
  return count;
}

async function main() {
  console.log("🚀 Starting database migration...");
  console.log("📊 Old Database:", oldDatabaseUrl?.substring(0, 30) + "...");
  console.log("📊 New Database:", newDatabaseUrl?.substring(0, 30) + "...");
  console.log("");

  const stats: MigrationStats = {
    users: 0,
    courses: 0,
    attachments: 0,
    chapters: 0,
    chapterAttachments: 0,
    purchases: 0,
    userProgress: 0,
    balanceTransactions: 0,
    quizzes: 0,
    questions: 0,
    quizResults: 0,
    quizAnswers: 0,
  };

  try {
    // Test connections
    console.log("🔌 Testing database connections...");
    await oldDb.$connect();
    await newDb.$connect();
    console.log("✅ Database connections successful\n");

    // Verify new database has tables
    console.log("🔍 Verifying new database schema...");
    try {
      const userCount = await newDb.user.count();
      console.log("✅ New database schema verified (User table exists)\n");
    } catch (error: any) {
      if (error.code === "P2021" || error.message?.includes("does not exist")) {
        console.error("\n❌ Error: The new database does not have the required tables!");
        console.error("   Please run: npx prisma migrate deploy");
        console.error("   This will create all necessary tables in the new database.\n");
        throw new Error(
          "New database schema not found. Please run 'npx prisma migrate deploy' first."
        );
      }
      throw error;
    }

    // Migrate in order respecting foreign key constraints
    stats.users = await migrateUsers();
    stats.courses = await migrateCourses();
    stats.attachments = await migrateAttachments();
    stats.chapters = await migrateChapters();
    stats.chapterAttachments = await migrateChapterAttachments();
    stats.purchases = await migratePurchases();
    stats.userProgress = await migrateUserProgress();
    stats.balanceTransactions = await migrateBalanceTransactions();
    stats.quizzes = await migrateQuizzes();
    stats.questions = await migrateQuestions();
    stats.quizResults = await migrateQuizResults();
    stats.quizAnswers = await migrateQuizAnswers();

    console.log("\n" + "=".repeat(50));
    console.log("✅ Migration completed successfully!");
    console.log("=".repeat(50));
    console.log("\nMigration Statistics:");
    console.log(`  Users: ${stats.users}`);
    console.log(`  Courses: ${stats.courses}`);
    console.log(`  Attachments: ${stats.attachments}`);
    console.log(`  Chapters: ${stats.chapters}`);
    console.log(`  Chapter Attachments: ${stats.chapterAttachments}`);
    console.log(`  Purchases: ${stats.purchases}`);
    console.log(`  User Progress: ${stats.userProgress}`);
    console.log(`  Balance Transactions: ${stats.balanceTransactions}`);
    console.log(`  Quizzes: ${stats.quizzes}`);
    console.log(`  Questions: ${stats.questions}`);
    console.log(`  Quiz Results: ${stats.quizResults}`);
    console.log(`  Quiz Answers: ${stats.quizAnswers}`);
    console.log(`\n  Total Records: ${Object.values(stats).reduce((a, b) => a + b, 0)}`);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    throw error;
  } finally {
    await oldDb.$disconnect();
    await newDb.$disconnect();
    console.log("\n🔌 Database connections closed");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

