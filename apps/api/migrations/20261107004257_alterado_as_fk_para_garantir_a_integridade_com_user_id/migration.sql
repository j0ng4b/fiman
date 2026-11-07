ALTER TABLE "installments" DROP CONSTRAINT "installments_account_id_accounts_id_fkey";--> statement-breakpoint
ALTER TABLE "installments" DROP CONSTRAINT "installments_category_type_fk";--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_account_id_accounts_id_fkey";--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_installment_id_installments_id_fkey";--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_category_type_fk";--> statement-breakpoint

ALTER TABLE "installments" ADD CONSTRAINT "installments_id_user_uq" UNIQUE("id","user_id");--> statement-breakpoint

ALTER TABLE "categories" DROP CONSTRAINT "categories_id_type_uq";--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_id_user_type_uq" UNIQUE("id","user_id","type");--> statement-breakpoint

ALTER TABLE "installments" ADD CONSTRAINT "installments_account_user_fk" FOREIGN KEY ("account_id","user_id") REFERENCES "accounts"("id","user_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "installments" ADD CONSTRAINT "installments_category_user_type_fk" FOREIGN KEY ("category_id","user_id","type") REFERENCES "categories"("id","user_id","type") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_user_fk" FOREIGN KEY ("account_id","user_id") REFERENCES "accounts"("id","user_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_user_type_fk" FOREIGN KEY ("category_id","user_id","type") REFERENCES "categories"("id","user_id","type") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_installment_user_fk" FOREIGN KEY ("installment_id","user_id") REFERENCES "installments"("id","user_id") ON DELETE RESTRICT;
