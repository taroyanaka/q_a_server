// https://marketplace.visualstudio.com/items?itemName=emeraldwalk.RunOnSave


// CCCCDEEEEEEEEEEE
// in vscode's 
// ./.vscode/settings.json
// {
// "emeraldwalk.runonsave": {
//     "commands": [
//         {
//             "match": "/Users/taroyanaka/Desktop/program/q_a/CRUD_endpoint_sql_for_index.js",
//             "cmd": "cp /Users/taroyanaka/Desktop/program/q_a/CRUD_endpoint_sql_for_index.js /Users/taroyanaka/Desktop/program/q_a_server/CRUD_endpoint_sql_for_index.js"
//         }
//     ]
// }
// }

// on CLI
// nodemon /Users/yanakataro/Desktop/npm_package/CRUD_endpoint_sql_for_index.js






// CRUD_endpoint_sql_for_index.js
// node.js, express.js and better-sqlite3.js validator.js cors.js


// npm install express better-sqlite3 validator cors
// touch ./q_a.sqlite3
// cp ../q_a/sql_init_for_index.sql ./sql_init_for_index.sql
// sqlite3 ./q_a.sqlite3 < ./sql_init_for_index.sql
// nodemon index.js



// 上記のクライアント側の境界値テストのe2eテストのためのコード
// '境界値テスト'のようなテストケースの類義語を10個

// 以下に「境界値テスト」のようなテストケースの類義語を10個挙げます。

// 端数処理テスト
// 最大値テスト
// 最小値テスト
// 範囲テスト
// 極端値テスト
// 不正値テスト
// 正常系テスト
// 例外処理テスト
// 網羅テスト
// 省略テスト
// 異常系テスト



// DROP TABLE IF EXISTS users;
// DROP TABLE IF EXISTS user_permission;
// DROP TABLE IF EXISTS f_c;
// DROP TABLE IF EXISTS f_i_b;
// DROP TABLE IF EXISTS i_t_n;


// CREATE TABLE users (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   role_id INTEGER NOT NULL,
//   name TEXT NOT NULL,
//   password TEXT NOT NULL,
//   created_at DATETIME NOT NULL,
//   updated_at DATETIME NOT NULL
// );
// CREATE TABLE user_permission (
//   id INTEGER PRIMARY KEY,

//   permission TEXT NOT NULL,
//   readable INTEGER NOT NULL,
//   writable INTEGER NOT NULL,
//   deletable INTEGER NOT NULL, 

//   created_at DATETIME NOT NULL,
//   updated_at DATETIME NOT NULL
// );

// CREATE TABLE f_c (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   user_id INTEGER NOT NULL,
//   content_1 TEXT NOT NULL,
//   content_2 TEXT NOT NULL,
//   created_at DATETIME NOT NULL,
//   updated_at DATETIME NOT NULL,
//   FOREIGN KEY (user_id) REFERENCES users(id)
// );

// CREATE TABLE f_i_b (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   user_id INTEGER NOT NULL,
//   content_1 TEXT NOT NULL,
//   content_2 TEXT NOT NULL,
//   created_at DATETIME NOT NULL,
//   updated_at DATETIME NOT NULL,
//   FOREIGN KEY (user_id) REFERENCES users(id)
// );
// CREATE TABLE i_t_n (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   user_id INTEGER NOT NULL,
//   content_1 TEXT NOT NULL,
//   content_2 TEXT NOT NULL,
//   created_at DATETIME NOT NULL,
//   updated_at DATETIME NOT NULL,
//   FOREIGN KEY (user_id) REFERENCES users(id)
// );

// INSERT INTO users (role_id, name, password, created_at, updated_at) VALUES (1, 'PUBLIC', 'delete_24_hours', DATETIME('now'), DATETIME('now'));
// INSERT INTO users (role_id, name, password, created_at, updated_at) VALUES (2, 'name1', 'password1', DATETIME('now'), DATETIME('now'));
// INSERT INTO user_permission (id, permission, readable, writable, deletable, created_at, updated_at) VALUES (1, 'guest', 1, 0, 0, DATETIME('now'), DATETIME('now'));
// INSERT INTO user_permission (id, permission, readable, writable, deletable, created_at, updated_at) VALUES (2, 'user', 1, 1, 1, DATETIME('now'), DATETIME('now'));




const express = require('express');


// better-sqlite3のサンプル
const sqlite = require('better-sqlite3');
const db = new sqlite('q_a.sqlite3');

const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// corsで全てのアクセスを許可する
const cors = require('cors');
app.use(cors());


const port = 8000;
// expressをlocalhostで起動する
// app.listen(port, 'localhost', () => {
app.listen(port, "0.0.0.0", () => {
// app.listen(port, '127.0.0.1', () => {
    console.log(`App listening!! at http://localhost:${port}`);
});

const now = () => new Date().toISOString();
const user_with_permission = (REQ) => db.prepare('SELECT * FROM users INNER JOIN roles ON users.role_id = roles.id WHERE users.name = ? AND users.password = ?').get(REQ.body.name, REQ.body.password);
// validator.jsでstringで4000文字以内のバリデーションをかける1行の関数
// 一般的なブラウザのURLの限界の長さは？getパラメーターで使える最長の長さを知りたい
//   => IE => 2048, Firefox => 65536, Chrome => 8192, Safari => 8192
// (8000文字は長すぎてユーザーにとって不便なので4000文字にする。IEは想定しない)
const true_if_within_4000_characters = (str) => str.length <= 4000 && typeof str === 'string';
// true_if_within_4000_charactersを1文字以上4000文字以内のバリデーションをかけるように変更した1行の関数
const true_if_within_4000_characters_and_not_empty = (str) => str.length > 0 && str.length <= 4000 && typeof str === 'string';


// https://taroyanaka.github.io/javascript/etc/dup_replacer.html
// ja: 抽象化した関数を使って重複を削除する方針か、抽象化せずにコピーペーストする方針か、二択で、抽象化による罠を避けるために後者を選択した
// en: The strategy is to either use an abstracted function to remove duplicates or to copy and paste without abstraction. The latter was selected to avoid traps due to abstraction.

// f_c
// f_i_b
// i_t_n

// '/read_f_c'というGETのリクエストを受け取るエンドポイントで、f_cの全てのidとcontent1とcontent2とcreated_atとupdated_atとuserのnameを返す。contentはJSON.parseする
app.get('/read_f_c', (req, res) => {
    const rows = db.prepare('SELECT f_c.id, f_c.content_1, f_c.content_2, f_c.created_at, f_c.updated_at, users.name FROM f_c INNER JOIN users ON f_c.user_id = users.id').all();
    res.json(rows);
});
// これは'/insert_f_c'というPOSTのリクエストを受け取るエンドポイントで、f_cにcontent1とcontent2を追加する。contentはJSON.stringifyする
app.post('/insert_f_c', (req, res) => {
    true_if_within_4000_characters_and_not_empty(JSON.stringify(req.body.content_1 + req.body_content_2)) ? null : res.send('4000文字以内で入力して');
    const user = user_with_permission(req);
    user ? null : res.send('ユーザーが存在しません');
    user.writable === 1 ? null : res.send('書き込み権限がありません');
    db.prepare('INSERT INTO f_c (user_id, content_1, content_2, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(user.id, req.body.content_1, req.body.content_2, now(), now()).changes === 1
        ? res.send(db.prepare('SELECT f_c.id, f_c.content_1, f_c.content_2, f_c.created_at, f_c.updated_at, users.name FROM f_c INNER JOIN users ON f_c.user_id = users.id').all()) : res.send('f_cの追加に失敗しました');
});
// これは'/delete_f_c'というPOSTのリクエストを受け取るエンドポイントで、f_cのidを指定して削除する
app.post('/delete_f_c', (req, res) => {
    const user = user_with_permission(req);
    user ? null : res.send('ユーザーが存在しません');
    user.deletable === 1 ? null : res.send('削除権限がありません');
    db.prepare('DELETE FROM f_c WHERE id = ?').run(req.body.id).changes === 1
        ? res.send(db.prepare('SELECT f_c.id, f_c.content_1, f_c.content_2, f_c.created_at, f_c.updated_at, users.name FROM f_c INNER JOIN users ON f_c.user_id = users.id').all()) : res.send('f_cの削除に失敗しました');
});

// '/read_f_i_b'というGETのリクエストを受け取るエンドポイントで、f_i_bの全てのidとcontent1とcontent2とcreated_atとupdated_atとuserのnameを返す。contentはJSON.parseする
app.get('/read_f_i_b', (req, res) => {
    const rows = db.prepare('SELECT f_i_b.id, f_i_b.content_1, f_i_b.content_2, f_i_b.created_at, f_i_b.updated_at, users.name FROM f_i_b INNER JOIN users ON f_i_b.user_id = users.id').all();
    res.json(rows);
});
// これは'/insert_f_i_b'というPOSTのリクエストを受け取るエンドポイントで、f_i_bにcontent1とcontent2を追加する。contentはJSON.stringifyする
app.post('/insert_f_i_b', (req, res) => {
    true_if_within_4000_characters_and_not_empty(JSON.stringify(req.body.content_1 + req.body_content_2)) ? null : res.send('4000文字以内で入力して');
    const user = user_with_permission(req);
    user ? null : res.send('ユーザーが存在しません');
    user.writable === 1 ? null : res.send('書き込み権限がありません');
    db.prepare('INSERT INTO f_i_b (user_id, content_1, content_2, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(user.id, req.body.content_1, req.body.content_2, now(), now()).changes === 1
        ? res.send(db.prepare('SELECT f_i_b.id, f_i_b.content_1, f_i_b.content_2, f_i_b.created_at, f_i_b.updated_at, users.name FROM f_i_b INNER JOIN users ON f_i_b.user_id = users.id').all()) : res.send('f_i_bの追加に失敗しました');
});
// これは'/delete_f_i_b'というPOSTのリクエストを受け取るエンドポイントで、f_i_bのidを指定して削除する
app.post('/delete_f_i_b', (req, res) => {
    const user = user_with_permission(req);
    user ? null : res.send('ユーザーが存在しません');
    user.deletable === 1 ? null : res.send('削除権限がありません');
    db.prepare('DELETE FROM f_i_b WHERE id = ?').run(req.body.id).changes === 1
        ? res.send(db.prepare('SELECT f_i_b.id, f_i_b.content_1, f_i_b.content_2, f_i_b.created_at, f_i_b.updated_at, users.name FROM f_i_b INNER JOIN users ON f_i_b.user_id = users.id').all()) : res.send('f_i_bの削除に失敗しました');
});

// '/read_i_t_n'というGETのリクエストを受け取るエンドポイントで、i_t_nの全てのidとcontent1とcontent2とcreated_atとupdated_atとuserのnameを返す。contentはJSON.parseする
app.get('/read_i_t_n', (req, res) => {
    const rows = db.prepare('SELECT i_t_n.id, i_t_n.content_1, i_t_n.content_2, i_t_n.created_at, i_t_n.updated_at, users.name FROM i_t_n INNER JOIN users ON i_t_n.user_id = users.id').all();
    res.json(rows);
});
// これは'/insert_i_t_n'というPOSTのリクエストを受け取るエンドポイントで、i_t_nにcontent1とcontent2を追加する。contentはJSON.stringifyする
app.post('/insert_i_t_n', (req, res) => {
    true_if_within_4000_characters_and_not_empty(JSON.stringify(req.body.content_1 + req.body_content_2)) ? null : res.send('4000文字以内で入力して');
    const user = user_with_permission(req);
    user ? null : res.send('ユーザーが存在しません');
    user.writable === 1 ? null : res.send('書き込み権限がありません');
    db.prepare('INSERT INTO i_t_n (user_id, content_1, content_2, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(user.id, req.body.content_1, req.body.content_2, now(), now()).changes === 1
        ? res.send(db.prepare('SELECT i_t_n.id, i_t_n.content_1, i_t_n.content_2, i_t_n.created_at, i_t_n.updated_at, users.name FROM i_t_n INNER JOIN users ON i_t_n.user_id = users.id').all()) : res.send('i_t_nの追加に失敗しました');
});
// これは'/delete_i_t_n'というPOSTのリクエストを受け取るエンドポイントで、i_t_nのidを指定して削除する
app.post('/delete_i_t_n', (req, res) => {
    const user = user_with_permission(req);
    user ? null : res.send('ユーザーが存在しません');
    user.deletable === 1 ? null : res.send('削除権限がありません');
    db.prepare('DELETE FROM i_t_n WHERE id = ?').run(req.body.id).changes === 1
        ? res.send(db.prepare('SELECT i_t_n.id, i_t_n.content_1, i_t_n.content_2, i_t_n.created_at, i_t_n.updated_at, users.name FROM i_t_n INNER JOIN users ON i_t_n.user_id = users.id').all()) : res.send('i_t_nの削除に失敗しました');
});
