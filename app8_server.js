const express = require('express');
const sqlite = require('better-sqlite3');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const port = 8000;
app.listen(port, "0.0.0.0", () => {
  console.log(`App listening at http://localhost:${port}`);
});

const db = new sqlite('app8.db');
const hashUid = (uid) => crypto.createHash('sha256').update(uid).digest('hex');

const handleError = (res, error) => res.status(500).send('Internal Server Error');

// 初期化エンドポイント
app.post('/app8/app8_init', (req, res) => {
  try {
    console.log(req.body);
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, uid TEXT UNIQUE, created_at TEXT, updated_at TEXT);
      CREATE TABLE IF NOT EXISTS articles (id INTEGER PRIMARY KEY, user_id TEXT, article TEXT, created_at TEXT, updated_at TEXT);
      CREATE TABLE IF NOT EXISTS mails (id INTEGER PRIMARY KEY, article_id INTEGER, mail TEXT, created_at TEXT, updated_at TEXT);
      CREATE TABLE IF NOT EXISTS likes (id INTEGER PRIMARY KEY, user_id TEXT, article_id INTEGER, created_at TEXT, updated_at TEXT);
      CREATE TABLE IF NOT EXISTS bookmarks (id INTEGER PRIMARY KEY, user_id TEXT, article_id INTEGER, created_at TEXT, updated_at TEXT);
      CREATE TABLE IF NOT EXISTS articles_tags (id INTEGER PRIMARY KEY, article_id INTEGER, tag_id INTEGER, created_at TEXT, updated_at TEXT);
      CREATE TABLE IF NOT EXISTS tags (id INTEGER PRIMARY KEY, tag TEXT, created_at TEXT, updated_at TEXT);
    `);
    res.status(200).send('Database initialized');
  } catch (error) {
    handleError(res, error);
  }
});

// サンプルデータ挿入エンドポイント
app.post('/app8/app8_insert_sample', (req, res) => {
  try {
    console.log(req.body);
    db.exec(`
      INSERT INTO users (uid, created_at, updated_at) VALUES ('sample_uid', '2023-01-01', '2023-01-01');
      INSERT INTO articles (user_id, article, created_at, updated_at) VALUES ('sample_uid', 'Sample Article', '2023-01-01', '2023-01-01');
      INSERT INTO mails (article_id, mail, created_at, updated_at) VALUES (1, 'sample@mail.com', '2023-01-01', '2023-01-01');
      INSERT INTO likes (user_id, article_id, created_at, updated_at) VALUES ('sample_uid', 1, '2023-01-01', '2023-01-01');
      INSERT INTO bookmarks (user_id, article_id, created_at, updated_at) VALUES ('sample_uid', 1, '2023-01-01', '2023-01-01');
      INSERT INTO tags (tag, created_at, updated_at) VALUES ('sample_tag', '2023-01-01', '2023-01-01');
      INSERT INTO articles_tags (article_id, tag_id, created_at, updated_at) VALUES (1, 1, '2023-01-01', '2023-01-01');
    `);
    res.status(200).send('Sample data inserted');
  } catch (error) {
    handleError(res, error);
  }
});

// 全データ取得エンドポイント
app.get('/app8/app8_read_all', (req, res) => {
  try {
    console.log(req.query);
    const users = db.prepare('SELECT * FROM users').all();
    const articles = db.prepare('SELECT * FROM articles').all();
    const mails = db.prepare('SELECT * FROM mails').all();
    const likes = db.prepare('SELECT * FROM likes').all();
    const bookmarks = db.prepare('SELECT * FROM bookmarks').all();
    const tags = db.prepare('SELECT * FROM tags').all();
    const articles_tags = db.prepare('SELECT * FROM articles_tags').all();
    let result = {};
    users.forEach(user => {
      user.articles = articles.filter(article => article.user_id === user.uid);
      user.articles.forEach(article => {
        article.mails = mails.filter(mail => mail.article_id === article.id);
        article.likes = likes.filter(like => like.article_id === article.id);
        article.bookmarks = bookmarks.filter(bookmark => bookmark.article_id === article.id);
        article.tags = articles_tags.filter(articles_tag => articles_tag.article_id === article.id).map(articles_tag => tags.find(tag => tag.id === articles_tag.tag_id));
      });
      result[user.uid] = user;
    });
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error);
  }
});

// メール作成エンドポイント
app.post('/app8/mails/create', (req, res) => {
  try {
    console.log(req.body);
    const { uid, article_id, mail } = req.body;
    if (!uid || uid.length > 100 || !article_id || !mail) return res.status(400).send('Invalid input');
    db.prepare('INSERT INTO mails (article_id, mail, created_at, updated_at) VALUES (?, ?, ?, ?)').run(article_id, mail, new Date(), new Date());
    res.status(201).send('Mail created');
  } catch (error) {
    handleError(res, error);
  }
});

// メール更新エンドポイント
app.post('/app8/mails/update', (req, res) => {
  try {
    console.log(req.body);
    const { uid, mail, id } = req.body;
    if (!uid || uid.length > 100 || !mail || !id) return res.status(400).send('Invalid input');
    db.prepare('UPDATE mails SET mail = ?, updated_at = ? WHERE id = ?').run(mail, new Date(), id);
    res.status(200).send('Mail updated');
  } catch (error) {
    handleError(res, error);
  }
});

// メール削除エンドポイント
app.post('/app8/mails/delete', (req, res) => {
  try {
    console.log(req.body);
    const { uid, id } = req.body;
    if (!uid || uid.length > 100 || !id) return res.status(400).send('Invalid input');
    db.prepare('DELETE FROM mails WHERE id = ?').run(id);
    res.status(200).send('Mail deleted');
  } catch (error) {
    handleError(res, error);
  }
});

// いいね作成エンドポイント
app.post('/app8/likes/create', (req, res) => {
  try {
    console.log(req.body);
    const { uid, article_id } = req.body;
    if (!uid || uid.length > 100 || !article_id) return res.status(400).send('Invalid input');
    db.prepare('INSERT INTO likes (user_id, article_id, created_at, updated_at) VALUES (?, ?, ?, ?)').run(hashUid(uid), article_id, new Date(), new Date());
    res.status(201).send('Like created');
  } catch (error) {
    handleError(res, error);
  }
});

// いいね削除エンドポイント
app.post('/app8/likes/delete', (req, res) => {
  try {
    console.log(req.body);
    const { uid, article_id } = req.body;
    if (!uid || uid.length > 100 || !article_id) return res.status(400).send('Invalid input');
    db.prepare('DELETE FROM likes WHERE user_id = ? AND article_id = ?').run(hashUid(uid), article_id);
    res.status(200).send('Like deleted');
  } catch (error) {
    handleError(res, error);
  }
});

// ブックマーク作成エンドポイント
app.post('/app8/bookmarks/create', (req, res) => {
  try {
    console.log(req.body);
    const { uid, article_id } = req.body;
    if (!uid || uid.length > 100 || !article_id) return res.status(400).send('Invalid input');
    db.prepare('INSERT INTO bookmarks (user_id, article_id, created_at, updated_at) VALUES (?, ?, ?, ?)').run(hashUid(uid), article_id, new Date(), new Date());
    res.status(201).send('Bookmark created');
  } catch (error) {
    handleError(res, error);
  }
});

// ブックマーク削除エンドポイント
app.post('/app8/bookmarks/delete', (req, res) => {
  try {
    console.log(req.body);
    const { uid, article_id } = req.body;
    if (!uid || uid.length > 100 || !article_id) return res.status(400).send('Invalid input');
    db.prepare('DELETE FROM bookmarks WHERE user_id = ? AND article_id = ?').run(hashUid(uid), article_id);
    res.status(200).send('Bookmark deleted');
  } catch (error) {
    handleError(res, error);
  }
});

// タグ作成エンドポイント
app.post('/app8/tags/create', (req, res) => {
  try {
    console.log(req.body);
    const { uid, tag } = req.body;
    if (!uid || uid.length > 100 || !tag || tag.length > 10) return res.status(400).send('Invalid input');
    db.prepare('INSERT INTO tags (tag, created_at, updated_at) VALUES (?, ?, ?)').run(tag, new Date(), new Date());
    res.status(201).send('Tag created');
  } catch (error) {
    handleError(res, error);
  }
});

// タグ削除エンドポイント
app.post('/app8/tags/delete', (req, res) => {
  try {
    console.log(req.body);
    const { uid, id } = req.body;
    if (!uid || uid.length > 100 || !id) return res.status(400).send('Invalid input');
    db.prepare('DELETE FROM tags WHERE id = ?').run(id);
    res.status(200).send('Tag deleted');
  } catch (error) {
    handleError(res, error);
  }
});