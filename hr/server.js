const REQUEST_TIME_LIMIT_SEC = 30; // リクエストの時間制限（秒）

// ./.env に GROUP_ADD_PASSWORD=xxxxx と記述
// 本番環境でも同様に.envファイルを作成し、
// 環境変数でグループ追加のパスワード必須とする

const express = require('express');
const nodemailer = require('nodemailer');
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
    console.log(`foo`);
});


// メール送信の処理
// メール送信用トランスポート設定（例：Gmail）
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    // .ENVのEMAIL_ADDRESS
    user: process.env.EMAIL_ADDRESS,          // Gmailのメールアドレス
    // .ENVのEMAIL_PASSWORD
    pass: process.env.EMAIL_PASSWORD,         // Gmailのパスワード
  },
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
  console.log("check_group_password");
  console.log(group_id, password);
    const group_password = db.prepare('SELECT * FROM groups_passwords WHERE group_id = ?').get(group_id);
    console.log(group_password.password, password);
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
    db.exec('DELETE FROM groups_passwords');

// リクエストテーブルを追加
// リクエスト元のグループ、リクエスト先のプロフィール、リクエスト先のプロフィールのグループ、リクエスト日時
  db.exec(`DROP TABLE IF EXISTS requests`);


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
      detail TEXT,
      email TEXT,
      subscribe INTEGER,
      subscribe_from TEXT
    );
    CREATE TABLE IF NOT EXISTS groups_passwords (
      group_id INTEGER PRIMARY KEY,
      password TEXT
    );
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY,
      group_id INTEGER,
      profile_id INTEGER,
      group_id_from INTEGER,
      created_at TEXT
    );
  `);

  
  // 初期データ挿入
  const insertProfile = db.prepare('INSERT INTO profiles (id, name, bio, group_id, status) VALUES (?, ?, ?, ?, ?)');
  // const insertGroup = db.prepare('INSERT INTO groups (id, name, detail, subscribe, subscribe_from) VALUES (?, ?, ?, ?, ?)');
  // emailを追加
  const insertGroup = db.prepare('INSERT INTO groups (id, name, detail, email, subscribe, subscribe_from) VALUES (?, ?, ?, ?, ?, ?)');
  
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

    // emailを追加
  let groups_data = [
      { id: 1, name: 'グループ A', detail: '東京都渋谷区', email: 'noreply1@gmail', subscribe: 0, subscribe_from: JSON.stringify([2, 3]) },
      { id: 2, name: 'グループ B', detail: '東京都新宿区', email: 'noreply2@gmail', subscribe: 0, subscribe_from: JSON.stringify([1]) },
      { id: 3, name: 'グループ C', detail: '東京都港区', email: 'acabbbccc@gmail', subscribe: 0, subscribe_from: JSON.stringify([1]) },
  ];
  // let groups_data = [
  //     { id: 1, name: 'グループ A', detail: '東京都渋谷区', subscribe: 0, subscribe_from: JSON.stringify([2, 3]) },
  //     { id: 2, name: 'グループ B', detail: '東京都新宿区', subscribe: 0, subscribe_from: JSON.stringify([1]) },
  //     { id: 3, name: 'グループ C', detail: '東京都港区', subscribe: 0, subscribe_from: JSON.stringify([1]) },
  // ];
  
// データを挿入
  profiles_data.forEach((profile) => {
    insertProfile.run(profile.id, profile.name, profile.bio, profile.group, profile.status);
  });
  groups_data.forEach((group) => {
      // emailを追加
    insertGroup.run(group.id, group.name, group.detail, group.email, group.subscribe, group.subscribe_from);
    // insertGroup.run(group.id, group.name, group.detail, group, group.subscribe, group.subscribe_from);
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
  console.log( name, bio, group_id, status, req.body.password );
  const error = check_group_password(req.body.group_id, req.body.password) ? null : 'Invalid password';
  if (error) {return res.status(403).json({ message: error }) };

  const result = db.prepare('INSERT INTO profiles (name, bio, group_id, status) VALUES (?, ?, ?, ?)').run(name, bio, group_id, status);
  res.json({ id: result.lastInsertRowid });
});

app.post('/test', (req, res) => {
  console.log("test");
});

app.get('/groups', (req, res) => {
  // email以外のカラムを表示
  const groups = db.prepare('SELECT id, name, detail, subscribe, subscribe_from FROM groups').all();
  res.json(groups);
});

app.post('/groups', (req, res) => {
    // emailを追加
  const { name, detail, email, subscribe, subscribe_from, password } = req.body;
  // const { name, detail, subscribe, subscribe_from, password } = req.body;
  console.log(password);

  // パスワードの検証
  if (!password || password !== process.env.GROUP_ADD_PASSWORD) {
    console.log('group password Invalid password');
    return res.status(403).json({ message: 'group password Invalid password' });
  }

  console.log('Invalid password2');
  // subscribeを0または1に変換
  const subscribeValue = subscribe ? 1 : 0;
  console.log('Invalid password3');

    // emailを追加
  const result = db.prepare('INSERT INTO groups (name, detail, email, subscribe, subscribe_from) VALUES (?, ?, ?, ?, ?)').run(name, detail, email, subscribeValue, JSON.stringify(subscribe_from));
  // const result = db.prepare('INSERT INTO groups (name, detail, subscribe, subscribe_from) VALUES (?, ?, ?, ?)').run(name, detail, subscribeValue, JSON.stringify(subscribe_from));

  make_group_password(result.lastInsertRowid);
    //   新規のgroupパスワードを取得
    const new_group_password = db.prepare('SELECT * FROM groups_passwords WHERE group_id = ?').get(result.lastInsertRowid);

  console.log('Invalid password4');
  res.json({ id: result.lastInsertRowid,
            password: new_group_password.password });

});


app.post('/profiles/delete', (req, res) => {
  console.log(req.body.profile_id);
  console.log(req.body.group_id);
  console.log(req.body.password);
  const error = check_group_password(req.body.group_id, req.body.password) ? null : 'Invalid password';
  if (error) {return res.status(403).json({ message: error }) };
  db.prepare('DELETE FROM profiles WHERE id = ?').run(req.body.profile_id);
  res.json({
    status: 'OK',
     message: 'Profile deleted' });
});

app.post('/groups/delete/:id', (req, res) => {
  const { id } = req.params;
  const error = check_group_password(id, req.body.password) ? null : 'Invalid password';
  if (error) {return res.status(403).json({ message: error }) };

  db.prepare('DELETE FROM groups WHERE id = ?').run(id);
  res.json({ message: 'Group deleted' });
});


// update_profileは削除(不要)
app.post('/groups/:id', (req, res) => {
  const { id } = req.params;
    // emailを追加
  const { name, detail, email, subscribe, subscribe_from } = req.body;
  // const { name, detail, subscribe, subscribe_from } = req.body;
  console.log(1);
  console.log(req.body.password);

  // subscribeを0または1に変換
  const subscribeValue = subscribe ? 1 : 0;
console.log("req.body.group_id");
console.log(req.body.group_id);
  const error = check_group_password(id, req.body.password) ? null : 'Invalid password';
  if (error) {return res.status(403).json({ message: error }) };
  console.log(2);

  db.prepare(
      // emailを追加
    'UPDATE groups SET name = ?, detail = ?, email = ?, subscribe = ?, subscribe_from = ? WHERE id = ?')
    // 'UPDATE groups SET name = ?, detail = ?, subscribe = ?, subscribe_from = ? WHERE id = ?')
      // emailを追加
    .run(name, detail, email, subscribeValue, JSON.stringify(subscribe_from), id);
    // .run(name, detail, subscribeValue, JSON.stringify(subscribe_from), id);

    console.log(3);
  res.json({ message: 'Group updated' });
});

// const response = await fetch('http://localhost:3000/request_profiles', { 
//   profile_id: profile_id,
//   group_id: group_id,
//   password: password
// });

app.post('/request_profiles', async (req, res) => {
  const { profile_id, group_id, password } = req.body;
  console.log("request_profiles");

  // パスワードの検証
  const error = check_group_password(group_id, password) ? null : 'Invalid password';
  if (error) {
    return res.status(403).json({ message: error });
  }

  // requestsテーブルにリクエストを追加(n秒以内の同じリクエストはエラー)
  // n秒の制限は定数REQUEST_TIME_LIMIT_SECで定義
  const existingRequest = db.prepare(`
    SELECT * FROM requests 
    WHERE group_id = ? AND profile_id = ? 
    AND created_at > datetime('now', ? || ' seconds')
  `).get(group_id, profile_id, -REQUEST_TIME_LIMIT_SEC);

  if (existingRequest) {
    return res.status(403).json({ message: 'Request already made within the time limit' });
  }

  db.prepare(`
    INSERT INTO requests (group_id, profile_id, group_id_from, created_at) 
    VALUES (?, ?, ?, datetime('now'))
  `).run(group_id, profile_id, req.body.group_id_from);

// プロフィールの所属するグループにメールを送信
  const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(group_id);
  const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(profile_id);
  const email = group.email;
  const profile_name = profile.name;
  const profile_group = db.prepare('SELECT * FROM groups WHERE id = ?').get(profile.group_id);
  const profile_group_name = profile_group.name;
  const profile_group_id = profile.group_id;
  const profile_group_email = profile_group.email;
  // const profile_group_password = db.prepare('SELECT * FROM groups_passwords WHERE group_id = ?').get(profile_group_id);
  // const profile_group_password_value = profile_group_password.password;
  // メール送信の処理
  const emailTemplate = (recipient, profile_name, group_name) => `
