import { AccessService } from "../../api/src/access/service.js";
import { CurriculumService } from "../../api/src/curriculum/service.js";
import { createDatabase } from "../../api/src/db.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for Student access fixture");

const [action, targetProfileId] = process.argv.slice(2);
if (action !== "prepare-class-access" || !targetProfileId) {
  throw new Error("usage: access-fixture prepare-class-access <profile-id>");
}

const db = createDatabase(databaseUrl);

try {
  const actorRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('admin', 'Stage14 Student access fixture') returning id",
  );
  const actorId = actorRows[0]?.id;
  if (!actorId) throw new Error("failed to create Student access fixture actor");

  await db.query(
    `update student_entitlements
        set expires_at = now() - interval '1 second'
      where profile_id = $1 and scope = 'all_content' and status = 'active'`,
    [targetProfileId],
  );

  const curriculum = new CurriculumService(db);
  const classRecord = await curriculum.createClass(actorId, {
    slug: `stage14-browser-${targetProfileId.slice(0, 8)}`,
    name: "الصف التجريبي لمسار الطالب",
    description: "بيانات قبول حقيقية لمسار تفعيل كود الصف",
    position: 0,
    status: "active",
  });

  const access = new AccessService(db);
  const codes = await access.generateClassCodes(actorId, classRecord.id, 1, 30);
  const code = codes[0];
  if (!code) throw new Error("failed to generate Student class code");

  process.stdout.write(JSON.stringify({ code, classId: classRecord.id }));
} finally {
  await db.close();
}
