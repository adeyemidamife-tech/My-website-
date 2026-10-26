import { pgTable, text, jsonb, integer, timestamp } from 'drizzle-orm/pg-core';
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), phone: text('phone').notNull(),
  method: text('method').notNull(), address: text('address').notNull(),
  notes: text('notes').notNull(), transferReference: text('transfer_reference').notNull(),
  items: jsonb('items').$type<{name:string;price:number;quantity:number}[]>().notNull(),
  total: integer('total').notNull(),
  paymentStatus: text('payment_status').notNull().default('reported_pending_verification'),
  createdAt: timestamp('created_at', {withTimezone:true}).defaultNow().notNull(),
});
