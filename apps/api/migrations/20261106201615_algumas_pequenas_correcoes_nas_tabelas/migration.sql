ALTER TABLE "installments" RENAME COLUMN "total_amout" TO "total_amount";--> statement-breakpoint
ALTER TABLE "transactions" RENAME COLUMN "paid_amout" TO "paid_amount";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;