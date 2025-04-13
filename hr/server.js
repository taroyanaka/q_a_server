const REQUEST_TIME_LIMIT_SEC = 30; // リクエストの時間制限（秒）

// ./.env に GROUP_ADD_PASSWORD=xxxxx と記述
// 本番環境でも同様に.envファイルを作成し、
// 環境変数でグループ追加のパスワード必須とする


// 開発状況:
// success=>success=>success

// !!groups全てのアドレスがafaになっているから依頼元をacaにする必要がある

// サイト=>メールボックス=>メールボックス
// aca=>afa=>aca
// リクエスト(依頼元)=>レンタルOK(依頼先)=>レンタルOK通知(依頼元)
// request_profiles=>rental_ok=>rental_ok_notify

const rental_ok_endpoint_url = 'http://localhost:3000/rental_ok/';
const rental_ok_notify_endpoint_url = 'http://localhost:3000/rental_ok_notify/';

const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const cors = require('cors');
const dotenv = require('dotenv'); // dotenvのインポート

dotenv.config(); // 環境変数を読み込むために追加
const price = process.env.PRICE;
console.log('priceは');
console.log(price);


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
  //   db.exec('DELETE FROM profiles');
  //   db.exec('DELETE FROM groups');
  //   db.exec('DELETE FROM groups_passwords');
  // db.exec(`DELETE FROM requests`);
  db.exec('DROP TABLE IF EXISTS profiles');
  db.exec('DROP TABLE IF EXISTS groups');
  db.exec('DROP TABLE IF EXISTS groups_passwords');
  db.exec('DROP TABLE IF EXISTS requests');


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

  // requestsテーブルのサンプルデータを1レコード追加
  const insertRequest = db.prepare('INSERT INTO requests (group_id, profile_id, group_id_from, created_at) VALUES (?, ?, ?, ?)');
  
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
      { id: 1, name: 'グループ A', detail: '東京都渋谷区', email: process.env.TO_EMAIL_ADDRESS, subscribe: 0, subscribe_from: JSON.stringify([2, 3]) },
      // プロセスエンヴのEMAIL_ADDRESSを使う
      { id: 2, name: 'グループ B', detail: '東京都新宿区', email: process.env.TO_EMAIL_ADDRESS, subscribe: 0, subscribe_from: JSON.stringify([1]) },
      { id: 3, name: 'グループ C', detail: '東京都港区', email: process.env.TO_EMAIL_ADDRESS, subscribe: 0, subscribe_from: JSON.stringify([1]) },
  ];

  let requests_data = [
    { group_id: 1, profile_id: 2, group_id_from: 3, created_at: '2023-10-01T12:00:00Z' },
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
  requests_data.forEach((request) => {
    insertRequest.run(request.group_id, request.profile_id, request.group_id_from, request.created_at);
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

app.post('/create_groups', (req, res) => {
  const { name, detail, email, subscribe, subscribe_from, password } = req.body;
  console.log(password);
  if (!password || password !== process.env.GROUP_ADD_PASSWORD) {
    console.log('group password Invalid password');
    return res.status(403).json({ message: 'group password Invalid password' });
  }
  console.log('Invalid password2');
  const subscribeValue = subscribe ? 1 : 0;
  console.log('Invalid password3');
  const result = db.prepare('INSERT INTO groups (name, detail, email, subscribe, subscribe_from) VALUES (?, ?, ?, ?, ?)').run(name, detail, email, subscribeValue, JSON.stringify(subscribe_from));
  make_group_password(result.lastInsertRowid);
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

app.post('/request_profiles', async (req, res) => {
  const { profile_id, group_id, password } = req.body;
  console.log("1 request_profiles API");
  const error = check_group_password(group_id, password) ? null : 'Invalid password';
  if (error) {
    return res.status(403).json({ message: error });
  }

  console.log("2 request_profiles API");
  const existingRequest = db.prepare(`
    SELECT * FROM requests 
    WHERE group_id = ? AND profile_id = ? 
    AND created_at > datetime('now', ? || ' seconds')
  `).get(group_id, profile_id, -REQUEST_TIME_LIMIT_SEC);

  console.log("3 request_profiles API");
  if (existingRequest) {
    console.log("3.5 request_profiles API");
    console.log("リクエスト削除ボタン押す必要ある");
    return res.status(403).json({ 
      status: 'NG',
      message: 'Request already made within the time limit' });
  }

  console.log("4 request_profiles API");
  const currentDateTime = new Date().toISOString();

  db.prepare(`
    INSERT INTO requests (group_id, profile_id, group_id_from, created_at) 
    VALUES (?, ?, ?, ?)
  `).run(group_id, profile_id, req.body.group_id_from, currentDateTime);
  console.log("5 request_profiles API");
  console.log("リクエストを追加しました");


try {
  console.log('メール送信シーケンス開始');
  const group_id_from = db.prepare('SELECT * FROM profiles WHERE id = ?').get(profile_id).group_id;
  const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(group_id_from);
  const to = group.email;
  const to_group_name = db.prepare('SELECT * FROM groups WHERE id = ?').get(group_id).name;

  if (!to) {
    console.log('メール送信シーケンス開始 to設定失敗');
    throw new Error('to is undefined');
  }
    
  if (!to_group_name) {
    console.log('メール送信シーケンス開始 to_group_name設定失敗');
    throw new Error('to_group_name is undefined');
  }

  if (!price) {
    console.log('メール送信シーケンス開始 price設定失敗');
    throw new Error('price is undefined');
  }
   
const get_paramas = `?profile_id=${profile_id}&group_id=${group_id}`;

const emailTemplate = `
${to_group_name}様!

これはHRシェアの人材レンタル依頼のメールです。
許諾をお願いします。

許可なら
${rental_ok_endpoint_url+get_paramas}をクリックしてください。
`;

  const from_data = 'テストーーーーHRシェア" <your_email@gmail.com>';
  const subject_data = 'DBからメアド取得のテストーーーーHRシェアのお支払い請求のテストメールです';

  console.log(to);
  if (!to) {
    console.log('メール送信シーケンス開始 to設定失敗');
  }
  if (!price) {
    console.log('メール送信シーケンス開始 price設定失敗');
  }

  console.log(1);

  console.log('メール送信シーケンス設定完了');
    await transporter.sendMail({
      from: from_data,
      to,
      subject: subject_data,
      text: emailTemplate,
    });
    console.log(2);

    console.log('メール送信シーケンス実行前');
    console.log('メール送信シーケンス実行後');
    console.log(3);
  } catch (error) {
    console.log(4);
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to send email.' });
  }
  console.log('メール送信シーケンス完了');
  console.log("9 request_profiles API");
  console.log("メール送信の処理完了");

  res.json({
    status: 'OK',
     message: 'Request sent'
  });
});

app.get('/rental_ok/', async (req, res) => {
  console.log("1rental_ok");
  const { profile_id } = req.query;
  const { group_id } = req.query;
  console.log("2rental_ok");
  console.log("profile_id:依頼先のプロフィールのid" );
  console.log(profile_id);
  console.log("group_id:依頼元のグループのid");
  console.log(group_id);

    // リクエストテーブルから依頼したグループのIDを取得して請求依頼のメールを送る
  // const group_id_to = db.prepare('SELECT * FROM groups WHERE id = ?').get(group_id).id;
  // console.log("group_id_to:依頼先のグループのid");
  // console.log(group_id_to);
  const to_group = db.prepare('SELECT * FROM groups WHERE id = ?').get(group_id);
  console.log("to_group:依頼先のグループの情報");
  console.log(to_group);
  const to_email = to_group.email;
  console.log("to_email:依頼先のグループのメールアドレス");
  console.log(to_email);
  const to_group_name = to_group.name;
  console.log("to_group_name:依頼先のグループの名前");
  console.log(to_group_name);
  const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(profile_id);
  console.log("profile:依頼先のプロフィールの情報");
  console.log(profile);
  const profile_name = profile.name;
  console.log("profile_name:依頼先のプロフィールの名前");
  console.log(profile_name);

  const from_group_name = db.prepare('SELECT * FROM groups WHERE id = ?').get(group_id).name;
  console.log("from_group_name:依頼元のグループの名前");
  console.log(from_group_name);

  const get_paramas = `?profile_id=${profile_id}&group_id=${group_id}`;
  console.log("get_paramas:URLのパラメータ");
  console.log(get_paramas);


    // レンタル許可テンプレート文章
const emailTemplate = `
${to_group_name}様!
これはHRシェアの人材レンタル許可のメールです。
許可ありがとうございます。
${from_group_name}様に${profile_name}様をレンタルします。
${profile_name}様は${price}円でレンタルします。
レンタルの許可をお願いします。
${profile_name}様のレンタル許可をお願いします。
${from_group_name}様にレンタルします。

許可であれば${rental_ok_notify_endpoint_url+get_paramas}をクリックしてください。
レンタルNGであれば、何もクリックしないでください。
`;
console.log("emailTemplate:メールのテンプレート");
console.log(emailTemplate);

try {
  console.log('メール送信シーケンス開始');
  const from_data = '"HRシェア" <your_email@gmail.com>';
  const subject_data = 'HRシェアの人材レンタル許可のメールです';

  await transporter.sendMail({
    from: from_data,
    to: to_email,
    subject: subject_data,
    text: emailTemplate,
  });

  console.log('メール送信シーケンス完了');
  res.json({ success: true, message: `Email sent to ${to_email}` });
} catch (error) {
  console.error('メール送信エラー:', error);
  res.status(500).json({ success: false, error: 'Failed to send email.' });
}
// リクエストのテーブルから削除
  // db.prepare('DELETE FROM requests WHERE profile_id = ?').run(profile_id);
  console.log("リクエスト削除");
  res.json({
    status: 'OK',
     message: 'Request deleted'
  });
}
);


// rental_ok_notify
app.get('/rental_ok_notify/', async (req, res) => {
  console.log("1 rental_ok_notify");
  const { profile_id } = req.query;
  const { group_id } = req.query;
  console.log("2 rental_ok_notify");
  console.log("profile_id:依頼先のプロフィールのid" );
  console.log(profile_id);
  const profile_name = db.prepare('SELECT * FROM profiles WHERE id = ?').get(profile_id).name;
  console.log("profile_name:依頼先のプロフィールの名前");
  console.log(profile_name);
  console.log("group_id:依頼元のグループのid");
  console.log(group_id);
  // from_group_name
  const from_group_name = db.prepare('SELECT * FROM groups WHERE id = ?').get(group_id).name;
  console.log("from_group_name:依頼元のグループの名前");
  console.log(from_group_name);
  const to_group = db.prepare('SELECT * FROM groups WHERE id = ?').get(group_id);
  console.log("to_group:依頼先のグループの情報");
  console.log(to_group);
  const to_email = to_group.email;
  console.log("to_email:依頼先のグループのメールアドレス");
  console.log(to_email);
  const to_group_name = to_group.name;
  console.log("to_group_name:依頼先のグループの名前");
  console.log(to_group_name);

  // レンタル許可通知テンプレート文章
const emailTemplate = `
${from_group_name}様!

これはHRシェアの人材レンタル許可通知のメールです。
${to_group_name}様が${profile_name}様をレンタルすることを許可しました。

レンタル料金: ${price}円

詳細については、HRシェアの管理画面をご確認ください。

よろしくお願いいたします。`;
try {
  console.log('メール送信シーケンス開始');
  const from_data = '"HRシェア" <your_email@gmail.com>';
  const subject_data = 'HRシェアの人材レンタル許可通知のメールです';

  await transporter.sendMail({
    from: from_data,
    to: to_email,
    subject: subject_data,
    text: emailTemplate,
  });

  console.log('メール送信シーケンス完了');
  res.json({ success: true, message: `Email sent to ${to_email}` });
  console.log("メール送信の処理完了");
} catch (error) {
  console.error('メール送信エラー:', error);
  res.status(500).json({ success: false, error: 'Failed to send email.' });
}

  // console.log("リクエスト削除");
  // リクエストのテーブルから削除
  // db.prepare('DELETE FROM requests WHERE profile_id = ?').run(profile_id);
  // console.log("リクエスト削除");
  res.json({
    status: 'OK',
      message: 'Request deleted'
  });
}
);


// 全部のリクエストの取得 email以外のカラムを表示
app.get('/all_requests', (req, res) => {
  console.log("1 all_requests");
  // requestsテーブルから全てのリクエストを取得
  // email以外のカラムを表示
  const requests = db.prepare(`
    SELECT requests.id, requests.group_id, requests.profile_id, requests.group_id_from, requests.created_at FROM requests
  `).all();
  console.log("2 all_requests");
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


// 全部のリクエストを削除(開発用)
app.get('/delete_all_requests', (req, res) => {
  // レコードを全て削除
  db.exec('DELETE FROM requests');
  res.json({ 
    status: 'OK',
      message: 'All requests deleted' });
  console.log("All requests deleted");
}
);


