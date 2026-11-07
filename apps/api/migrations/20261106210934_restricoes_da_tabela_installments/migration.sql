ALTER TYPE "category_type" RENAME TO "entry_type";--> statement-breakpoint
ALTER TABLE "installments" DROP CONSTRAINT "installments_category_id_categories_id_fkey";--> statement-breakpoint
ALTER TABLE "installments" ALTER COLUMN "type" SET DATA TYPE "entry_type" USING "type"::text::"entry_type";--> statement-breakpoint
ALTER TABLE "installments" ADD CONSTRAINT "installments_category_type_fk" FOREIGN KEY ("category_id","type") REFERENCES "categories"("id","type") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "installments" ADD CONSTRAINT "installments_count_min_ck" CHECK ("installment_count" >= 1);--> statement-breakpoint
ALTER TABLE "installments" ADD CONSTRAINT "installments_total_amount_positive_ck" CHECK ("total_amount" > 0);--> statement-breakpoint
DROP TYPE "installment_type";