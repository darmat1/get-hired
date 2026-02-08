-- Add language column to Resume
ALTER TABLE "Resume" ADD COLUMN "language" TEXT NOT NULL DEFAULT 'en';
