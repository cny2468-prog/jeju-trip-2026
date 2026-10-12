import {sqliteTable,integer,text,primaryKey,index} from 'drizzle-orm/sqlite-core';
export const reflections=sqliteTable('reflections',{
 classNo:integer('class_no').notNull(),
 seatNo:integer('seat_no').notNull(),
 studentNo:text('student_no').notNull(),
 payload:text('payload').notNull(),
 tokenHash:text('token_hash').notNull(),
 submittedAt:text('submitted_at').notNull()
},table=>[primaryKey({columns:[table.classNo,table.seatNo]})]);
export const photoOwners=sqliteTable('photo_owners',{
 classNo:integer('class_no').notNull(),seatNo:integer('seat_no').notNull(),tokenHash:text('token_hash').notNull()
},table=>[primaryKey({columns:[table.classNo,table.seatNo]})]);
export const contestPhotos=sqliteTable('contest_photos',{
 id:text('id').primaryKey(),classNo:integer('class_no').notNull(),seatNo:integer('seat_no').notNull(),studentNo:text('student_no').notNull(),studentName:text('student_name').notNull(),spotId:text('spot_id').notNull(),spotTitle:text('spot_title').notNull(),title:text('title').notNull(),caption:text('caption').notNull(),objectKey:text('object_key').notNull(),mime:text('mime').notNull(),bytes:integer('bytes').notNull(),tokenHash:text('token_hash').notNull(),submittedAt:text('submitted_at').notNull(),selected:integer('selected').notNull().default(0)
 ,thumbnailKey:text('thumbnail_key'),thumbnailBytes:integer('thumbnail_bytes').notNull().default(0)
},table=>[index('idx_contest_spot_class').on(table.spotId,table.classNo),index('idx_contest_student_spot').on(table.classNo,table.seatNo,table.spotId)]);

// Shared upload admission slots
export const photoUploadSlots=sqliteTable('photo_upload_slots',{
 slotNo:integer('slot_no').primaryKey(),leaseKey:text('lease_key'),claimId:text('claim_id'),declaredBytes:integer('declared_bytes').notNull().default(11534336),state:text('state').notNull().default('idle'),expiresAt:integer('expires_at').notNull().default(0)
});