${profile_name}さんからのリクエストです
${recipient}様!

これはHRシェアのリクエスト通知メールです。
${group_name}から${profile_name}さんがリクエストを送信しました。

このリクエストを確認するには、以下の情報を使用してください：
グループ名: ${group_name}
プロフィール名: ${profile_name}

よろしくお願いいたします。
HRシェア`;
const to = group.email;
console.log(to);
if (!to) {
  return res.status(400).json({ error: 'Email address is required.' });
}
console.log(1);

const from_data = '"HRシェア" <your_email@gmail.com>';
const subject_data = 'HRシェアのお支払い請求のテストメールです';
try {
  await transporter.sendMail({
    from: from_data,
    to,
    subject: subject_data,
    text: emailTemplate(to, price),
  });
  console.log(2);

  res.json({ success: true, message: `Email sent to ${to}` });
  console.log(3);
} catch (error) {
  console.log(4);
  console.error(error);
  res.status(500).json({ success: false, error: 'Failed to send email.' });
}

  // メール送信の処理
  console.log("メール送信の処理完了");

  res.json({
    status: 'OK',
     message: 'Request sent'
  });
});

// 全部のリクエストの取得 email以外のカラムを表示
app.get('/all_requests', (req, res) => {
  const requests = db.prepare(`
    SELECT requests.*, profiles.name AS profile_name, groups.name AS group_name
    FROM requests
  `).all();

  res.json(requests);
}
);






// サブスクライブ機能は削除
// toggle_subscribe
// app.post('/toggle', (req, res) => {
//   console.log('toggle');
//   const { group_id } = req.body;
//   const { subscribe_group_id } = req.body;
//   const subscribe_group = db.prepare('SELECT * FROM groups WHERE id = ?').get(subscribe_group_id);
//   const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(group_id);
//   const error = check_group_password(subscribe_group_id, req.body.password) ? null : 'Invalid password';
//   if (error) {return res.status(403).json({ message: error }) };
//   const new_subscribe_from = JSON.parse(subscribe_group.subscribe_from);
//   new_subscribe_from.push(group_id);
//   db.prepare('UPDATE groups SET subscribe_from = ? WHERE id = ?')
//     .run(JSON.stringify(new_subscribe_from), group_id);
//   const new_subscribe = group.subscribe ? 0 : 1;
//   db.prepare('UPDATE groups SET subscribe = ? WHERE id = ?')
//     .run(new_subscribe, subscribe_group_id);
//   res.json({ message: 'Group updated' });
// });




app.post('/sendemail', async (req, res) => {
  const { to, price } = req.body;
  // toとpriceが空欄の場合はエラー処理で終了
  if (!to) {
    return res.status(400).json({ error: 'Email address is required.' });
  }
  if (!price) {
    return res.status(400).json({ error: 'Price is required.' });
  }

  // テンプレート文章
const emailTemplate = (recipient, price) => `
${price}円のお支払い請求のテストメールです

${recipient}様!

これはHRシェアの請求サービスのメールです。
${price}円のお支払いをお願いします。
`;
const from_data = '"HRシェア" <your_email@gmail.com>';
const subject_data = 'HRシェアのお支払い請求のテストメールです';


  console.log(to);
  if (!to) {
    return res.status(400).json({ error: 'Email address is required.' });
  }
  console.log(1);

  try {
    await transporter.sendMail({
      from: from_data,
      to,
      subject: subject_data,
      text: emailTemplate(to, price),
    });
    console.log(2);

    res.json({ success: true, message: `Email sent to ${to}` });
    console.log(3);
  } catch (error) {
    console.log(4);
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to send email.' });
  }
});

