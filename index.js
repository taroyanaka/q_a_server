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


//  ユーザーのテーブル。カラムはIDはと名前とパスワードと作成日と更新日を持つ。IDは自動的に増加する
// CREATE TABLE users (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   name TEXT NOT NULL,
//   password TEXT NOT NULL,
//   created_at DATETIME NOT NULL,
//   updated_at DATETIME NOT NULL
// );

//  q_aというブログのようなサービスのテーブル。contentと作成日と更新日を持つ。IDは自動的に増加する。usersのIDを外部キーとして持つ
// CREATE TABLE q_a (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   user_id INTEGER NOT NULL,
//   content TEXT NOT NULL,
//   created_at DATETIME NOT NULL,
//   updated_at DATETIME NOT NULL,
//   FOREIGN KEY (user_id) REFERENCES users(id)
// );

//  f_i_bというブログのようなサービスのテーブル。contentと作成日と更新日を持つ。IDは自動的に増加する。usersのIDを外部キーとして持つ
// CREATE TABLE f_i_b (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   user_id INTEGER NOT NULL,
//   content TEXT NOT NULL,
//   created_at DATETIME NOT NULL,
//   updated_at DATETIME NOT NULL,
//   FOREIGN KEY (user_id) REFERENCES users(id)
// );
//  i_t_nというブログのようなサービスのテーブル。contentと作成日と更新日を持つ。IDは自動的に増加する。usersのIDを外部キーとして持つ
// CREATE TABLE i_t_n (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   user_id INTEGER NOT NULL,
//   content TEXT NOT NULL,
//   created_at DATETIME NOT NULL,
//   updated_at DATETIME NOT NULL,
//   FOREIGN KEY (user_id) REFERENCES users(id)
// );



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

// '/read_q_a'というGETのリクエストを受け取るエンドポイントで、q_aの全てのidとcontentとcreated_atとupdated_atとuserのnameを返す。contentはJSON.parseする
app.get('/read_q_a', (req, res) => {
    const read_q_a = db.prepare('SELECT q_a.id, q_a.content, q_a.created_at, q_a.updated_at, users.name FROM q_a INNER JOIN users ON q_a.user_id = users.id').all();
    res.send(read_q_a);
});
app.get('/read_f_i_b', (req, res) => {
    const read_f_i_b = db.prepare('SELECT f_i_b.id, f_i_b.content, f_i_b.created_at, f_i_b.updated_at, users.name FROM f_i_b INNER JOIN users ON f_i_b.user_id = users.id').all();
    res.send(read_f_i_b);
});

// '/insert_q_a'というPOSTのリクエストを受け取るエンドポイントで、nameとpasswordを受け取り、nameとpasswordが一致する場合はそのユーザーのcontentとそのcontentのidとcreated_atとupdated_atを返す。sqlクエリの回数は2回までにする
app.post('/insert_q_a', (req, res) => {
    const now = new Date().toISOString();
    const user = db.prepare('SELECT * FROM users WHERE name = ? AND password = ?').get(req.body.name, req.body.password);
    user ? 
        db.prepare('INSERT INTO q_a (user_id, content, created_at, updated_at) VALUES (?, ?, ?, ?)').run(user.id, JSON.stringify(req.body.content), now, now).changes === 1 ?
            res.send(db.prepare('SELECT q_a.id, q_a.content, q_a.created_at, q_a.updated_at, users.name FROM q_a INNER JOIN users ON q_a.user_id = users.id').all())
            :
            res.send('q_aの追加に失敗しました')
    :
    res.send('ユーザーが存在しません');
});
// '/insert_f_i_b'というPOSTのリクエストを受け取るエンドポイントで、nameとpasswordを受け取り、nameとpasswordが一致する場合はそのユーザーのcontentとそのcontentのidとcreated_atとupdated_atを返す。sqlクエリの回数は2回までにする
app.post('/insert_f_i_b', (req, res) => {
    const now = new Date().toISOString();
    const user = db.prepare('SELECT * FROM users WHERE name = ? AND password = ?').get(req.body.name, req.body.password);
    user ?
        db.prepare('INSERT INTO f_i_b (user_id, content, created_at, updated_at) VALUES (?, ?, ?, ?)').run(user.id, JSON.stringify(req.body.content), now, now).changes === 1 ?
            res.send(db.prepare('SELECT f_i_b.id, f_i_b.content, f_i_b.created_at, f_i_b.updated_at, users.name FROM f_i_b INNER JOIN users ON f_i_b.user_id = users.id').all())
            :
            res.send('f_i_bの追加に失敗しました')
        :
        res.send('ユーザーが存在しません');
});



// 上記のdelete_q_aをdelete_f_i_bのように書き換える
app.post('/delete_q_a', (req, res) => {
    const now = new Date().toISOString();
    const user = db.prepare('SELECT * FROM users WHERE name = ? AND password = ?').get(req.body.name, req.body.password);
    user ?
        db.prepare('DELETE FROM q_a WHERE id = ?').run(req.body.id).changes === 1 ?
            res.send(db.prepare('SELECT q_a.id, q_a.content, q_a.created_at, q_a.updated_at, users.name FROM q_a INNER JOIN users ON q_a.user_id = users.id').all())
            :
            res.send('q_aの削除に失敗しました')
        :
        res.send('ユーザーが存在しません');
});
// 上記をinsert_f_i_bのように書き換える
app.post('/delete_f_i_b', (req, res) => {
    const now = new Date().toISOString();
    const user = db.prepare('SELECT * FROM users WHERE name = ? AND password = ?').get(req.body.name, req.body.password);
    user ?
        db.prepare('DELETE FROM f_i_b WHERE id = ?').run(req.body.id).changes === 1 ?
            res.send(db.prepare('SELECT f_i_b.id, f_i_b.content, f_i_b.created_at, f_i_b.updated_at, users.name FROM f_i_b INNER JOIN users ON f_i_b.user_id = users.id').all())
            :
            res.send('f_i_bの削除に失敗しました')
        :
        res.send('ユーザーが存在しません');
});
