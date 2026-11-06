ALTER TABLE "transactions" DROP CONSTRAINT "transactions_category_id_categories_id_fkey";--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "type" SET DATA TYPE "entry_type" USING "type"::text::"entry_type";--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_installments_uq" UNIQUE("installment_id","installment_number");--> statement-breakpoint
CREATE INDEX "transactions_account_due_date_idx" ON "transactions" ("account_id","due_date");--> statement-breakpoint
CREATE INDEX "transactions_account_transaction_date_idx" ON "transactions" ("account_id","transaction_date");--> statement-breakpoint
CREATE INDEX "transactions_account_accounting_month_idx" ON "transactions" ("account_id","accounting_month");--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_type_fk" FOREIGN KEY ("category_id","type") REFERENCES "categories"("id","type") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_amount_positive_ck" CHECK ("amount" > 0);--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_paid_amount_positive_ck" CHECK ("paid_amount" IS NULL OR "paid_amount" > 0);--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_status_fields_ck" CHECK (("status" = 'C'
                    AND "transaction_date" IS NOT NULL
                    AND "paid_amount" IS NOT NULL)
                OR ("status" <> 'C'
                    AND "transaction_date" IS NULL
                    AND "paid_amount" IS NULL)
            );--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_reversal_ck" CHECK ("reversal_date" IS NULL
                OR ("status" = 'C'
                AND "reversal_date" >= "transaction_date"));--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_accounting_month_ck" CHECK (EXTRACT(day from "accounting_month") = 1
                AND "accounting_month" <= "due_date");--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_installments_pair_ck" CHECK (("installment_id" IS NULL) = ("installment_number" IS NULL));--> statement-breakpoint
DROP TYPE "transaction_type";