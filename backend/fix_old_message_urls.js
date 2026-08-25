const db = require('./config/db');

async function fixOldUrls() {
  await db.initDatabase();
  const rows = await db.query("SELECT id, content FROM messages WHERE content LIKE '%localhost%'");
  for (const row of rows) {
    const newContent = row.content.replace(/http:\/\/localhost:5001/g, '');
    await db.query("UPDATE messages SET content = ? WHERE id = ?", [newContent, row.id]);
    console.log(`Updated message #${row.id}: ${row.content} -> ${newContent}`);
  }
  console.log('✅ Finished updating old localhost URLs in MySQL.');
  process.exit(0);
}

fixOldUrls();
