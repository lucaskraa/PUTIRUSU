const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = Number(process.env.PORT || 3000);
const SESSION_DAYS = 30;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const pool = new Pool({
connectionString: process.env.DATABASE_URL,
ssl:
IS_PRODUCTION && process.env.DATABASE_SSL !== "false"
? { rejectUnauthorized: false }
: false,
});

app.disable("x-powered-by");

app.use(
cors({
origin: true,
credentials: true,
methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
allowedHeaders: [
"Content-Type",
"Authorization",
"X-Requested-With",
],
}),
);

app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true, limit: "12mb" }));

app.use(express.static(path.join(__dirname)));

function normalizeEmail(value) {
return String(value || "").trim().toLowerCase();
}

function normalizeText(value) {
return String(value || "")
.trim()
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g, "");
}

function createToken() {
return crypto.randomBytes(48).toString("hex");
}

function hashToken(token) {
return crypto.createHash("sha256").update(token).digest("hex");
}

function randomId() {
return crypto.randomUUID();
}

function clamp(value, minimum, maximum) {
const number = Number(value);

if (!Number.isFinite(number)) {
return minimum;
}

return Math.min(Math.max(number, minimum), maximum);
}

function safeInteger(value, fallback = 0) {
const number = Number.parseInt(value, 10);

if (!Number.isFinite(number)) {
return fallback;
}

return number;
}

function safeNumber(value, fallback = 0) {
const number = Number(value);

if (!Number.isFinite(number)) {
return fallback;
}

return number;
}

function todayISO() {
return new Date().toISOString().slice(0, 10);
}

function dateToISO(date) {
return new Date(date).toISOString().slice(0, 10);
}

function addDays(date, days) {
const result = new Date(date);
result.setDate(result.getDate() + days);
return result;
}

function sanitizeName(value) {
return String(value || "")
.replace(/[<>]/g, "")
.replace(/\s+/g, " ")
.trim()
.slice(0, 120);
}

function sanitizeShortText(value, maximum = 300) {
return String(value || "")
.replace(/[<>]/g, "")
.trim()
.slice(0, maximum);
}

function isValidEmail(email) {
return /^[^\s@]+@[^\s@]+.[^\s@]+$/.test(email);
}

function isStrongEnoughPassword(password) {
const value = String(password || "");

return value.length >= 6 && value.length <= 128;
}

function getBearerToken(request) {
const authorization = request.headers.authorization || "";

if (!authorization.startsWith("Bearer ")) {
return null;
}

return authorization.slice(7).trim();
}

function sendSuccess(response, data = {}, status = 200) {
return response.status(status).json({
success: true,
...data,
});
}

function sendError(response, message, status = 400, details = null) {
return response.status(status).json({
success: false,
message,
details,
});
}

async function query(text, values = []) {
return pool.query(text, values);
}

async function transaction(callback) {
const client = await pool.connect();

try {
await client.query("BEGIN");

```
const result = await callback(client);

await client.query("COMMIT");

return result;
```

} catch (error) {
await client.query("ROLLBACK");
throw error;
} finally {
client.release();
}
}

async function ensureDatabaseConnection() {
try {
await query("SELECT NOW()");
console.log("Banco de dados conectado.");
} catch (error) {
console.error("Não foi possível conectar ao PostgreSQL.");
console.error(error.message);
}
}

async function createSession(userId, request) {
const token = createToken();
const tokenHash = hashToken(token);
const expiresAt = addDays(new Date(), SESSION_DAYS);

const deviceName = sanitizeShortText(
request.headers["user-agent"] || "Dispositivo desconhecido",
150,
);

const ipAddress =
request.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
request.socket.remoteAddress ||
null;

await query(
`       INSERT INTO user_sessions (
        user_id,
        token_hash,
        device_name,
        ip_address,
        expires_at
      )
      VALUES ($1, $2, $3, $4, $5)
    `,
[userId, tokenHash, deviceName, ipAddress, expiresAt],
);

return {
token,
expiresAt,
};
}

async function revokeSession(token) {
if (!token) {
return;
}

await query(
`       UPDATE user_sessions
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE token_hash = $1
    `,
[hashToken(token)],
);
}

async function removeExpiredSessions() {
await query(
`       DELETE FROM user_sessions
      WHERE expires_at < CURRENT_TIMESTAMP
      OR revoked_at IS NOT NULL
    `,
);
}

async function authMiddleware(request, response, next) {
try {
const token = getBearerToken(request);

```
if (!token) {
  return sendError(response, "Sessão não encontrada.", 401);
}

const tokenHash = hashToken(token);

const result = await query(
  `
    SELECT
      u.id,
      u.name,
      u.email,
      u.role,
      u.account_status,
      u.email_verified,
      u.onboarding_completed,
      s.id AS session_id,
      s.expires_at
    FROM user_sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = $1
    AND s.revoked_at IS NULL
    AND s.expires_at > CURRENT_TIMESTAMP
    LIMIT 1
  `,
  [tokenHash],
);

if (!result.rows.length) {
  return sendError(response, "Sua sessão expirou. Entre novamente.", 401);
}

const user = result.rows[0];

if (user.account_status !== "active") {
  return sendError(response, "Esta conta não está ativa.", 403);
}

request.authToken = token;
request.user = user;

return next();
```

} catch (error) {
console.error(error);
return sendError(response, "Erro ao validar sua sessão.", 500);
}
}

async function optionalAuthMiddleware(request, response, next) {
const token = getBearerToken(request);

if (!token) {
request.user = null;
return next();
}

return authMiddleware(request, response, next);
}

async function adminMiddleware(request, response, next) {
if (!request.user || request.user.role !== "admin") {
return sendError(response, "Acesso permitido somente para administradores.", 403);
}

return next();
}

async function getFullUser(userId) {
const result = await query(
`       SELECT
        u.id,
        u.name,
        u.email,
        u.avatar_url,
        u.role,
        u.email_verified,
        u.onboarding_completed,
        u.last_login_at,
        u.created_at,
        p.reason_to_learn,
        p.current_level,
        p.daily_goal_minutes,
        p.preferred_study_time,
        p.native_language,
        p.knows_cyrillic,
        p.primary_focus,
        p.interests,
        p.timezone,
        p.biography,
        pref.sound_enabled,
        pref.music_enabled,
        pref.microphone_enabled,
        pref.notifications_enabled,
        pref.daily_reminder_enabled,
        pref.dark_mode,
        pref.reduced_motion,
        pref.left_handed_mode,
        pref.transliteration_enabled,
        pref.auto_play_audio,
        pref.interface_language,
        pref.speech_rate,
        stats.total_xp,
        stats.current_streak,
        stats.longest_streak,
        stats.activities_completed,
        stats.units_completed,
        stats.lessons_completed,
        stats.exams_completed,
        stats.games_played,
        stats.words_learned,
        stats.letters_learned,
        stats.minutes_studied,
        stats.last_study_date
      FROM users u
      LEFT JOIN user_profiles p ON p.user_id = u.id
      LEFT JOIN user_preferences pref ON pref.user_id = u.id
      LEFT JOIN user_stats stats ON stats.user_id = u.id
      WHERE u.id = $1
      LIMIT 1
    `,
[userId],
);

return result.rows[0] || null;
}

async function ensureUserRelatedRows(client, userId) {
await client.query(
`       INSERT INTO user_profiles (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO NOTHING
    `,
[userId],
);

await client.query(
`       INSERT INTO user_preferences (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO NOTHING
    `,
[userId],
);

await client.query(
`       INSERT INTO user_stats (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO NOTHING
    `,
[userId],
);
}

async function initializeCourseProgress(client, userId) {
const units = await client.query(
`       SELECT
        cu.id,
        cu.display_order,
        cl.display_order AS level_order
      FROM course_units cu
      JOIN course_levels cl ON cl.id = cu.level_id
      WHERE cu.is_published = TRUE
      ORDER BY cl.display_order, cu.display_order
    `,
);

let firstUnit = true;

for (const unit of units.rows) {
await client.query(
`         INSERT INTO user_unit_progress (
          user_id,
          unit_id,
          status,
          progress_percent
        )
        VALUES ($1, $2, $3, 0)
        ON CONFLICT (user_id, unit_id) DO NOTHING
      `,
[userId, unit.id, firstUnit ? "available" : "locked"],
);

```
firstUnit = false;
```

}
}

async function updateStreak(client, userId) {
const result = await client.query(
`       SELECT
        current_streak,
        longest_streak,
        last_study_date
      FROM user_stats
      WHERE user_id = $1
      FOR UPDATE
    `,
[userId],
);

if (!result.rows.length) {
return;
}

const stats = result.rows[0];
const today = todayISO();
const yesterday = dateToISO(addDays(new Date(), -1));

let currentStreak = safeInteger(stats.current_streak, 0);
let longestStreak = safeInteger(stats.longest_streak, 0);

if (!stats.last_study_date) {
currentStreak = 1;
} else {
const lastStudyDate = dateToISO(stats.last_study_date);

```
if (lastStudyDate === today) {
  return;
}

if (lastStudyDate === yesterday) {
  currentStreak += 1;
} else {
  currentStreak = 1;
}
```

}

longestStreak = Math.max(longestStreak, currentStreak);

await client.query(
`       UPDATE user_stats
      SET
        current_streak = $2,
        longest_streak = $3,
        last_study_date = CURRENT_DATE,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
    `,
[userId, currentStreak, longestStreak],
);
}

function compareAnswer(submittedAnswer, expectedAnswer, acceptedAnswers = []) {
const submitted = normalizeText(submittedAnswer);

const answers = [expectedAnswer, ...acceptedAnswers]
.filter(Boolean)
.map(normalizeText);

if (!submitted || !answers.length) {
return false;
}

return answers.includes(submitted);
}

function calculateTextSimilarity(firstText, secondText) {
const first = normalizeText(firstText);
const second = normalizeText(secondText);

if (!first || !second) {
return 0;
}

if (first === second) {
return 100;
}

const firstWords = first.split(/\s+/);
const secondWords = second.split(/\s+/);

let matches = 0;

for (const word of firstWords) {
if (secondWords.includes(word)) {
matches += 1;
}
}

const wordScore =
(matches / Math.max(firstWords.length, secondWords.length)) * 100;

let characterMatches = 0;
const maximumLength = Math.max(first.length, second.length);

for (let index = 0; index < maximumLength; index += 1) {
if (first[index] === second[index]) {
characterMatches += 1;
}
}

const characterScore = (characterMatches / maximumLength) * 100;

return Math.round(wordScore * 0.65 + characterScore * 0.35);
}

