import { column, defineDb, defineTable } from "astro:db";

const DailyChallengeRecord = defineTable({
	columns: {
		date: column.date({ unique: true }),
		id: column.number({
			primaryKey: true,
			references: () => ChallengeRecord.columns.id,
		}),
	},
});

const ChallengeRecord = defineTable({
	columns: {
		title: column.text(),
		encodedTitle: column.text(),
		id: column.number({ primaryKey: true, autoIncrement: true }),
	},
});

const HintsRecord = defineTable({
	columns: {
		id: column.number({
			references: () => ChallengeRecord.columns.id,
		}),
		hint: column.text({ multiline: true }),
		hintId: column.number({ primaryKey: true, autoIncrement: true }),
	},
});

// https://astro.build/db/config
export default defineDb({
	tables: {
		DailyChallengeRecord,
		ChallengeRecord,
		HintsRecord,
	},
});
