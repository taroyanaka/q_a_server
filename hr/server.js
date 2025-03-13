const express = require('express');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const cors = require('cors'); // 追加
const app = express();
const port = 3000;

app.use(cors()); // 追加
app.use(bodyParser.json());

const db = new Database('./hr.db');
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// テーブル作成
db.exec(`
  CREATE TABLE profiles (
    id INTEGER PRIMARY KEY,
    name TEXT,
    bio TEXT,
    group_id INTEGER,
    status TEXT
  );
  CREATE TABLE groups (
    id INTEGER PRIMARY KEY,
    name TEXT,
    address TEXT,
    hours TEXT,
    subscribe INTEGER,
    subscribe_from TEXT
  );
`);

// 初期データ挿入
const insertProfile = db.prepare('INSERT INTO profiles (id, name, bio, group_id, status) VALUES (?, ?, ?, ?, ?)');
const insertGroup = db.prepare('INSERT INTO groups (id, name, address, hours, subscribe, subscribe_from) VALUES (?, ?, ?, ?, ?, ?)');

let profiles_data = [
    {"id": 1, "name": "悠斗","bio": "教師,研究者","group": 2,"status": "NG"},
    {"id": 2, "name": "健太","bio": "アーティスト,音楽家","group": 2,"status": "OK"},
    {"id": 3, "name": "萌","bio": "エンジニア,デザイナー","group": 3,"status": "OK"},
    {"id": 4, "name": "莉子","bio": "医者,看護師","group": 2,"status": "OK"},
    {"id": 5, "name": "彩香","bio": "マーケティング,ライター","group": 1,"status": "NG"},
    {"id": 6, "name": "大輔","bio": "医者,看護師","group": 3,"status": "OK"},
    {"id": 7, "name": "涼介","bio": "販売員,カスタマーサポート","group": 3,"status": "NG"},
    {"id": 8, "name": "玲奈","bio": "教師,研究者","group": 3,"status": "NG"},
    {"id": 9, "name": "奈々","bio": "マーケティング,ライター","group": 1,"status": "NG"},
    {"id": 10, "name": "優斗","bio": "医者,看護師","group": 2,"status": "OK"},
    {"id": 11, "name": "真由","bio": "マーケティング,ライター","group": 2,"status": "OK"},
    {"id": 12, "name": "蒼","bio": "販売員,カスタマーサポート","group": 2,"status": "NG"},
    {"id": 13, "name": "紗希","bio": "エンジニア,デザイナー","group": 3,"status": "OK"},
    {"id": 14, "name": "美咲","bio": "エンジニア,デザイナー","group": 2,"status": "NG"},
    {"id": 15, "name": "千尋","bio": "マーケティング,ライター","group": 1,"status": "NG"},
];

let groups_data = [
    { id: 1, name: 'グループ A', address: '東京都渋谷区', hours: '9:00 - 18:00', subscribe: 0, subscribe_from: JSON.stringify([2, 3]) },
    { id: 2, name: 'グループ B', address: '東京都新宿区', hours: '10:00 - 19:00', subscribe: 0, subscribe_from: JSON.stringify([1]) },
    { id: 3, name: 'グループ C', address: '東京都港区', hours: '8:00 - 17:00', subscribe: 0, subscribe_from: JSON.stringify([1]) },
];

// initialize endpoint
app.get('/initialize', (req, res) => {
  profiles_data.forEach((profile) => {
    insertProfile.run(profile.id, profile.name, profile.bio, profile.group, profile.status);
  });
  groups_data.forEach((group) => {
    insertGroup.run(group.id, group.name, group.address, group.hours, group.subscribe, group.subscribe_from);
  });
  res.json({ message: 'Database initialized' });
});

// CRUDエンドポイント
app.get('/profiles', (req, res) => {
  const profiles = db.prepare('SELECT * FROM profiles').all();
  res.json(profiles);
});

app.post('/profiles', (req, res) => {
  const { name, bio, group_id, status } = req.body;
  const result = db.prepare('INSERT INTO profiles (name, bio, group_id, status) VALUES (?, ?, ?, ?)').run(name, bio, group_id, status);
  res.json({ id: result.lastInsertRowid });
});

app.post('/profiles/:id', (req, res) => {
  const { id } = req.params;
  const { name, bio, group_id, status } = req.body;
  db.prepare('UPDATE profiles SET name = ?, bio = ?, group_id = ?, status = ? WHERE id = ?').run(name, bio, group_id, status, id);
  res.json({ message: 'Profile updated' });
});

app.post('/profiles/delete/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM profiles WHERE id = ?').run(id);
  res.json({ message: 'Profile deleted' });
});

app.get('/groups', (req, res) => {
  const groups = db.prepare('SELECT * FROM groups').all();
  res.json(groups);
});

app.post('/groups', (req, res) => {
  const { name, address, hours, subscribe, subscribe_from } = req.body;
  const result = db.prepare('INSERT INTO groups (name, address, hours, subscribe, subscribe_from) VALUES (?, ?, ?, ?, ?)').run(name, address, hours, subscribe, JSON.stringify(subscribe_from));
  res.json({ id: result.lastInsertRowid });
});

app.post('/groups/:id', (req, res) => {
  const { id } = req.params;
  const { name, address, hours, subscribe, subscribe_from } = req.body;
  db.prepare('UPDATE groups SET name = ?, address = ?, hours = ?, subscribe = ?, subscribe_from = ? WHERE id = ?').run(name, address, hours, subscribe, JSON.stringify(subscribe_from), id);
  res.json({ message: 'Group updated' });
});

app.post('/groups/delete/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM groups WHERE id = ?').run(id);
  res.json({ message: 'Group deleted' });
});

