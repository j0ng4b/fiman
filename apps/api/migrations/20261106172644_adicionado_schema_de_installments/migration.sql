CREATE TYPE "installment_type" AS ENUM('I', 'E');--> statement-breakpoint
CREATE TABLE "installments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "installments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"type" "installment_type" NOT NULL,
	"description" text NOT NULL,
	"total_amout" integer NOT NULL,
	"installment_count" smallint NOT NULL,
	"first_installment_date" date NOT NULL,
	"account_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "installments" ADD CONSTRAINT "installments_account_id_accounts_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "installments" ADD CONSTRAINT "installments_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT;