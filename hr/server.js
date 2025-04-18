// const IN_DEV = true;
const IN_DEV = false;

// Version 1.0.0

const REQUEST_TIME_LIMIT_SEC = 30; // リクエストの時間制限（秒）

// ./.env に GROUP_ADD_PASSWORD=xxxxx と記述
// 本番環境でも同様に.envファイルを作成し、
// 環境変数でグループ追加のパスワード必須とする


// 開発状況:
// success=>success

// サイト=>メールボックス=>メールボックス
// aca=>afa=>aca
// リクエスト(依頼元から依頼先にメール送信)=>レンタルOK通知(依頼先から依頼元にメール送信)
// request_profiles(acaからafaにメール到着)=>rental_ok(afaからacaにメール到着)





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
console.log("process.env.FROM_EMAIL_ADDRESS");
console.log(process.env.FROM_EMAIL_ADDRESS);


const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const db = new Database('./.data/hr.db');
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

// 新規のグループを追加する際にパスワードをランダム生成する関数
function generate_random_password() {
    const characters = 'abcdefghijklmnopqrstuvwxyz123456789';
    const symbols = '.-_';
    let password = '';
    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        // symbolsを追加
        if (i === 2) {
            const randomSymbolIndex = Math.floor(Math.random() * symbols.length);
            password += symbols.charAt(randomSymbolIndex);
        }
        password += characters.charAt(randomIndex);
    }
    return password;
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
  try {  
    if(IN_DEV===false){throw new Error('in dev false');  res.status(403).json({ message: error })};
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


function make_sample_data_and_insert() {
  // 初期データ挿入
  const insertProfile = db.prepare('INSERT INTO profiles (id, name, bio, group_id, status) VALUES (?, ?, ?, ?, ?)');
  const insertGroup = db.prepare('INSERT INTO groups (id, name, detail, email, subscribe, subscribe_from) VALUES (?, ?, ?, ?, ?, ?)');
  // requestsテーブルのサンプルデータを1レコード追加
  const insertRequest = db.prepare('INSERT INTO requests (group_id, profile_id, group_id_from, created_at) VALUES (?, ?, ?, ?)');
  const profiles_data = [
      {"id": 1, "name": "悠斗","bio": "教師,研究者","group": 2,"status": "NG"},
      {"id": 2, "name": "健太","bio": "アーティスト,音楽家","group": 1,"status": "OK"},
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
  const groups_data = [
      { id: 1, name: 'グループ A', detail: '東京都渋谷区', email: process.env.FROM_EMAIL_ADDRESS, subscribe: 0, subscribe_from: JSON.stringify([2, 3]) },
      // プロセスエンヴのEMAIL_ADDRESSを使う
      { id: 2, name: 'グループ B', detail: '東京都新宿区', email: process.env.TO_EMAIL_ADDRESS, subscribe: 0, subscribe_from: JSON.stringify([1]) },
      { id: 3, name: 'グループ C', detail: '東京都港区', email: process.env.TO_EMAIL_ADDRESS, subscribe: 0, subscribe_from: JSON.stringify([1]) },
  ];

  const requests_data = [
    { group_id: 1, profile_id: 2, group_id_from: 3, created_at: '2023-10-01T12:00:00Z' },
  ];
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
};

// make_sample_data_and_insert();


  res.json({ message: 'Database initialized' });
} catch (error) {
  console.log("initializeのエラー");
}
});

// CRUDエンドポイント
app.get('/profiles', (req, res) => {
  const profiles = db.prepare('SELECT * FROM profiles').all();
  res.json(profiles);
});

app.post('/profiles', (req, res) => {
  try {  
    if(IN_DEV===false){throw new Error('in dev false');  res.status(403).json({ message: error })};

  const { name, bio, group_id, status } = req.body;
  console.log( name, bio, group_id, status, req.body.password );
  const error = check_group_password(req.body.group_id, req.body.password) ? null : 'Invalid password';
  if (error) {return res.status(403).json({ message: error }) };

  const result = db.prepare('INSERT INTO profiles (name, bio, group_id, status) VALUES (?, ?, ?, ?)').run(name, bio, group_id, status);
  res.json({ id: result.lastInsertRowid });
} catch (error) {
  console.log("initializeのエラー");
}
});


app.post('/update_profiles', (req, res) => {
    try {
      if(IN_DEV===false){throw new Error('in dev false');  res.status(403).json({ message: error })};

      const { id, name, bio, group_id, status, password } = req.body;
      console.log(id, name, bio, group_id, status, password);

      const error = check_group_password(group_id, password) ? null : 'Invalid password';
      if (error) {
        return res.status(403).json({ message: error });
      }

      db.prepare(
        'UPDATE profiles SET name = ?, bio = ?, group_id = ?, status = ? WHERE id = ?'
      ).run(name, bio, group_id, status, id);

      res.json({ status: 'OK', message: 'Profile updated' });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/test', (req, res) => {
  console.log("test");
  res.json({ message: 'Test endpoint' });
});

app.get('/groups', (req, res) => {
  // email以外のカラムを表示
  const groups = db.prepare('SELECT id, name, detail, subscribe, subscribe_from FROM groups').all();
  res.json(groups);
});

// app.post('/create_groups', (req, res) => {
// async/await のpostに
app.post('/create_groups', async (req, res) => {
  try {  
    if(IN_DEV===false){throw new Error('in dev false');  res.status(403).json({ message: error })};

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
  console.log('Invalid password3-2');
  // generate_random_passwordでランダムなパスワードを生成して
  const new_group_password = {
    group_id: result.lastInsertRowid,
    password: generate_random_password(),
  };
  console.log('Invalid password3-3');
  console.log(new_group_password);
  db.prepare('INSERT INTO groups_passwords (group_id, password) VALUES (?, ?)').run(new_group_password.group_id, new_group_password.password);
  console.log('Invalid password4');

  // 新規作成したid,password,を登録したemailに送るasync関数
  async function send_new_id_password_to_new_email() {
    try {
      const emailTemplate = `
  新しいグループが作成されました。

  グループID: ${new_group_password.group_id}
  パスワード: ${new_group_password.password}

  この情報を安全に保管してください。
  `;

      await transporter.sendMail({
      from: '"HRシェア" <your_email@gmail.com>',
      to: email,
      subject: '新しいグループ作成のお知らせ',
      text: emailTemplate,
      });

      console.log('新しいグループ情報をメールで送信しました');
    } catch (error) {
      console.error('新しいグループ情報のメール送信に失敗しました:', error);
      throw new Error('Failed to send email with new group information.');
    }
  }
  await send_new_id_password_to_new_email();
  console.log('Invalid password5');


  


  res.json({ 
            status: 'OK',
            id: result.lastInsertRowid,
            password: new_group_password.password });
  } catch (error) {
    console.log("initializeのエラー");
  }        
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
  try {  
    if(IN_DEV===false){throw new Error('in dev false');  res.status(403).json({ message: error })};
  
  const { profile_id, group_id, password } = req.body;
  console.log("1 request_profiles API");
  const error = check_group_password(group_id, password) ? null : 'Invalid password';
  if (error) {
    return res.status(403).json({ message: error });
  }


  // profile_idからprofile_nameを取得
  const profile_name = db.prepare('SELECT * FROM profiles WHERE id = ?').get(profile_id).name;

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

const rental_ok_endpoint_url = req.protocol + "://" + req.get('host') + '/rental_ok/';
const emailTemplate = `
${group.name}様!

これはHRシェアの人材レンタル依頼のメールです。
${profile_name}様のレンタル希望が${to_group_name}様から来ました。許可なら${rental_ok_endpoint_url+get_paramas}をクリックしてください。`;

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
    console.log('メール送信シーケンス完了1');
  console.log("9 request_profiles API");
  console.log("メール送信の処理完了");

  res.json({
    status: 'OK',
     message: 'Request sent'
  });
} catch (error) {
  console.log("try catchのエラーでメール送信の処理失敗");
  console.log(4);
  console.error(error);
  res.status(500).json({ success: false, error: 'Failed to send email.' });
}

});

app.get('/rental_ok/', async (req, res) => {
  try {
  if(IN_DEV===false){throw new Error('in dev false');  res.status(403).json({ message: error })};
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

  // profile_idから所属するグループのIDを取得
  const from_group_name = db.prepare('SELECT * FROM groups WHERE id = ?').get(profile.group_id).name;
  console.log("from_group_name:依頼元のグループの名前");
  console.log(from_group_name);

  const get_paramas = `?profile_id=${profile_id}&group_id=${group_id}`;
  console.log("get_paramas:URLのパラメータ");
  console.log(get_paramas);


    // レンタル許可テンプレート文章
const emailTemplate = `
${to_group_name}様!

${from_group_name}様からレンタル許可のメールが届きました。

レンタル料金: ${price}円

よろしくお願いします`;
console.log("emailTemplate:メールのテンプレート");
console.log(emailTemplate);


  console.log('メール送信シーケンス開始');
  const from_data = '"HRシェア" <your_email@gmail.com>';
  const subject_data = 'HRシェアの人材レンタル許可のメールです';

  await transporter.sendMail({
    from: from_data,
    to: to_email,
    subject: subject_data,
    text: emailTemplate,
  });

  console.log('メール送信シーケンス完了2');
  res.json({ success: true, message: `Email sent: リクエストメール送信完了` });
} catch (error) {
  console.log("try catchのエラーでメール送信の処理失敗");
  console.error('メール送信エラー:', error);
  res.status(500).json({ success: false, error: 'Failed to send email.' });
}
// リクエストのテーブルから削除
  // db.prepare('DELETE FROM requests WHERE profile_id = ?').run(profile_id);
  // console.log("リクエスト削除");
  // res.json({
  //   status: 'OK',
  //    message: 'Request deleted'
  // });
}
);


// id_passをチェックしてvalidならstatus: OKを返すpostエンドポイント
app.post('/check_id_password', (req, res) => {
  try {
    const { group_id, password } = req.body;
    console.log("check_id_password");
    console.log(group_id, password);

    const isValid = check_group_password(group_id, password);
    if (isValid) {
      console.log("check_id_password OK");
      res.json({ status: 'OK' });
    } else {
      console.log("check_id_password NG");
      res.status(403).json({ message: 'Invalid group ID or password' });
    }
  } catch (error) {
    console.error('Error in check_id_password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


function insert_request(group_id, profile_id, group_id_from) {
  const existingRequest = db.prepare(`
    SELECT * FROM requests 
    WHERE group_id = ? AND profile_id = ? 
    AND created_at > datetime('now', ? || ' seconds')
  `).get(group_id, profile_id, -REQUEST_TIME_LIMIT_SEC);
  if (existingRequest) {
    
  }
  const currentDateTime = new Date().toISOString();
  db.prepare(`
    INSERT INTO requests (group_id, profile_id, group_id_from, created_at) 
    VALUES (?, ?, ?, ?)
  `).run(group_id, profile_id, group_id_from, currentDateTime);
}

// 全部のリクエストの取得 email以外のカラムを表示
app.get('/all_requests', (req, res) => {
  const requests = db.prepare(`
    SELECT requests.id, requests.group_id, requests.profile_id, requests.group_id_from, requests.created_at FROM requests
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
  try {
    if(IN_DEV===false){throw new Error('in dev false');  res.status(403).json({ message: error })};

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

    await transporter.sendMail({
      from: from_data,
      to,
      subject: subject_data,
      text: emailTemplate(to, price),
    });
    console.log(2);

    res.json({ success: true, message: `Email sent: メール送信完了` });
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