async function getFirstAvailableUnit(userId) {
const result = await query(
`       SELECT
        cu.id,
        cu.title,
        cu.subtitle,
        cu.display_order,
        cl.code AS level_code,
        up.status,
        up.progress_percent,
        up.last_accessed_at
      FROM user_unit_progress up
      JOIN course_units cu ON cu.id = up.unit_id
      JOIN course_levels cl ON cl.id = cu.level_id
      WHERE up.user_id = $1
      AND up.status IN ('available', 'in_progress')
      ORDER BY
        up.last_accessed_at DESC NULLS LAST,
        cl.display_order,
        cu.display_order
      LIMIT 1
    `,
[userId],
);

return result.rows[0] || null;
}

async function getFirstAvailableActivity(userId, unitId) {
const result = await query(
`       SELECT
        a.id,
        a.lesson_id,
        a.activity_type,
        a.display_order,
        l.title AS lesson_title,
        l.display_order AS lesson_order,
        COALESCE(ap.status, 'available') AS status
      FROM activities a
      JOIN course_lessons l ON l.id = a.lesson_id
      LEFT JOIN user_activity_progress ap
        ON ap.activity_id = a.id
        AND ap.user_id = $1
      WHERE l.unit_id = $2
      AND a.is_published = TRUE
      AND l.is_published = TRUE
      AND COALESCE(ap.completed, FALSE) = FALSE
      ORDER BY l.display_order, a.display_order
      LIMIT 1
    `,
[userId, unitId],
);

return result.rows[0] || null;
}

async function refreshLessonProgress(client, userId, lessonId) {
const result = await client.query(
`       SELECT
        COUNT(a.id)::INTEGER AS total,
        COUNT(ap.id) FILTER (WHERE ap.completed = TRUE)::INTEGER AS completed,
        COALESCE(SUM(ap.xp_earned), 0)::INTEGER AS xp
      FROM activities a
      LEFT JOIN user_activity_progress ap
        ON ap.activity_id = a.id
        AND ap.user_id = $1
      WHERE a.lesson_id = $2
      AND a.is_published = TRUE
    `,
[userId, lessonId],
);

const row = result.rows[0];
const total = safeInteger(row.total, 0);
const completed = safeInteger(row.completed, 0);
const progressPercent = total > 0 ? (completed / total) * 100 : 0;
const completedLesson = total > 0 && completed >= total;

await client.query(
`       INSERT INTO user_lesson_progress (
        user_id,
        lesson_id,
        status,
        activities_completed,
        progress_percent,
        total_xp_earned,
        started_at,
        completed_at,
        last_accessed_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        CURRENT_TIMESTAMP,
        CASE WHEN $7 THEN CURRENT_TIMESTAMP ELSE NULL END,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (user_id, lesson_id)
      DO UPDATE SET
        status = EXCLUDED.status,
        activities_completed = EXCLUDED.activities_completed,
        progress_percent = EXCLUDED.progress_percent,
        total_xp_earned = EXCLUDED.total_xp_earned,
        completed_at = CASE
          WHEN $7 THEN COALESCE(
            user_lesson_progress.completed_at,
            CURRENT_TIMESTAMP
          )
          ELSE user_lesson_progress.completed_at
        END,
        last_accessed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    `,
[
userId,
lessonId,
completedLesson ? "completed" : "in_progress",
completed,
progressPercent,
safeInteger(row.xp, 0),
completedLesson,
],
);

return {
total,
completed,
progressPercent,
completedLesson,
};
}

async function refreshUnitProgress(client, userId, unitId) {
const result = await client.query(
`       SELECT
        COUNT(a.id)::INTEGER AS total_activities,
        COUNT(ap.id) FILTER (WHERE ap.completed = TRUE)::INTEGER AS completed_activities,
        COUNT(DISTINCT l.id)::INTEGER AS total_lessons,
        COUNT(DISTINCT lp.lesson_id)
          FILTER (WHERE lp.status = 'completed')::INTEGER AS completed_lessons,
        COALESCE(SUM(ap.xp_earned), 0)::INTEGER AS xp
      FROM course_lessons l
      JOIN activities a ON a.lesson_id = l.id
      LEFT JOIN user_activity_progress ap
        ON ap.activity_id = a.id
        AND ap.user_id = $1
      LEFT JOIN user_lesson_progress lp
        ON lp.lesson_id = l.id
        AND lp.user_id = $1
      WHERE l.unit_id = $2
      AND l.is_published = TRUE
      AND a.is_published = TRUE
    `,
[userId, unitId],
);

const requirementResult = await client.query(
`       SELECT minimum_activities_to_complete
      FROM course_units
      WHERE id = $1
    `,
[unitId],
);

const row = result.rows[0];

const totalActivities = safeInteger(row.total_activities, 0);
const completedActivities = safeInteger(row.completed_activities, 0);
const totalLessons = safeInteger(row.total_lessons, 0);
const completedLessons = safeInteger(row.completed_lessons, 0);

const minimumActivities = safeInteger(
requirementResult.rows[0]?.minimum_activities_to_complete,
totalActivities,
);

const requiredAmount = Math.min(
Math.max(minimumActivities, 1),
Math.max(totalActivities, 1),
);

const progressPercent =
totalActivities > 0
? Math.min((completedActivities / requiredAmount) * 100, 100)
: 0;

const completedUnit =
totalActivities > 0 && completedActivities >= requiredAmount;

await client.query(
`       UPDATE user_unit_progress
      SET
        status = $3,
        activities_completed = $4,
        lessons_completed = $5,
        progress_percent = $6,
        total_xp_earned = $7,
        started_at = COALESCE(started_at, CURRENT_TIMESTAMP),
        completed_at = CASE
          WHEN $8 THEN COALESCE(completed_at, CURRENT_TIMESTAMP)
          ELSE completed_at
        END,
        last_accessed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      AND unit_id = $2
    `,
[
userId,
unitId,
completedUnit ? "completed" : "in_progress",
completedActivities,
completedLessons,
progressPercent,
safeInteger(row.xp, 0),
completedUnit,
],
);

if (completedUnit) {
const nextUnit = await client.query(
`         SELECT next_unit.id
        FROM course_units current_unit
        JOIN course_levels current_level
          ON current_level.id = current_unit.level_id
        JOIN course_units next_unit
          ON (
            next_unit.level_id = current_unit.level_id
            AND next_unit.display_order = current_unit.display_order + 1
          )
          OR (
            next_unit.display_order = 1
            AND next_unit.level_id = (
              SELECT id
              FROM course_levels
              WHERE display_order = current_level.display_order + 1
              LIMIT 1
            )
          )
        WHERE current_unit.id = $1
        ORDER BY next_unit.display_order
        LIMIT 1
      `,
[unitId],
);

```
if (nextUnit.rows.length) {
  await client.query(
    `
      INSERT INTO user_unit_progress (
        user_id,
        unit_id,
        status,
        progress_percent
      )
      VALUES ($1, $2, 'available', 0)
      ON CONFLICT (user_id, unit_id)
      DO UPDATE SET
        status = CASE
          WHEN user_unit_progress.status = 'locked'
          THEN 'available'
          ELSE user_unit_progress.status
        END,
        updated_at = CURRENT_TIMESTAMP
    `,
    [userId, nextUnit.rows[0].id],
  );
}
```

}

return {
totalActivities,
completedActivities,
totalLessons,
completedLessons,
progressPercent,
completedUnit,
};
}

async function updateDailyMissionProgress(
client,
userId,
missionType,
increment = 1,
) {
await client.query(
`       UPDATE user_daily_missions udm
      SET
        current_amount = LEAST(
          udm.current_amount + $3,
          udm.target_amount
        ),
        completed = (
          udm.current_amount + $3 >= udm.target_amount
        ),
        completed_at = CASE
          WHEN udm.current_amount + $3 >= udm.target_amount
          THEN COALESCE(udm.completed_at, CURRENT_TIMESTAMP)
          ELSE udm.completed_at
        END
      FROM mission_templates mt
      WHERE udm.mission_template_id = mt.id
      AND udm.user_id = $1
      AND udm.mission_date = CURRENT_DATE
      AND mt.mission_type = $2
    `,
[userId, missionType, increment],
);
}

async function createDailyMissions(userId) {
const existing = await query(
`       SELECT COUNT(*)::INTEGER AS amount
      FROM user_daily_missions
      WHERE user_id = $1
      AND mission_date = CURRENT_DATE
    `,
[userId],
);

if (safeInteger(existing.rows[0].amount, 0) >= 3) {
return;
}

const templates = await query(
`       SELECT
        id,
        title,
        description,
        target_amount,
        xp_reward
      FROM mission_templates
      WHERE is_active = TRUE
      ORDER BY RANDOM()
      LIMIT 3
    `,
);

for (const mission of templates.rows) {
await query(
`         INSERT INTO user_daily_missions (
          user_id,
          mission_template_id,
          mission_date,
          title,
          description,
          target_amount,
          xp_reward
        )
        VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6)
        ON CONFLICT (user_id, mission_date, title)
        DO NOTHING
      `,
[
userId,
mission.id,
mission.title,
mission.description,
mission.target_amount,
mission.xp_reward,
],
);
}
}

async function checkAchievements(client, userId) {
const statsResult = await client.query(
`       SELECT *
      FROM user_stats
      WHERE user_id = $1
    `,
[userId],
);

if (!statsResult.rows.length) {
return [];
}

const stats = statsResult.rows[0];

const achievements = await client.query(
`       SELECT *
      FROM achievements
      ORDER BY requirement_value
    `,
);

const unlocked = [];

for (const achievement of achievements.rows) {
const currentValue = safeInteger(
stats[achievement.requirement_type],
0,
);

```
if (currentValue < achievement.requirement_value) {
  continue;
}

const result = await client.query(
  `
    INSERT INTO user_achievements (
      user_id,
      achievement_id
    )
    VALUES ($1, $2)
    ON CONFLICT (user_id, achievement_id)
    DO NOTHING
    RETURNING *
  `,
  [userId, achievement.id],
);

if (result.rows.length) {
  unlocked.push({
    ...achievement,
    unlocked_at: result.rows[0].unlocked_at,
  });

  await client.query(
    `
      UPDATE user_stats
      SET
        total_xp = total_xp + $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
    `,
    [userId, achievement.xp_reward],
  );
}
```

}

return unlocked;
}

