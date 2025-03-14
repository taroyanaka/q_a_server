// この後やること以下の関数のエンドポイントへの追加実装
// each_make_groups_passwords
// make_group_password
// check_group_password

// ./.env に GROUP_ADD_PASSWORD=xxxxx と記述
// 本番環境でも同様に.envファイルを作成し、
// 環境変数でグループ追加のパスワード必須とする

const express = require('express');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const cors = require('cors');
const dotenv = require('dotenv'); // dotenvのインポート

dotenv.config(); // 環境変数を読み込むために追加

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const db = new Database('./hr.db');
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


function each_make_groups_passwords() {
    const groups = db.prepare('SELECT * FROM groups').all();
    // groups_passwordsというテーブルを作り、そこにgroup_idとpasswordを入れる
    const insertGroupPassword = db.prepare('INSERT INTO groups_passwords (group_id, password) VALUES (?, ?)');
    groups.forEach((group) => {
        insertGroupPassword.run(group.id, "pass"+group.id);
    });
}
// 新規のグループを追加する際にパスワードを設定する関数
function make_group_password(group_id) {
    const password = "pass"+group_id;
    db.prepare('INSERT INTO groups_passwords (group_id, password) VALUES (?, ?)').run(group_id, password);
}
// groups_passwordsのidとパスワードをチェックする関数
function check_group_password(group_id, password) {
    const group_password = db.prepare('SELECT * FROM groups_passwords WHERE group_id = ?').get(group_id);
    if (group_password.password === password) {
        return true;
    } else {
        return false;
    }
}


// initialize endpoint
app.get('/initialize', (req, res) => {
    // 既存のテーブルを全て削除
    db.exec('DELETE FROM profiles');
    db.exec('DELETE FROM groups');
    // groups_passwordsというテーブルを作り、そこにgroup_idとpasswordを入れる
    db.exec('DELETE FROM groups_passwords');

    // テーブル作成
db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY,
      name TEXT,
      bio TEXT,
      group_id INTEGER,
      status TEXT
    );
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY,
      name TEXT,
      address TEXT,
      hours TEXT,
      subscribe INTEGER,
      subscribe_from TEXT
    );
    CREATE TABLE IF NOT EXISTS groups_passwords (
      group_id INTEGER PRIMARY KEY,
      password TEXT
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
  
// データを挿入
  profiles_data.forEach((profile) => {
    insertProfile.run(profile.id, profile.name, profile.bio, profile.group, profile.status);
  });
  groups_data.forEach((group) => {
    insertGroup.run(group.id, group.name, group.address, group.hours, group.subscribe, group.subscribe_from);
  });
//   パスワードを設定
    each_make_groups_passwords();

  res.json({ message: 'Database initialized' });
});

// CRUDエンドポイント
app.get('/profiles', (req, res) => {
  const profiles = db.prepare('SELECT * FROM profiles').all();
  res.json(profiles);
});

app.post('/profiles', (req, res) => {
  const { name, bio, group_id, status } = req.body;
      // idでcheckしてfalseならエラーメッセージを返す
      const error = check_group_password(id, req.body.password) ? null : 'Invalid password';
      if (error) {
          return res.status(403).json({ message: error });
      }
  const result = db.prepare('INSERT INTO profiles (name, bio, group_id, status) VALUES (?, ?, ?, ?)').run(name, bio, group_id, status);
  res.json({ id: result.lastInsertRowid });
});

app.post('/profiles_update', (req, res) => {
    console.log("profiles_update");
  const { id, name, bio, group_id, status } = req.body;
  console.log({ name, bio, group_id, status }); // 修正
  db.prepare('UPDATE profiles SET name = ?, bio = ?, group_id = ?, status = ? WHERE id = ?').run(name, bio, group_id, status, id);
  res.json({ message: 'Profile updated' });
});

app.post('/test', (req, res) => {
  console.log("test");
});

app.post('/profiles/delete/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM profiles WHERE id = ?').run(id);
    // idでcheckしてfalseならエラーメッセージを返す
    const error = check_group_password(id, req.body.password) ? null : 'Invalid password';
    if (error) {
        return res.status(403).json({ message: error });
    }
  res.json({ message: 'Profile deleted' });
});

app.get('/groups', (req, res) => {
  const groups = db.prepare('SELECT * FROM groups').all();
  res.json(groups);
});

app.post('/groups', (req, res) => {
  const { name, address, hours, subscribe, subscribe_from, password } = req.body;

  // パスワードの検証
  if (!password || password !== process.env.GROUP_ADD_PASSWORD) {
    console.log('Invalid password');
    return res.status(403).json({ message: 'Invalid password' });
  }

  console.log('Invalid password2');
  // subscribeを0または1に変換
  const subscribeValue = subscribe ? 1 : 0;
  console.log('Invalid password3');

  const result = db.prepare('INSERT INTO groups (name, address, hours, subscribe, subscribe_from) VALUES (?, ?, ?, ?, ?)').run(name, address, hours, subscribeValue, JSON.stringify(subscribe_from));
  make_group_password(result.lastInsertRowid);
    //   新規のgroupパスワードを取得
    const new_group_password = db.prepare('SELECT * FROM groups_passwords WHERE group_id = ?').get(result.lastInsertRowid);

  console.log('Invalid password4');
  res.json({ id: result.lastInsertRowid,
            password: new_group_password.password });

});

app.post('/groups/:id', (req, res) => {
  const { id } = req.params;
  const { name, address, hours, subscribe, subscribe_from } = req.body;

  // subscribeを0または1に変換
  const subscribeValue = subscribe ? 1 : 0;
      // idでcheckしてfalseならエラーメッセージを返す
      const error = check_group_password(id, req.body.password) ? null : 'Invalid password';
      if (error) {
          return res.status(403).json({ message: error });
      }

  db.prepare('UPDATE groups SET name = ?, address = ?, hours = ?, subscribe = ?, subscribe_from = ? WHERE id = ?').run(name, address, hours, subscribeValue, JSON.stringify(subscribe_from), id);
  res.json({ message: 'Group updated' });
});

app.post('/groups/delete/:id', (req, res) => {
  const { id } = req.params;
      // idでcheckしてfalseならエラーメッセージを返す
      const error = check_group_password(id, req.body.password) ? null : 'Invalid password';
      if (error) {
          return res.status(403).json({ message: error });
      }
  db.prepare('DELETE FROM groups WHERE id = ?').run(id);
  res.json({ message: 'Group deleted' });
});