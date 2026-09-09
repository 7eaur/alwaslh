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
    description: "صف مخصص لاختبار مسار الدراسة الحقيقي للطالب",
    position: 0,
    status: "active",
  });
  const subject = await curriculum.createSubject(actorId, {
    slug: `stage14-physics-${targetProfileId.slice(0, 8)}`,
    name: "الفيزياء",
    description: "مادة تجريبية مرتبة من authority المنهج",
    status: "active",
  });
  await curriculum.createOffering(actorId, {
    classId: classRecord.id,
    subjectId: subject.id,
    position: 0,
    status: "active",
  });
  const section = await curriculum.createSection(actorId, {
    classId: classRecord.id,
    subjectId: subject.id,
    slug: `stage14-motion-${targetProfileId.slice(0, 8)}`,
    title: "الحركة والقوى",
    description: "وحدة منشورة لاختبار ترتيب الدروس",
    position: 1,
    status: "active",
  });
  const introLesson = await curriculum.createLesson(actorId, {
    classId: classRecord.id,
    subjectId: subject.id,
    slug: `stage14-intro-${targetProfileId.slice(0, 8)}`,
    title: "مدخل إلى الفيزياء",
    summary: "مقدمة قصيرة قبل بدء الوحدة.",
    position: 0,
    status: "active",
  });
  const motionLesson = await curriculum.createLesson(actorId, {
    classId: classRecord.id,
    subjectId: subject.id,
    sectionId: section.id,
    slug: `stage14-motion-lesson-${targetProfileId.slice(0, 8)}`,
    title: "القوة والحركة",
    summary: "مفاهيم القوة وتأثيرها في حركة الأجسام.",
    position: 0,
    status: "active",
  });
  const newtonLesson = await curriculum.createLesson(actorId, {
    classId: classRecord.id,
    subjectId: subject.id,
    sectionId: section.id,
    slug: `stage14-newton-${targetProfileId.slice(0, 8)}`,
    title: "قوانين نيوتن",
    summary: "ترتيب القوانين الأساسية بعد درس القوة والحركة.",
    position: 1,
    status: "active",
  });
  await curriculum.createLesson(actorId, {
    classId: classRecord.id,
    subjectId: subject.id,
    sectionId: section.id,
    slug: `stage14-hidden-draft-${targetProfileId.slice(0, 8)}`,
    title: "درس غير منشور يجب ألا يظهر",
    summary: "هذا الدرس fixture سلبي فقط.",
    position: 2,
    status: "active",
  });

  await db.query(
    `update lessons
        set published_at = now() - interval '1 minute'
      where id = any($1::uuid[])`,
    [[introLesson.id, motionLesson.id, newtonLesson.id]],
  );

  const access = new AccessService(db);
  const codes = await access.generateClassCodes(actorId, classRecord.id, 1, 30);
  const code = codes[0];
  if (!code) throw new Error("failed to generate Student class code");

  process.stdout.write(
    JSON.stringify({
      code,
      classId: classRecord.id,
      className: classRecord.name,
      subjectName: subject.name,
      sectionTitle: section.title,
      lessonTitles: [introLesson.title, motionLesson.title, newtonLesson.title],
    }),
  );
} finally {
  await db.close();
}