function buildLocalTeacherResponse({
message,
mode,
level,
userName,
}) {
const text = String(message || "").trim();
const normalized = normalizeText(text);

if (!text) {
return {
answer: "Escreva uma pergunta para eu ajudar com seu russo.",
examples: [],
corrections: [],
exercise: null,
};
}

const translations = {
"oi": {
russian: "Привет!",
transliteration: "Privet!",
explanation: "Forma informal de dizer oi.",
},
"ola": {
russian: "Здравствуйте!",
transliteration: "Zdravstvuyte!",
explanation: "Forma formal e educada de dizer olá.",
},
"bom dia": {
russian: "Доброе утро!",
transliteration: "Dobroye utro!",
explanation: "Usado durante a manhã.",
},
"boa tarde": {
russian: "Добрый день!",
transliteration: "Dobryy den!",
explanation: "Cumprimento usado durante o dia.",
},
"boa noite": {
russian: "Добрый вечер!",
transliteration: "Dobryy vecher!",
explanation: "Cumprimento usado no período da noite.",
},
"obrigado": {
russian: "Спасибо!",
transliteration: "Spasibo!",
explanation: "Obrigado ou obrigada em russo.",
},
"por favor": {
russian: "Пожалуйста.",
transliteration: "Pozhaluysta.",
explanation: "Pode significar por favor ou de nada.",
},
"meu nome e lucas": {
russian: "Меня зовут Лукас.",
transliteration: "Menya zovut Lukas.",
explanation: "Literalmente: chamam-me Lucas.",
},
"eu sou brasileiro": {
russian: "Я бразилец.",
transliteration: "Ya brazilets.",
explanation: "Forma masculina de dizer que é brasileiro.",
},
"eu sou brasileira": {
russian: "Я бразильянка.",
transliteration: "Ya brazilyanka.",
explanation: "Forma feminina de dizer que é brasileira.",
},
"eu te amo": {
russian: "Я тебя люблю.",
transliteration: "Ya tebya lyublyu.",
explanation: "Ordem literal: eu você amo.",
},
"como voce esta": {
russian: "Как ты?",
transliteration: "Kak ty?",
explanation: "Forma informal de perguntar como alguém está.",
},
"onde fica o banheiro": {
russian: "Где находится туалет?",
transliteration: "Gde nakhoditsya tualet?",
explanation: "Frase útil para viagens.",
},
};

if (mode === "translate" || normalized.startsWith("traduza")) {
const cleaned = normalized
.replace(/^traduza\s*/, "")
.replace(/^para russo\s*/, "")
.trim();

```
const direct = translations[cleaned] || translations[normalized];

if (direct) {
  return {
    answer:
      `${direct.russian}\n\n` +
      `Transliteração: ${direct.transliteration}\n\n` +
      direct.explanation,
    examples: [direct.russian],
    corrections: [],
    exercise: {
      instruction: "Repita a frase em voz alta.",
      expected_answer: direct.russian,
    },
  };
}

return {
  answer:
    "Ainda não reconheci essa frase no tradutor local. " +
    "Posso explicar as palavras separadamente ou usar uma integração de IA configurada no servidor.",
  examples: [],
  corrections: [],
  exercise: {
    instruction: "Tente escrever uma frase mais curta.",
    expected_answer: null,
  },
};
```

}

if (
normalized.includes("alfabeto") ||
normalized.includes("cirilico")
) {
return {
answer:
"O alfabeto russo possui 33 letras. Comece separando-as em três grupos: " +
"letras parecidas com o português, letras com formato conhecido mas som diferente " +
"e letras completamente novas. Pratique primeiro А, К, М, О e Т.",
examples: [
"А — арбуз",
"К — кот",
"М — мама",
"О — окно",
"Т — торт",
],
corrections: [],
exercise: {
instruction: "Qual dessas letras possui som de N: Н, Р ou С?",
expected_answer: "Н",
},
};
}

if (
normalized.includes("cursiva") ||
normalized.includes("escrever")
) {
return {
answer:
"Na cursiva russa, algumas letras mudam bastante. A letra д minúscula pode lembrar um g latino, " +
"e a letra т minúscula pode lembrar um m. Pratique devagar, mantendo as ligações entre as letras.",
examples: [
"мама",
"привет",
"Россия",
"Москва",
],
corrections: [],
exercise: {
instruction: "Copie três vezes a palavra привет.",
expected_answer: "привет",
},
};
}

if (
normalized.includes("pronuncia") ||
normalized.includes("falar")
) {
return {
answer:
"Para melhorar a pronúncia, escute uma frase curta, repita lentamente e depois fale na velocidade normal. " +
"Preste atenção ao acento tônico, porque as vogais sem acento podem mudar de som.",
examples: [
"Спасибо — spa-SÍ-ba",
"Хорошо — kha-ra-SHÔ",
"Молоко — ma-la-KÔ",
],
corrections: [],
exercise: {
instruction: "Fale lentamente: Спасибо за помощь.",
expected_answer: "Спасибо за помощь.",
},
};
}

if (mode === "correct") {
return {
answer:
"Envie uma frase em russo e eu analisarei a ordem das palavras, as terminações e a concordância. " +
"Também mostrarei uma versão corrigida e explicarei cada alteração.",
examples: [
"Я живу в Бразилии.",
"Меня зовут Лукас.",
],
corrections: [],
exercise: {
instruction: "Escreva uma frase usando Я.",
expected_answer: null,
},
};
}

return {
answer:
`Olá, ${userName || "aluno"}! Vou explicar no nível ${level || "A1"}. ` +
"Posso ajudar com tradução, gramática, pronúncia, cursiva, vocabulário ou criar um exercício. " +
"Escreva uma frase específica para receber uma explicação detalhada.",
examples: [
"Меня зовут...",
"Я живу в...",
"Я люблю...",
],
corrections: [],
exercise: {
instruction: "Complete: Меня зовут ...",
expected_answer: null,
},
};
}

async function callExternalTeacher({
messages,
mode,
level,
}) {
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
return null;
}

const systemPrompt = `
Você é o professor virtual do aplicativo PUTIRUSU.
Ensine russo para um aluno brasileiro.
Nível atual: ${level || "A1"}.
Modo solicitado: ${mode || "general"}.

Regras:

* Responda em português, usando russo quando necessário.
* Sempre mostre transliteração em frases para iniciantes.
* Corrija erros de modo claro e respeitoso.
* Não invente regras gramaticais.
* Dê no máximo três exemplos por resposta.
* Termine com um pequeno exercício.
* Não responda de forma genérica.
  `.trim();

  try {
  const response = await fetch(
  "https://api.openai.com/v1/responses",
  {
  method: "POST",
  headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
  model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  input: [
  {
  role: "system",
  content: systemPrompt,
  },
  ...messages.map((message) => ({
  role: message.sender === "assistant" ? "assistant" : "user",
  content: message.content,
  })),
  ],
  max_output_tokens: 800,
  }),
  },
  );

  if (!response.ok) {
  const errorText = await response.text();
  console.error("Erro do professor externo:", errorText);
  return null;
  }

  const data = await response.json();

  const text =
  data.output_text ||
  data.output
  ?.flatMap((item) => item.content || [])
  ?.map((content) => content.text || "")
  ?.join("\n")
  ?.trim();

  if (!text) {
  return null;
  }

  return {
  answer: text,
  examples: [],
  corrections: [],
  exercise: null,
  };
  } catch (error) {
  console.error("Falha ao chamar professor externo:", error.message);
  return null;
  }
  }

app.get("/api/health", async (request, response) => {
try {
const databaseResult = await query(
"SELECT CURRENT_TIMESTAMP AS database_time",
);

```
return sendSuccess(response, {
  status: "online",
  serverTime: new Date().toISOString(),
  databaseTime: databaseResult.rows[0].database_time,
  version: "17.0.0",
});
```

} catch (error) {
return sendError(
response,
"Servidor online, mas o banco de dados não respondeu.",
503,
error.message,
);
}
});

app.post("/api/auth/register", async (request, response) => {
try {
const name = sanitizeName(request.body.name);
const email = normalizeEmail(request.body.email);
const password = String(request.body.password || "");

```
if (name.length < 2) {
  return sendError(
    response,
    "Digite um nome com pelo menos dois caracteres.",
  );
}

if (!isValidEmail(email)) {
  return sendError(response, "Digite um e-mail válido.");
}

if (!isStrongEnoughPassword(password)) {
  return sendError(
    response,
    "A senha precisa ter entre 6 e 128 caracteres.",
  );
}

const existingUser = await query(
  `
    SELECT id
    FROM users
    WHERE email = $1
    LIMIT 1
  `,
  [email],
);

if (existingUser.rows.length) {
  return sendError(
    response,
    "Já existe uma conta cadastrada com este e-mail.",
    409,
  );
}

const result = await transaction(async (client) => {
  const insertedUser = await client.query(
    `
      INSERT INTO users (
        name,
        email,
        password_hash,
        role,
        account_status,
        onboarding_completed
      )
      VALUES (
        $1,
        $2,
        crypt($3, gen_salt('bf')),
        'student',
        'active',
        FALSE
      )
      RETURNING
        id,
        name,
        email,
        role,
        onboarding_completed,
        created_at
    `,
    [name, email, password],
  );

  const user = insertedUser.rows[0];

  await ensureUserRelatedRows(client, user.id);
  await initializeCourseProgress(client, user.id);

  return user;
});

const session = await createSession(result.id, request);

return sendSuccess(
  response,
  {
    message: "Conta criada com sucesso.",
    token: session.token,
    expiresAt: session.expiresAt,
    user: result,
    nextStep: "onboarding",
  },
  201,
);
```

} catch (error) {
console.error(error);

```
return sendError(
  response,
  "Não foi possível criar sua conta.",
  500,
  error.message,
);
```

}
});

app.post("/api/auth/login", async (request, response) => {
try {
const email = normalizeEmail(request.body.email);
const password = String(request.body.password || "");

```
if (!isValidEmail(email) || !password) {
  return sendError(response, "E-mail ou senha inválidos.");
}

const result = await query(
  `
    SELECT
      id,
      name,
      email,
      role,
      account_status,
      onboarding_completed,
      email_verified
    FROM users
    WHERE email = $1
    AND password_hash = crypt($2, password_hash)
    LIMIT 1
  `,
  [email, password],
);

if (!result.rows.length) {
  return sendError(response, "E-mail ou senha incorretos.", 401);
}

const user = result.rows[0];

if (user.account_status !== "active") {
  return sendError(response, "Esta conta não está ativa.", 403);
}

await query(
  `
    UPDATE users
    SET last_login_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `,
  [user.id],
);

const session = await createSession(user.id, request);

await createDailyMissions(user.id);

const fullUser = await getFullUser(user.id);

return sendSuccess(response, {
  message: "Login realizado com sucesso.",
  token: session.token,
  expiresAt: session.expiresAt,
  user: fullUser,
  nextStep: user.onboarding_completed ? "loading" : "onboarding",
});
```

} catch (error) {
console.error(error);

```
return sendError(
  response,
  "Não foi possível entrar na conta.",
  500,
  error.message,
);
```

}
});

app.post(
"/api/auth/logout",
authMiddleware,
async (request, response) => {
try {
await revokeSession(request.authToken);

```
  return sendSuccess(response, {
    message: "Você saiu da conta.",
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível encerrar a sessão.",
    500,
  );
}
```

},
);

app.get(
"/api/auth/me",
authMiddleware,
async (request, response) => {
try {
const user = await getFullUser(request.user.id);

```
  if (!user) {
    return sendError(response, "Usuário não encontrado.", 404);
  }

  return sendSuccess(response, { user });
} catch (error) {
  console.error(error);
  return sendError(response, "Erro ao carregar seu perfil.", 500);
}
```

},
);

app.post(
"/api/onboarding",
authMiddleware,
async (request, response) => {
try {
const reasonToLearn = sanitizeShortText(
request.body.reasonToLearn,
100,
);

```
  const currentLevel = ["A1", "A2", "B1", "B2", "C1", "C2"].includes(
    request.body.currentLevel,
  )
    ? request.body.currentLevel
    : "A1";

  const dailyGoalMinutes = clamp(
    request.body.dailyGoalMinutes,
    5,
    240,
  );

  const preferredStudyTime =
    request.body.preferredStudyTime || null;

  const knowsCyrillic = Boolean(request.body.knowsCyrillic);

  const primaryFocus = sanitizeShortText(
    request.body.primaryFocus || "general",
    50,
  );

  const interests = Array.isArray(request.body.interests)
    ? request.body.interests
        .map((item) => sanitizeShortText(item, 60))
        .filter(Boolean)
        .slice(0, 12)
    : [];

  await transaction(async (client) => {
    await client.query(
      `
        INSERT INTO user_profiles (
          user_id,
          reason_to_learn,
          current_level,
          daily_goal_minutes,
          preferred_study_time,
          knows_cyrillic,
          primary_focus,
          interests
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (user_id)
        DO UPDATE SET
          reason_to_learn = EXCLUDED.reason_to_learn,
          current_level = EXCLUDED.current_level,
          daily_goal_minutes = EXCLUDED.daily_goal_minutes,
          preferred_study_time = EXCLUDED.preferred_study_time,
          knows_cyrillic = EXCLUDED.knows_cyrillic,
          primary_focus = EXCLUDED.primary_focus,
          interests = EXCLUDED.interests,
          updated_at = CURRENT_TIMESTAMP
      `,
      [
        request.user.id,
        reasonToLearn,
        currentLevel,
        dailyGoalMinutes,
        preferredStudyTime,
        knowsCyrillic,
        primaryFocus,
        interests,
      ],
    );

    await client.query(
      `
        UPDATE users
        SET onboarding_completed = TRUE
        WHERE id = $1
      `,
      [request.user.id],
    );
  });

  await createDailyMissions(request.user.id);

  const user = await getFullUser(request.user.id);

  return sendSuccess(response, {
    message: "Seu plano de estudo foi preparado.",
    user,
    nextStep: "loading",
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível salvar suas respostas.",
    500,
    error.message,
  );
}
```

},
);

app.get(
"/api/dashboard",
authMiddleware,
async (request, response) => {
try {
await createDailyMissions(request.user.id);

```
  const user = await getFullUser(request.user.id);
  const currentUnit = await getFirstAvailableUnit(request.user.id);

  let currentActivity = null;

  if (currentUnit) {
    currentActivity = await getFirstAvailableActivity(
      request.user.id,
      currentUnit.id,
    );
  }

  const missions = await query(
    `
      SELECT
        id,
        title,
        description,
        target_amount,
        current_amount,
        completed,
        xp_reward
      FROM user_daily_missions
      WHERE user_id = $1
      AND mission_date = CURRENT_DATE
      ORDER BY completed, title
    `,
    [request.user.id],
  );

  const achievements = await query(
    `
      SELECT
        a.title,
        a.description,
        a.icon,
        ua.unlocked_at
      FROM user_achievements ua
      JOIN achievements a ON a.id = ua.achievement_id
      WHERE ua.user_id = $1
      ORDER BY ua.unlocked_at DESC
      LIMIT 5
    `,
    [request.user.id],
  );

  return sendSuccess(response, {
    user,
    currentUnit,
    currentActivity,
    missions: missions.rows,
    achievements: achievements.rows,
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível carregar a tela inicial.",
    500,
  );
}
```

},
);

app.get(
"/api/course",
authMiddleware,
async (request, response) => {
try {
const result = await query(
`           SELECT
            cl.id AS level_id,
            cl.code AS level_code,
            cl.name AS level_name,
            cl.description AS level_description,
            cl.display_order AS level_order,
            cu.id AS unit_id,
            cu.title,
            cu.subtitle,
            cu.description,
            cu.icon,
            cu.display_order AS unit_order,
            cu.minimum_activities_to_complete,
            cu.xp_reward,
            COALESCE(up.status, 'locked') AS status,
            COALESCE(up.activities_completed, 0) AS activities_completed,
            COALESCE(up.lessons_completed, 0) AS lessons_completed,
            COALESCE(up.progress_percent, 0) AS progress_percent,
            up.last_accessed_at
          FROM course_levels cl
          JOIN course_units cu ON cu.level_id = cl.id
          LEFT JOIN user_unit_progress up
            ON up.unit_id = cu.id
            AND up.user_id = $1
          WHERE cu.is_published = TRUE
          ORDER BY cl.display_order, cu.display_order
        `,
[request.user.id],
);

```
  const levelsMap = new Map();

  for (const row of result.rows) {
    if (!levelsMap.has(row.level_id)) {
      levelsMap.set(row.level_id, {
        id: row.level_id,
        code: row.level_code,
        name: row.level_name,
        description: row.level_description,
        order: row.level_order,
        units: [],
      });
    }

    levelsMap.get(row.level_id).units.push({
      id: row.unit_id,
      title: row.title,
      subtitle: row.subtitle,
      description: row.description,
      icon: row.icon,
      order: row.unit_order,
      status: row.status,
      progressPercent: safeNumber(row.progress_percent),
      activitiesCompleted: row.activities_completed,
      lessonsCompleted: row.lessons_completed,
      minimumActivitiesToComplete:
        row.minimum_activities_to_complete,
      xpReward: row.xp_reward,
      lastAccessedAt: row.last_accessed_at,
    });
  }

  return sendSuccess(response, {
    levels: Array.from(levelsMap.values()),
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível carregar o curso.",
    500,
  );
}
```

},
);

app.get(
"/api/course/continue",
authMiddleware,
async (request, response) => {
try {
const unit = await getFirstAvailableUnit(request.user.id);

```
  if (!unit) {
    return sendSuccess(response, {
      completed: true,
      message: "Você concluiu todas as unidades disponíveis.",
    });
  }

  const activity = await getFirstAvailableActivity(
    request.user.id,
    unit.id,
  );

  return sendSuccess(response, {
    completed: false,
    unit,
    activity,
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível encontrar sua próxima atividade.",
    500,
  );
}
```

},
);

app.get(
"/api/units/:unitId",
authMiddleware,
async (request, response) => {
try {
const unitId = request.params.unitId;

```
  const accessResult = await query(
    `
      SELECT
        cu.*,
        cl.code AS level_code,
        cl.name AS level_name,
        COALESCE(up.status, 'locked') AS user_status,
        COALESCE(up.progress_percent, 0) AS progress_percent,
        COALESCE(up.activities_completed, 0) AS activities_completed
      FROM course_units cu
      JOIN course_levels cl ON cl.id = cu.level_id
      LEFT JOIN user_unit_progress up
        ON up.unit_id = cu.id
        AND up.user_id = $2
      WHERE cu.id = $1
      LIMIT 1
    `,
    [unitId, request.user.id],
  );

  if (!accessResult.rows.length) {
    return sendError(response, "Unidade não encontrada.", 404);
  }

  const unit = accessResult.rows[0];

  if (unit.user_status === "locked") {
    return sendError(
      response,
      "Conclua a unidade atual para desbloquear esta unidade.",
      403,
    );
  }

  await query(
    `
      UPDATE user_unit_progress
      SET
        status = CASE
          WHEN status = 'available' THEN 'in_progress'
          ELSE status
        END,
        started_at = COALESCE(started_at, CURRENT_TIMESTAMP),
        last_accessed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      AND unit_id = $2
    `,
    [request.user.id, unitId],
  );

  const lessonsResult = await query(
    `
      SELECT
        l.id,
        l.title,
        l.description,
        l.lesson_type,
        l.display_order,
        l.xp_reward,
        l.estimated_minutes,
        COALESCE(lp.status, 'available') AS status,
        COALESCE(lp.activities_completed, 0) AS activities_completed,
        COALESCE(lp.progress_percent, 0) AS progress_percent,
        COUNT(a.id)::INTEGER AS total_activities
      FROM course_lessons l
      LEFT JOIN activities a
        ON a.lesson_id = l.id
        AND a.is_published = TRUE
      LEFT JOIN user_lesson_progress lp
        ON lp.lesson_id = l.id
        AND lp.user_id = $2
      WHERE l.unit_id = $1
      AND l.is_published = TRUE
      GROUP BY l.id, lp.id
      ORDER BY l.display_order
    `,
    [unitId, request.user.id],
  );

  return sendSuccess(response, {
    unit,
    lessons: lessonsResult.rows,
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível abrir esta unidade.",
    500,
  );
}
```

},
);

app.get(
"/api/lessons/:lessonId",
authMiddleware,
async (request, response) => {
try {
const lessonId = request.params.lessonId;

```
  const lessonResult = await query(
    `
      SELECT
        l.*,
        cu.title AS unit_title,
        cu.id AS unit_id,
        COALESCE(up.status, 'locked') AS unit_status
      FROM course_lessons l
      JOIN course_units cu ON cu.id = l.unit_id
      LEFT JOIN user_unit_progress up
        ON up.unit_id = cu.id
        AND up.user_id = $2
      WHERE l.id = $1
      LIMIT 1
    `,
    [lessonId, request.user.id],
  );

  if (!lessonResult.rows.length) {
    return sendError(response, "Aula não encontrada.", 404);
  }

  const lesson = lessonResult.rows[0];

  if (lesson.unit_status === "locked") {
    return sendError(
      response,
      "Esta aula ainda está bloqueada.",
      403,
    );
  }

  const activitiesResult = await query(
    `
      SELECT
        a.id,
        a.activity_type,
        a.instruction,
        a.question,
        a.russian_text,
        a.portuguese_text,
        a.transliteration,
        a.audio_text,
        a.audio_url,
        a.image_url,
        a.difficulty,
        a.xp_reward,
        a.display_order,
        a.metadata,
        COALESCE(ap.status, 'available') AS status,
        COALESCE(ap.attempts, 0) AS attempts,
        COALESCE(ap.best_score, 0) AS best_score,
        COALESCE(ap.completed, FALSE) AS completed
      FROM activities a
      LEFT JOIN user_activity_progress ap
        ON ap.activity_id = a.id
        AND ap.user_id = $2
      WHERE a.lesson_id = $1
      AND a.is_published = TRUE
      ORDER BY a.display_order
    `,
    [lessonId, request.user.id],
  );

  return sendSuccess(response, {
    lesson,
    activities: activitiesResult.rows,
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível abrir esta aula.",
    500,
  );
}
```

},
);

app.get(
"/api/activities/:activityId",
authMiddleware,
async (request, response) => {
try {
const activityId = request.params.activityId;

```
  const result = await query(
    `
      SELECT
        a.id,
        a.lesson_id,
        a.activity_type,
        a.instruction,
        a.question,
        a.russian_text,
        a.portuguese_text,
        a.transliteration,
        a.audio_text,
        a.audio_url,
        a.image_url,
        a.difficulty,
        a.xp_reward,
        a.display_order,
        a.metadata,
        l.title AS lesson_title,
        l.unit_id,
        cu.title AS unit_title,
        COALESCE(up.status, 'locked') AS unit_status,
        COALESCE(ap.attempts, 0) AS attempts,
        COALESCE(ap.best_score, 0) AS best_score,
        COALESCE(ap.completed, FALSE) AS completed
      FROM activities a
      JOIN course_lessons l ON l.id = a.lesson_id
      JOIN course_units cu ON cu.id = l.unit_id
      LEFT JOIN user_unit_progress up
        ON up.unit_id = cu.id
        AND up.user_id = $2
      LEFT JOIN user_activity_progress ap
        ON ap.activity_id = a.id
        AND ap.user_id = $2
      WHERE a.id = $1
      AND a.is_published = TRUE
      LIMIT 1
    `,
    [activityId, request.user.id],
  );

  if (!result.rows.length) {
    return sendError(response, "Atividade não encontrada.", 404);
  }

  const activity = result.rows[0];

  if (activity.unit_status === "locked") {
    return sendError(
      response,
      "Conclua a unidade atual antes de acessar esta atividade.",
      403,
    );
  }

  const options = await query(
    `
      SELECT
        id,
        option_text,
        option_audio_text,
        option_image_url,
        display_order
      FROM activity_options
      WHERE activity_id = $1
      ORDER BY display_order
    `,
    [activityId],
  );

  await query(
    `
      INSERT INTO user_activity_progress (
        user_id,
        activity_id,
        status,
        attempts,
        first_attempt_at
      )
      VALUES ($1, $2, 'in_progress', 0, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, activity_id)
      DO UPDATE SET
        status = CASE
          WHEN user_activity_progress.completed = TRUE
          THEN 'completed'
          ELSE 'in_progress'
        END,
        updated_at = CURRENT_TIMESTAMP
    `,
    [request.user.id, activityId],
  );

  return sendSuccess(response, {
    activity,
    options: options.rows,
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível carregar a atividade.",
    500,
  );
}
```

},
);

app.post(
"/api/activities/:activityId/submit",
authMiddleware,
async (request, response) => {
try {
const activityId = request.params.activityId;

```
  const submittedAnswer = String(
    request.body.answer || request.body.submittedAnswer || "",
  ).trim();

  const selectedOptionId =
    request.body.selectedOptionId || null;

  const recognizedText = String(
    request.body.recognizedText || "",
  ).trim();

  const drawingData = request.body.drawingData || null;

  const timeSpentSeconds = clamp(
    request.body.timeSpentSeconds,
    0,
    7200,
  );

  const result = await transaction(async (client) => {
    const activityResult = await client.query(
      `
        SELECT
          a.*,
          l.unit_id
        FROM activities a
        JOIN course_lessons l ON l.id = a.lesson_id
        WHERE a.id = $1
        AND a.is_published = TRUE
        LIMIT 1
        FOR UPDATE
      `,
      [activityId],
    );

    if (!activityResult.rows.length) {
      const error = new Error("Atividade não encontrada.");
      error.status = 404;
      throw error;
    }

    const activity = activityResult.rows[0];

    const accessResult = await client.query(
      `
        SELECT status
        FROM user_unit_progress
        WHERE user_id = $1
        AND unit_id = $2
        LIMIT 1
      `,
      [request.user.id, activity.unit_id],
    );

    if (
      !accessResult.rows.length ||
      accessResult.rows[0].status === "locked"
    ) {
      const error = new Error("Esta atividade ainda está bloqueada.");
      error.status = 403;
      throw error;
    }

    let isCorrect = false;
    let score = 0;
    let pronunciationScore = null;
    let finalSubmittedAnswer = submittedAnswer;
    let feedback = "";

    if (selectedOptionId) {
      const optionResult = await client.query(
        `
          SELECT
            option_text,
            is_correct
          FROM activity_options
          WHERE id = $1
          AND activity_id = $2
          LIMIT 1
        `,
        [selectedOptionId, activityId],
      );

      if (optionResult.rows.length) {
        finalSubmittedAnswer =
          optionResult.rows[0].option_text;

        isCorrect = optionResult.rows[0].is_correct;
        score = isCorrect ? 100 : 0;
      }
    } else if (activity.activity_type === "speak") {
      const textToCompare = recognizedText || submittedAnswer;

      pronunciationScore = calculateTextSimilarity(
        textToCompare,
        activity.expected_answer ||
          activity.russian_text ||
          activity.audio_text,
      );

      score = pronunciationScore;
      isCorrect = pronunciationScore >= 70;

      finalSubmittedAnswer = textToCompare;

      feedback = isCorrect
        ? "Boa pronúncia. Continue praticando ritmo e entonação."
        : "Tente novamente mais devagar e escute o áudio antes de repetir.";
    } else if (activity.activity_type === "cursive_writing") {
      score = clamp(request.body.writingScore, 0, 100);
      isCorrect = score >= 70;

      feedback = isCorrect
        ? "Seu traçado ficou bom."
        : "Repita o exercício seguindo as linhas-guia.";
    } else {
      isCorrect = compareAnswer(
        submittedAnswer,
        activity.expected_answer,
        activity.accepted_answers,
      );

      score = isCorrect ? 100 : 0;
    }

    if (!feedback) {
      feedback = isCorrect
        ? activity.explanation ||
          "Resposta correta. Muito bem!"
        : activity.explanation ||
          "A resposta ainda não está correta. Revise o exemplo e tente novamente.";
    }

    const previousProgress = await client.query(
      `
        SELECT
          completed,
          xp_earned,
          attempts
        FROM user_activity_progress
        WHERE user_id = $1
        AND activity_id = $2
        FOR UPDATE
      `,
      [request.user.id, activityId],
    );

    const alreadyCompleted =
      previousProgress.rows[0]?.completed === true;

    const xpEarned =
      isCorrect && !alreadyCompleted
        ? safeInteger(activity.xp_reward, 10)
        : 0;

    await client.query(
      `
        INSERT INTO activity_attempts (
          user_id,
          activity_id,
          submitted_answer,
          submitted_drawing,
          is_correct,
          score,
          pronunciation_score,
          feedback,
          time_spent_seconds,
          xp_earned
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10
        )
      `,
      [
        request.user.id,
        activityId,
        finalSubmittedAnswer,
        drawingData,
        isCorrect,
        score,
        pronunciationScore,
        feedback,
        timeSpentSeconds,
        xpEarned,
      ],
    );

    await client.query(
      `
        INSERT INTO user_activity_progress (
          user_id,
          activity_id,
          status,
          attempts,
          best_score,
          last_score,
          completed,
          xp_earned,
          first_attempt_at,
          completed_at
        )
        VALUES (
          $1,
          $2,
          $3,
          1,
          $4,
          $4,
          $5,
          $6,
          CURRENT_TIMESTAMP,
          CASE WHEN $5 THEN CURRENT_TIMESTAMP ELSE NULL END
        )
        ON CONFLICT (user_id, activity_id)
        DO UPDATE SET
          status = CASE
            WHEN $5 THEN 'completed'
            ELSE 'in_progress'
          END,
          attempts = user_activity_progress.attempts + 1,
          best_score = GREATEST(
            user_activity_progress.best_score,
            $4
          ),
          last_score = $4,
          completed = (
            user_activity_progress.completed OR $5
          ),
          xp_earned = user_activity_progress.xp_earned + $6,
          completed_at = CASE
            WHEN $5
            THEN COALESCE(
              user_activity_progress.completed_at,
              CURRENT_TIMESTAMP
            )
            ELSE user_activity_progress.completed_at
          END,
          updated_at = CURRENT_TIMESTAMP
      `,
      [
        request.user.id,
        activityId,
        isCorrect ? "completed" : "in_progress",
        score,
        isCorrect,
        xpEarned,
      ],
    );

    if (xpEarned > 0) {
      await client.query(
        `
          UPDATE user_stats
          SET
            total_xp = total_xp + $2,
            activities_completed = activities_completed + 1,
            minutes_studied = minutes_studied +
              GREATEST(ROUND($3::NUMERIC / 60), 1),
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1
        `,
        [
          request.user.id,
          xpEarned,
          timeSpentSeconds,
        ],
      );

      await updateStreak(client, request.user.id);
      await updateDailyMissionProgress(
        client,
        request.user.id,
        "complete_activities",
        1,
      );

      if (activity.activity_type === "speak") {
        await updateDailyMissionProgress(
          client,
          request.user.id,
          "practice_speaking",
          1,
        );
      }

      if (
        activity.activity_type === "write" ||
        activity.activity_type === "cursive_writing"
      ) {
        await updateDailyMissionProgress(
          client,
          request.user.id,
          "practice_writing",
          1,
        );
      }

      if (
        activity.activity_type === "listen_select" ||
        activity.activity_type === "listen_write"
      ) {
        await updateDailyMissionProgress(
          client,
          request.user.id,
          "listen_words",
          1,
        );
      }
    }

    const lessonProgress = await refreshLessonProgress(
      client,
      request.user.id,
      activity.lesson_id,
    );

    const unitProgress = await refreshUnitProgress(
      client,
      request.user.id,
      activity.unit_id,
    );

    const unlockedAchievements = await checkAchievements(
      client,
      request.user.id,
    );

    return {
      isCorrect,
      score,
      pronunciationScore,
      feedback,
      xpEarned,
      expectedAnswer: activity.expected_answer,
      explanation: activity.explanation,
      lessonProgress,
      unitProgress,
      unlockedAchievements,
    };
  });

  return sendSuccess(response, result);
} catch (error) {
  console.error(error);

  return sendError(
    response,
    error.message || "Não foi possível corrigir a atividade.",
    error.status || 500,
  );
}
```

},
);

app.get(
"/api/alphabet",
optionalAuthMiddleware,
async (request, response) => {
try {
const result = await query(
`           SELECT *
          FROM alphabet_letters
          ORDER BY display_order
        `,
);

```
  return sendSuccess(response, {
    letters: result.rows,
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível carregar o alfabeto.",
    500,
  );
}
```

},
);

app.post(
"/api/writing/attempt",
authMiddleware,
async (request, response) => {
try {
const letterId = request.body.letterId || null;
const activityId = request.body.activityId || null;
const referenceText = sanitizeShortText(
request.body.referenceText,
1000,
);

```
  const writtenText = sanitizeShortText(
    request.body.writtenText,
    1000,
  );

  const drawingData = request.body.drawingData || {};
  const score = clamp(request.body.score, 0, 100);

  const feedback =
    score >= 85
      ? "Traçado excelente."
      : score >= 70
        ? "Bom trabalho. Tente deixar as ligações mais suaves."
        : "Continue praticando com as linhas-guia.";

  const result = await query(
    `
      INSERT INTO writing_attempts (
        user_id,
        letter_id,
        activity_id,
        reference_text,
        written_text,
        drawing_data,
        score,
        feedback
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    [
      request.user.id,
      letterId,
      activityId,
      referenceText,
      writtenText,
      drawingData,
      score,
      feedback,
    ],
  );

  return sendSuccess(response, {
    attempt: result.rows[0],
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível salvar sua escrita.",
    500,
  );
}
```

},
);

app.post(
"/api/pronunciation/evaluate",
authMiddleware,
async (request, response) => {
try {
const expectedText = sanitizeShortText(
request.body.expectedText,
1000,
);

```
  const recognizedText = sanitizeShortText(
    request.body.recognizedText,
    1000,
  );

  if (!expectedText || !recognizedText) {
    return sendError(
      response,
      "Envie o texto esperado e o texto reconhecido.",
    );
  }

  const accuracyScore = calculateTextSimilarity(
    recognizedText,
    expectedText,
  );

  const pronunciationScore = accuracyScore;
  const fluencyScore = clamp(
    request.body.fluencyScore || accuracyScore,
    0,
    100,
  );

  const feedback =
    pronunciationScore >= 85
      ? "Pronúncia muito boa."
      : pronunciationScore >= 70
        ? "Boa tentativa. Preste atenção ao acento tônico."
        : "Escute novamente e repita a frase mais devagar.";

  const result = await query(
    `
      INSERT INTO pronunciation_attempts (
        user_id,
        activity_id,
        expected_text,
        recognized_text,
        pronunciation_score,
        accuracy_score,
        fluency_score,
        feedback
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    [
      request.user.id,
      request.body.activityId || null,
      expectedText,
      recognizedText,
      pronunciationScore,
      accuracyScore,
      fluencyScore,
      feedback,
    ],
  );

  return sendSuccess(response, {
    evaluation: result.rows[0],
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível avaliar sua pronúncia.",
    500,
  );
}
```

},
);

app.get(
"/api/dictionary",
optionalAuthMiddleware,
async (request, response) => {
try {
const search = sanitizeShortText(request.query.search, 150);
const category = sanitizeShortText(
request.query.category,
100,
);

```
  const level = sanitizeShortText(request.query.level, 10);
  const limit = clamp(request.query.limit || 50, 1, 200);
  const offset = Math.max(safeInteger(request.query.offset, 0), 0);

  const values = [];
  const conditions = [];

  if (search) {
    values.push(`%${search}%`);
    const index = values.length;

    conditions.push(`
      (
        de.russian_word ILIKE $${index}
        OR de.portuguese_translation ILIKE $${index}
        OR de.transliteration ILIKE $${index}
        OR de.search_text ILIKE $${index}
      )
    `);
  }

  if (category) {
    values.push(category);
    conditions.push(`dc.slug = $${values.length}`);
  }

  if (level) {
    values.push(level);
    conditions.push(`de.difficulty = $${values.length}`);
  }

  values.push(limit);
  const limitIndex = values.length;

  values.push(offset);
  const offsetIndex = values.length;

  const userId = request.user?.id || null;
  values.push(userId);
  const userIndex = values.length;

  const result = await query(
    `
      SELECT
        de.*,
        dc.name AS category_name,
        dc.slug AS category_slug,
        dc.icon AS category_icon,
        EXISTS (
          SELECT 1
          FROM dictionary_favorites df
          WHERE df.entry_id = de.id
          AND df.user_id = $${userIndex}
        ) AS is_favorite,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', dex.id,
                'russianSentence', dex.russian_sentence,
                'portugueseSentence', dex.portuguese_sentence,
                'transliteration', dex.transliteration,
                'explanation', dex.explanation,
                'audioText', dex.audio_text
              )
            )
            FROM dictionary_examples dex
            WHERE dex.entry_id = de.id
          ),
          '[]'::JSON
        ) AS examples
      FROM dictionary_entries de
      LEFT JOIN dictionary_categories dc
        ON dc.id = de.category_id
      ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
      ORDER BY de.difficulty, de.russian_word
      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `,
    values,
  );

  if (request.user && search) {
    await query(
      `
        INSERT INTO dictionary_history (
          user_id,
          searched_term
        )
        VALUES ($1, $2)
      `,
      [request.user.id, search],
    );
  }

  return sendSuccess(response, {
    entries: result.rows,
    pagination: {
      limit,
      offset,
      returned: result.rows.length,
    },
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível pesquisar o dicionário.",
    500,
  );
}
```

},
);

app.post(
"/api/dictionary/:entryId/favorite",
authMiddleware,
async (request, response) => {
try {
const entryId = request.params.entryId;

```
  const existing = await query(
    `
      SELECT 1
      FROM dictionary_favorites
      WHERE user_id = $1
      AND entry_id = $2
    `,
    [request.user.id, entryId],
  );

  if (existing.rows.length) {
    await query(
      `
        DELETE FROM dictionary_favorites
        WHERE user_id = $1
        AND entry_id = $2
      `,
      [request.user.id, entryId],
    );

    return sendSuccess(response, {
      favorite: false,
    });
  }

  await query(
    `
      INSERT INTO dictionary_favorites (
        user_id,
        entry_id
      )
      VALUES ($1, $2)
    `,
    [request.user.id, entryId],
  );

  return sendSuccess(response, {
    favorite: true,
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível atualizar os favoritos.",
    500,
  );
}
```

},
);

app.get(
"/api/culture",
optionalAuthMiddleware,
async (request, response) => {
try {
const category = sanitizeShortText(
request.query.category,
100,
);

```
  const values = [];
  let condition = "";

  if (category) {
    values.push(category);
    condition = "WHERE cc.slug = $1";
  }

  const result = await query(
    `
      SELECT
        ca.id,
        ca.title,
        ca.subtitle,
        ca.summary,
        ca.author_name,
        ca.historical_period,
        ca.image_url,
        ca.difficulty,
        ca.reading_minutes,
        cc.name AS category_name,
        cc.slug AS category_slug,
        cc.icon AS category_icon
      FROM culture_articles ca
      JOIN culture_categories cc
        ON cc.id = ca.category_id
      ${condition}
      AND ca.is_published = TRUE
      ORDER BY cc.display_order, ca.title
    `.replace(
      category ? "AND ca.is_published" : "AND ca.is_published",
      category
        ? "AND ca.is_published"
        : "WHERE ca.is_published",
    ),
    values,
  );

  const categories = await query(
    `
      SELECT *
      FROM culture_categories
      ORDER BY display_order
    `,
  );

  return sendSuccess(response, {
    categories: categories.rows,
    articles: result.rows,
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível carregar a biblioteca cultural.",
    500,
  );
}
```

},
);

app.get(
"/api/culture/:articleId",
optionalAuthMiddleware,
async (request, response) => {
try {
const result = await query(
`           SELECT
            ca.*,
            cc.name AS category_name,
            cc.slug AS category_slug,
            cc.icon AS category_icon
          FROM culture_articles ca
          JOIN culture_categories cc
            ON cc.id = ca.category_id
          WHERE ca.id = $1
          AND ca.is_published = TRUE
          LIMIT 1
        `,
[request.params.articleId],
);

```
  if (!result.rows.length) {
    return sendError(response, "Conteúdo não encontrado.", 404);
  }

  return sendSuccess(response, {
    article: result.rows[0],
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível abrir este conteúdo.",
    500,
  );
}
```

},
);

app.get(
"/api/music",
optionalAuthMiddleware,
async (request, response) => {
try {
const result = await query(
`           SELECT
            mt.id,
            mt.title,
            mt.russian_title,
            mt.description,
            mt.difficulty,
            mt.vocabulary,
            mt.study_notes,
            mt.external_url,
            mt.cover_url,
            ma.name AS artist_name,
            ma.russian_name AS artist_russian_name,
            ma.description AS artist_description,
            ma.genres
          FROM music_tracks mt
          JOIN music_artists ma ON ma.id = mt.artist_id
          WHERE mt.is_recommended = TRUE
          ORDER BY
            CASE
              WHEN ma.name = 'DDT' THEN 1
              WHEN ma.name = 'Katya Lel' THEN 2
              WHEN ma.name = 'Mumiy Troll' THEN 3
              WHEN ma.name = 'Valery Meladze' THEN 4
              ELSE 5
            END,
            mt.title
        `,
);

```
  return sendSuccess(response, {
    tracks: result.rows,
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível carregar as recomendações musicais.",
    500,
  );
}
```

},
);

app.get(
"/api/games",
authMiddleware,
async (request, response) => {
try {
const result = await query(
`           SELECT
            g.*,
            COALESCE(gr.best_score, 0) AS best_score,
            COALESCE(gr.total_plays, 0) AS total_plays,
            COALESCE(gr.total_xp, 0) AS total_xp
          FROM games g
          LEFT JOIN game_records gr
            ON gr.game_id = g.id
            AND gr.user_id = $1
          WHERE g.is_published = TRUE
          ORDER BY g.title
        `,
[request.user.id],
);

```
  return sendSuccess(response, {
    games: result.rows,
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível carregar os jogos.",
    500,
  );
}
```

},
);

app.post(
"/api/games/:gameId/result",
authMiddleware,
async (request, response) => {
try {
const gameId = request.params.gameId;
const score = Math.max(safeInteger(request.body.score, 0), 0);
const correctAnswers = Math.max(
safeInteger(request.body.correctAnswers, 0),
0,
);

```
  const wrongAnswers = Math.max(
    safeInteger(request.body.wrongAnswers, 0),
    0,
  );

  const durationSeconds = clamp(
    request.body.durationSeconds,
    0,
    7200,
  );

  const details = request.body.details || {};

  const gameResult = await query(
    `
      SELECT *
      FROM games
      WHERE id = $1
      AND is_published = TRUE
      LIMIT 1
    `,
    [gameId],
  );

  if (!gameResult.rows.length) {
    return sendError(response, "Jogo não encontrado.", 404);
  }

  const game = gameResult.rows[0];

  const accuracy =
    correctAnswers + wrongAnswers > 0
      ? correctAnswers / (correctAnswers + wrongAnswers)
      : 0;

  const xpEarned = Math.round(
    game.xp_reward * Math.max(accuracy, 0.25),
  );

  const result = await transaction(async (client) => {
    const sessionResult = await client.query(
      `
        INSERT INTO game_sessions (
          user_id,
          game_id,
          score,
          correct_answers,
          wrong_answers,
          duration_seconds,
          xp_earned,
          details
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `,
      [
        request.user.id,
        gameId,
        score,
        correctAnswers,
        wrongAnswers,
        durationSeconds,
        xpEarned,
        details,
      ],
    );

    await client.query(
      `
        INSERT INTO game_records (
          user_id,
          game_id,
          best_score,
          total_plays,
          total_xp
        )
        VALUES ($1, $2, $3, 1, $4)
        ON CONFLICT (user_id, game_id)
        DO UPDATE SET
          best_score = GREATEST(
            game_records.best_score,
            EXCLUDED.best_score
          ),
          total_plays = game_records.total_plays + 1,
          total_xp = game_records.total_xp + EXCLUDED.total_xp,
          updated_at = CURRENT_TIMESTAMP
      `,
      [request.user.id, gameId, score, xpEarned],
    );

    await client.query(
      `
        UPDATE user_stats
        SET
          total_xp = total_xp + $2,
          games_played = games_played + 1,
          minutes_studied = minutes_studied +
            GREATEST(ROUND($3::NUMERIC / 60), 1),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `,
      [request.user.id, xpEarned, durationSeconds],
    );

    await updateStreak(client, request.user.id);
    await updateDailyMissionProgress(
      client,
      request.user.id,
      "play_game",
      1,
    );

    const achievements = await checkAchievements(
      client,
      request.user.id,
    );

    return {
      session: sessionResult.rows[0],
      achievements,
    };
  });

  return sendSuccess(response, {
    ...result,
    xpEarned,
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível salvar o resultado do jogo.",
    500,
  );
}
```

},
);

app.get(
"/api/exams",
authMiddleware,
async (request, response) => {
try {
const result = await query(
`           SELECT
            e.id,
            e.title,
            e.description,
            e.minimum_activities_required,
            e.passing_score,
            e.time_limit_minutes,
            e.xp_reward,
            e.maximum_attempts,
            cl.code AS level_code,
            cu.title AS unit_title,
            COALESCE(us.activities_completed, 0) AS activities_completed,
            GREATEST(
              e.minimum_activities_required -
              COALESCE(us.activities_completed, 0),
              0
            ) AS activities_remaining,
            (
              COALESCE(us.activities_completed, 0) >=
              e.minimum_activities_required
            ) AS unlocked,
            COALESCE(
              (
                SELECT MAX(uea.score)
                FROM user_exam_attempts uea
                WHERE uea.exam_id = e.id
                AND uea.user_id = $1
              ),
              0
            ) AS best_score
          FROM exams e
          LEFT JOIN course_levels cl ON cl.id = e.level_id
          LEFT JOIN course_units cu ON cu.id = e.unit_id
          LEFT JOIN user_stats us ON us.user_id = $1
          WHERE e.is_published = TRUE
          ORDER BY cl.display_order NULLS LAST, e.title
        `,
[request.user.id],
);

```
  return sendSuccess(response, {
    exams: result.rows,
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível carregar as provas.",
    500,
  );
}
```

},
);

app.post(
"/api/exams/:examId/start",
authMiddleware,
async (request, response) => {
try {
const examId = request.params.examId;

```
  const accessResult = await query(
    `
      SELECT
        e.*,
        COALESCE(us.activities_completed, 0) AS activities_completed
      FROM exams e
      LEFT JOIN user_stats us ON us.user_id = $2
      WHERE e.id = $1
      AND e.is_published = TRUE
      LIMIT 1
    `,
    [examId, request.user.id],
  );

  if (!accessResult.rows.length) {
    return sendError(response, "Prova não encontrada.", 404);
  }

  const exam = accessResult.rows[0];

  if (
    exam.activities_completed <
    exam.minimum_activities_required
  ) {
    return sendError(
      response,
      `Conclua mais ${
        exam.minimum_activities_required -
        exam.activities_completed
      } atividades para liberar esta prova.`,
      403,
    );
  }

  const attemptsResult = await query(
    `
      SELECT COUNT(*)::INTEGER AS amount
      FROM user_exam_attempts
      WHERE user_id = $1
      AND exam_id = $2
    `,
    [request.user.id, examId],
  );

  const attemptNumber =
    safeInteger(attemptsResult.rows[0].amount, 0) + 1;

  if (
    exam.maximum_attempts &&
    attemptNumber > exam.maximum_attempts
  ) {
    return sendError(
      response,
      "Você atingiu o limite de tentativas desta prova.",
      403,
    );
  }

  const attemptResult = await query(
    `
      INSERT INTO user_exam_attempts (
        user_id,
        exam_id,
        attempt_number
      )
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [request.user.id, examId, attemptNumber],
  );

  const questionsResult = await query(
    `
      SELECT
        q.id,
        q.question_type,
        q.instruction,
        q.question,
        q.russian_text,
        q.portuguese_text,
        q.transliteration,
        q.audio_text,
        q.points,
        q.display_order,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', qo.id,
                'text', qo.option_text,
                'order', qo.display_order
              )
              ORDER BY qo.display_order
            )
            FROM exam_question_options qo
            WHERE qo.question_id = q.id
          ),
          '[]'::JSON
        ) AS options
      FROM exam_questions q
      WHERE q.exam_id = $1
      ORDER BY q.display_order
    `,
    [examId],
  );

  return sendSuccess(response, {
    exam: {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      passingScore: exam.passing_score,
      timeLimitMinutes: exam.time_limit_minutes,
      xpReward: exam.xp_reward,
    },
    attempt: attemptResult.rows[0],
    questions: questionsResult.rows,
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível iniciar a prova.",
    500,
  );
}
```

},
);

app.post(
"/api/exams/attempts/:attemptId/finish",
authMiddleware,
async (request, response) => {
try {
const attemptId = request.params.attemptId;
const answers = Array.isArray(request.body.answers)
? request.body.answers
: [];

```
  const timeSpentSeconds = clamp(
    request.body.timeSpentSeconds,
    0,
    14400,
  );

  const result = await transaction(async (client) => {
    const attemptResult = await client.query(
      `
        SELECT
          uea.*,
          e.passing_score,
          e.xp_reward
        FROM user_exam_attempts uea
        JOIN exams e ON e.id = uea.exam_id
        WHERE uea.id = $1
        AND uea.user_id = $2
        AND uea.completed_at IS NULL
        LIMIT 1
        FOR UPDATE
      `,
      [attemptId, request.user.id],
    );

    if (!attemptResult.rows.length) {
      const error = new Error(
        "Tentativa não encontrada ou já concluída.",
      );

      error.status = 404;
      throw error;
    }

    const attempt = attemptResult.rows[0];

    const questionsResult = await client.query(
      `
        SELECT *
        FROM exam_questions
        WHERE exam_id = $1
      `,
      [attempt.exam_id],
    );

    let totalPoints = 0;
    let earnedPoints = 0;
    const corrections = [];

    for (const question of questionsResult.rows) {
      totalPoints += safeNumber(question.points, 0);

      const answer = answers.find(
        (item) => item.questionId === question.id,
      );

      const submittedAnswer = String(
        answer?.answer || "",
      ).trim();

      let isCorrect = false;
      let questionScore = 0;

      if (answer?.selectedOptionId) {
        const optionResult = await client.query(
          `
            SELECT is_correct, option_text
            FROM exam_question_options
            WHERE id = $1
            AND question_id = $2
            LIMIT 1
          `,
          [answer.selectedOptionId, question.id],
        );

        if (optionResult.rows.length) {
          isCorrect = optionResult.rows[0].is_correct;
        }
      } else if (question.question_type === "speak") {
        const similarity = calculateTextSimilarity(
          answer?.recognizedText || submittedAnswer,
          question.expected_answer ||
            question.russian_text ||
            question.audio_text,
        );

        isCorrect = similarity >= 70;
        questionScore =
          (safeNumber(question.points, 0) * similarity) / 100;
      } else {
        isCorrect = compareAnswer(
          submittedAnswer,
          question.expected_answer,
          question.accepted_answers,
        );
      }

      if (
        question.question_type !== "speak" &&
        isCorrect
      ) {
        questionScore = safeNumber(question.points, 0);
      }

      earnedPoints += questionScore;

      await client.query(
        `
          INSERT INTO user_exam_answers (
            attempt_id,
            question_id,
            submitted_answer,
            is_correct,
            score,
            feedback
          )
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          attemptId,
          question.id,
          submittedAnswer,
          isCorrect,
          questionScore,
          isCorrect
            ? "Resposta correta."
            : question.explanation ||
              "Revise este conteúdo.",
        ],
      );

      corrections.push({
        questionId: question.id,
        isCorrect,
        score: questionScore,
        expectedAnswer: question.expected_answer,
        explanation: question.explanation,
      });
    }

    const finalScore =
      totalPoints > 0
        ? Math.round((earnedPoints / totalPoints) * 100)
        : 0;

    const passed = finalScore >= attempt.passing_score;

    const xpEarned = passed
      ? safeInteger(attempt.xp_reward, 0)
      : Math.round(safeInteger(attempt.xp_reward, 0) * 0.25);

    await client.query(
      `
        UPDATE user_exam_attempts
        SET
          score = $2,
          passed = $3,
          completed_at = CURRENT_TIMESTAMP,
          time_spent_seconds = $4,
          xp_earned = $5
        WHERE id = $1
      `,
      [
        attemptId,
        finalScore,
        passed,
        timeSpentSeconds,
        xpEarned,
      ],
    );

    await client.query(
      `
        UPDATE user_stats
        SET
          total_xp = total_xp + $2,
          exams_completed = exams_completed +
            CASE WHEN $3 THEN 1 ELSE 0 END,
          minutes_studied = minutes_studied +
            GREATEST(ROUND($4::NUMERIC / 60), 1),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `,
      [
        request.user.id,
        xpEarned,
        passed,
        timeSpentSeconds,
      ],
    );

    await updateStreak(client, request.user.id);

    const achievements = await checkAchievements(
      client,
      request.user.id,
    );

    return {
      score: finalScore,
      passed,
      xpEarned,
      corrections,
      achievements,
    };
  });

  return sendSuccess(response, result);
} catch (error) {
  console.error(error);

  return sendError(
    response,
    error.message || "Não foi possível finalizar a prova.",
    error.status || 500,
  );
}
```

},
);

app.get(
"/api/teacher/conversations",
authMiddleware,
async (request, response) => {
try {
const result = await query(
`           SELECT
            id,
            title,
            conversation_mode,
            created_at,
            updated_at
          FROM ai_conversations
          WHERE user_id = $1
          ORDER BY updated_at DESC
          LIMIT 50
        `,
[request.user.id],
);

```
  return sendSuccess(response, {
    conversations: result.rows,
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível carregar as conversas.",
    500,
  );
}
```

},
);

app.post(
"/api/teacher/chat",
authMiddleware,
async (request, response) => {
try {
const message = sanitizeShortText(
request.body.message,
5000,
);

```
  const mode = [
    "general",
    "translate",
    "correct",
    "explain",
    "exercise",
    "dialogue",
    "pronunciation",
  ].includes(request.body.mode)
    ? request.body.mode
    : "general";

  let conversationId =
    request.body.conversationId || null;

  if (!message) {
    return sendError(
      response,
      "Escreva uma mensagem para o professor.",
    );
  }

  const user = await getFullUser(request.user.id);

  if (!conversationId) {
    const conversationResult = await query(
      `
        INSERT INTO ai_conversations (
          user_id,
          title,
          conversation_mode
        )
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [
        request.user.id,
        message.slice(0, 80),
        mode,
      ],
    );

    conversationId = conversationResult.rows[0].id;
  } else {
    const ownerResult = await query(
      `
        SELECT id
        FROM ai_conversations
        WHERE id = $1
        AND user_id = $2
        LIMIT 1
      `,
      [conversationId, request.user.id],
    );

    if (!ownerResult.rows.length) {
      return sendError(
        response,
        "Conversa não encontrada.",
        404,
      );
    }
  }

  await query(
    `
      INSERT INTO ai_messages (
        conversation_id,
        sender,
        content
      )
      VALUES ($1, 'user', $2)
    `,
    [conversationId, message],
  );

  const historyResult = await query(
    `
      SELECT
        sender,
        content
      FROM ai_messages
      WHERE conversation_id = $1
      ORDER BY created_at DESC
      LIMIT 16
    `,
    [conversationId],
  );

  const history = historyResult.rows.reverse();

  const externalResponse = await callExternalTeacher({
    messages: history,
    mode,
    level: user?.current_level,
  });

  const teacherResponse =
    externalResponse ||
    buildLocalTeacherResponse({
      message,
      mode,
      level: user?.current_level,
      userName: user?.name,
    });

  await query(
    `
      INSERT INTO ai_messages (
        conversation_id,
        sender,
        content,
        correction_data
      )
      VALUES ($1, 'assistant', $2, $3)
    `,
    [
      conversationId,
      teacherResponse.answer,
      {
        examples: teacherResponse.examples,
        corrections: teacherResponse.corrections,
        exercise: teacherResponse.exercise,
      },
    ],
  );

  await query(
    `
      UPDATE ai_conversations
      SET
        conversation_mode = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `,
    [conversationId, mode],
  );

  return sendSuccess(response, {
    conversationId,
    response: teacherResponse,
    provider: externalResponse ? "external" : "local",
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "O professor não conseguiu responder agora.",
    500,
  );
}
```

},
);

app.get(
"/api/teacher/conversations/:conversationId",
authMiddleware,
async (request, response) => {
try {
const result = await query(
`           SELECT
            ac.id,
            ac.title,
            ac.conversation_mode,
            ac.created_at,
            ac.updated_at,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', am.id,
                  'sender', am.sender,
                  'content', am.content,
                  'correctionData', am.correction_data,
                  'createdAt', am.created_at
                )
                ORDER BY am.created_at
              ) FILTER (WHERE am.id IS NOT NULL),
              '[]'::JSON
            ) AS messages
          FROM ai_conversations ac
          LEFT JOIN ai_messages am
            ON am.conversation_id = ac.id
          WHERE ac.id = $1
          AND ac.user_id = $2
          GROUP BY ac.id
          LIMIT 1
        `,
[
request.params.conversationId,
request.user.id,
],
);

```
  if (!result.rows.length) {
    return sendError(response, "Conversa não encontrada.", 404);
  }

  return sendSuccess(response, {
    conversation: result.rows[0],
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível abrir esta conversa.",
    500,
  );
}
```

},
);

app.get(
"/api/profile",
authMiddleware,
async (request, response) => {
try {
const user = await getFullUser(request.user.id);

```
  const progress = await query(
    `
      SELECT
        cl.code AS level_code,
        cu.title AS unit_title,
        up.status,
        up.progress_percent,
        up.activities_completed,
        up.lessons_completed,
        up.last_accessed_at
      FROM user_unit_progress up
      JOIN course_units cu ON cu.id = up.unit_id
      JOIN course_levels cl ON cl.id = cu.level_id
      WHERE up.user_id = $1
      ORDER BY cl.display_order, cu.display_order
    `,
    [request.user.id],
  );

  return sendSuccess(response, {
    user,
    courseProgress: progress.rows,
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível carregar o perfil.",
    500,
  );
}
```

},
);

app.patch(
"/api/profile",
authMiddleware,
async (request, response) => {
try {
const name = sanitizeName(request.body.name);

```
  const dailyGoalMinutes = clamp(
    request.body.dailyGoalMinutes || 15,
    5,
    240,
  );

  const preferredStudyTime =
    request.body.preferredStudyTime || null;

  const biography = sanitizeShortText(
    request.body.biography,
    1000,
  );

  if (name.length < 2) {
    return sendError(response, "Digite um nome válido.");
  }

  await transaction(async (client) => {
    await client.query(
      `
        UPDATE users
        SET name = $2
        WHERE id = $1
      `,
      [request.user.id, name],
    );

    await client.query(
      `
        UPDATE user_profiles
        SET
          daily_goal_minutes = $2,
          preferred_study_time = $3,
          biography = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `,
      [
        request.user.id,
        dailyGoalMinutes,
        preferredStudyTime,
        biography,
      ],
    );

    await client.query(
      `
        UPDATE user_preferences
        SET
          sound_enabled = $2,
          music_enabled = $3,
          microphone_enabled = $4,
          notifications_enabled = $5,
          dark_mode = $6,
          reduced_motion = $7,
          left_handed_mode = $8,
          transliteration_enabled = $9,
          auto_play_audio = $10,
          speech_rate = $11,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `,
      [
        request.user.id,
        request.body.soundEnabled !== false,
        request.body.musicEnabled !== false,
        request.body.microphoneEnabled !== false,
        request.body.notificationsEnabled !== false,
        Boolean(request.body.darkMode),
        Boolean(request.body.reducedMotion),
        Boolean(request.body.leftHandedMode),
        request.body.transliterationEnabled !== false,
        Boolean(request.body.autoPlayAudio),
        clamp(request.body.speechRate || 0.9, 0.5, 1.5),
      ],
    );
  });

  const user = await getFullUser(request.user.id);

  return sendSuccess(response, {
    message: "Perfil atualizado.",
    user,
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível atualizar o perfil.",
    500,
  );
}
```

},
);

app.get(
"/api/notifications",
authMiddleware,
async (request, response) => {
try {
const result = await query(
`           SELECT *
          FROM notifications
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT 50
        `,
[request.user.id],
);

```
  return sendSuccess(response, {
    notifications: result.rows,
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível carregar as notificações.",
    500,
  );
}
```

},
);

app.patch(
"/api/notifications/:notificationId/read",
authMiddleware,
async (request, response) => {
try {
await query(
`           UPDATE notifications
          SET read_at = CURRENT_TIMESTAMP
          WHERE id = $1
          AND user_id = $2
        `,
[
request.params.notificationId,
request.user.id,
],
);

```
  return sendSuccess(response, {
    message: "Notificação marcada como lida.",
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível atualizar a notificação.",
    500,
  );
}
```

},
);

app.get(
"/api/admin/users",
authMiddleware,
adminMiddleware,
async (request, response) => {
try {
const result = await query(
`           SELECT
            u.id,
            u.name,
            u.email,
            u.role,
            u.account_status,
            u.email_verified,
            u.onboarding_completed,
            u.last_login_at,
            u.created_at,
            COALESCE(us.total_xp, 0) AS total_xp,
            COALESCE(us.activities_completed, 0) AS activities_completed
          FROM users u
          LEFT JOIN user_stats us ON us.user_id = u.id
          ORDER BY u.created_at DESC
          LIMIT 500
        `,
);

```
  return sendSuccess(response, {
    users: result.rows,
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível carregar os usuários.",
    500,
  );
}
```

},
);

app.patch(
"/api/admin/users/:userId/status",
authMiddleware,
adminMiddleware,
async (request, response) => {
try {
const status = request.body.status;

```
  if (!["active", "blocked", "deleted"].includes(status)) {
    return sendError(response, "Status inválido.");
  }

  await query(
    `
      UPDATE users
      SET account_status = $2
      WHERE id = $1
    `,
    [
      request.params.userId,
      status,
    ],
  );

  return sendSuccess(response, {
    message: "Status da conta atualizado.",
  });
} catch (error) {
  console.error(error);

  return sendError(
    response,
    "Não foi possível atualizar a conta.",
    500,
  );
}
```

},
);

app.get("*", (request, response) => {
const indexPath = path.join(__dirname, "index.html");

if (!fs.existsSync(indexPath)) {
return response
.status(404)
.send("Arquivo index.html não encontrado.");
}

return response.sendFile(indexPath);
});

app.use((error, request, response, next) => {
console.error("Erro inesperado:", error);

if (response.headersSent) {
return next(error);
}

return sendError(
response,
"O servidor encontrou um erro inesperado.",
500,
IS_PRODUCTION ? null : error.message,
);
});

const server = app.listen(PORT, async () => {
console.log(`PUTIRUSU iniciado em http://localhost:${PORT}`);

await ensureDatabaseConnection();
await removeExpiredSessions();
});

function shutdown(signal) {
console.log(`${signal} recebido. Encerrando servidor...`);

server.close(async () => {
await pool.end();
process.exit(0);
});

setTimeout(() => {
process.exit(1);
}, 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (error) => {
console.error("Promessa rejeitada sem tratamento:", error);
});

process.on("uncaughtException", (error) => {
console.error("Erro não capturado:", error);
});
