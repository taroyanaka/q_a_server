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



// DB周りやることリスト(優先順位順)
    // 優先順位0位 => DB周りのサンドボックス環境の実装
    // DB周りのサンドボックス無いと、一発本番でプロダクトのコード書く無理ゲーになるから、
    // https://taroyanaka.github.io/dup_replacer_web/dup_replacer_web.html をDB周りのサンドボックスとして使う
        // (めちゃくちゃな使い方とか思いつきの実装を試して、積極的にアンチパターンとか地雷を踏み抜いていく)
// 2週間か1週間の期日決めて、期日内に必須のものをピックアップして、余ったら期日までに+αでやる
// 必須
    // portal.htmlのUIのテストモードの実装
    // ユーザ毎の権限ベースのテスト&仕様を確定させる
    // 権限に沿ったUIの実装
    // e2eテスト(クライアント側のUIベースのテスト)書く
    // e2eテスト(UI使わないfetchのアクセスベースのテスト)書く
    // デモ版(notテストのデータではなく見せる用のデータ)の実装
    // デモ版の動画の実装(30秒版と180秒版を両方)
        // +αでやる
        // ドッグフーディング(英単語帳でもやるか...)のための文字認識とか翻訳機能のエクステンションの実装
        // エンドユーザー100人以上に対応したUIの実装
        // エンドユーザー100人以上に対応したDBのクエリの実装(LIMITとかタグとか??)
// 任意 🤔(気持ち的には思いついたDB周りの楽しそうな実装全部やる)
    // 24時間削除の実装
    // likeの実装
    // タグの実装
    // portal.htmlのUIのブラッシュアップ
    // 負荷試験の実装
    // F5アタックとかへの対応
    // データベースのバックアップの実装




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
// 1文字以上4000文字以内のバリデーションをかけるように変更した1行の関数
const true_if_within_4000_characters_and_not_empty = (str) => str.length > 0 && str.length <= 4000 && typeof str === 'string';
// expressの一般的なエラーのレスポンス。引数としてエラー文字列を含めて呼び出す
const error_response = (res, error_message) => res.status(400).json({ error: error_message });
// expressの一般的なサクセスのレスポンス、引数としてレスポンスの内容を含めて呼び出す
const success_response = (res, response_message) => res.status(200).json({ response: response_message });


// https://taroyanaka.github.io/javascript/etc/dup_replacer.html
// ja: 抽象化した関数を使って重複を削除する方針か、抽象化せずにコピーペーストする方針か、二択で、抽象化による罠を避けるために後者を選択した
// en: The strategy is to either use an abstracted function to remove duplicates or to copy and paste without abstraction. The latter was selected to avoid traps due to abstraction.

// f_c
// f_i_b
// i_t_n

// copilotのヒンディー語の言語コードはhi. ヒンディー語の言語コードはhi-IN
// copilotのシンド語の言語コードはsd. シンド語の言語コードはsd-IN
const lang_and_message = [
['🇨🇳🇹🇼', '中文 (中国語)', 'zh', ['请输入4000个字符以内','用户不存在','没有写权限','data添加失败','用户不存在','没有删除权限',],],
['🇪🇸', 'スペイン語', 'es', ['Introduzca menos de 4000 caracteres','El usuario no existe','No tiene permiso de escritura','data no se pudo agregar','El usuario no existe','No tiene permiso de eliminación',],],
['🇬🇧🇺🇸', '英語', 'en', ['Please enter less than 4000 characters','The user does not exist','No write permission','data could not be added','The user does not exist','No delete permission',],],
['🇮🇳', 'ヒンディー語', 'hi-IN', ['4000 अक्षरों से कम दर्ज करें','उपयोगकर्ता मौजूद नहीं है','लिखने की अनुमति नहीं है','data नहीं जोड़ा जा सका','उपयोगकर्ता मौजूद नहीं है','हटाने की अनुमति नहीं है',],],
['🇸🇦', 'アラビア語', 'ar', ['الرجاء إدخال أقل من 4000 حرفًا','المستخدم غير موجود','لا يوجد إذن للكتابة','لم يتم إضافة data','المستخدم غير موجود','لا يوجد إذن للحذف',],],
['🇵🇹', 'ポルトガル語', 'pt', ['Por favor, insira menos de 4000 caracteres','O usuário não existe','Sem permissão de escrita','data não pôde ser adicionado','O usuário não existe','Sem permissão de exclusão',],],
['🇧🇩', 'ベンガル語', 'bn', ['4000 অক্ষরের কম প্রবেশ করুন','ব্যবহারকারী নেই','লেখার অনুমতি নেই','data যোগ করা যায়নি','ব্যবহারকারী নেই','মুছে ফেলার অনুমতি নেই',],],
['🇷🇺', 'ロシア語', 'ru', ['Пожалуйста, введите менее 4000 символов','Пользователь не существует','Нет разрешения на запись','data не удалось добавить','Пользователь не существует','Нет разрешения на удаление',],],
['🇯🇵', '日本語', 'ja', ['4000文字以内で入力してください','ユーザーが存在しません','書き込み権限がありません','dataの追加に失敗しました','ユーザーが存在しません','削除権限がありません',],],
['🇩🇪', 'ドイツ語', 'de', ['Bitte geben Sie weniger als 4000 Zeichen ein','Der Benutzer existiert nicht','Keine Schreibberechtigung','data konnte nicht hinzugefügt werden','Der Benutzer existiert nicht','Keine Löschberechtigung',],],
['🇫🇷', 'フランス語', 'fr', ['Veuillez entrer moins de 4000 caractères','L\'utilisateur n\'existe pas','Pas d\'autorisation d\'écriture','data n\'a pas pu être ajouté','L\'utilisateur n\'existe pas','Pas d\'autorisation de suppression',],],
['🇰🇷', '韓国語', 'ko', ['4000자 미만으로 입력하십시오','사용자가 존재하지 않습니다','쓰기 권한이 없습니다','data를 추가하지 못했습니다','사용자가 존재하지 않습니다','삭제 권한이 없습니다',],],
['🇹🇲', 'タミル語', 'ta', ['4000 எழுத்துக்களில் குறைவாக உள்ளிடவும்','பயனர் இல்லை','எழுத்துக்களை எழுத அனுமதி இல்லை','data சேர்க்க முடியவில்லை','பயனர் இல்லை','நீக்க அனுமதி இல்லை',],],
['🇹🇷', 'トルコ語', 'tr', ['Lütfen 4000 karakterden az girin','Kullanıcı mevcut değil','Yazma izni yok','data eklenemedi','Kullanıcı mevcut değil','Silme izni yok',],],
['🇮🇹', 'イタリア語', 'it', ['Si prega di inserire meno di 4000 caratteri','L\'utente non esiste','Nessun permesso di scrittura','data non è stato aggiunto','L\'utente non esiste','Nessun permesso di eliminazione',],],
['🇺🇦', 'ウクライナ語', 'uk', ['Будь ласка, введіть менше 4000 символів','Користувач не існує','Немає дозволу на запис','data не вдалося додати','Користувач не існує','Немає дозволу на видалення',],],
['🇮🇳', 'グジャラト語', 'gu', ['4000 અક્ષરોમાં ઓછી પ્રબેશ કરો','વપરાશકર્તા અસ્તિત્વમાં નથી','લખાણ પર પરવાનગી નથી','data ઉમેરી શકાયું નથી','વપરાશકર્તા અસ્તિત્વમાં નથી','કાઢી નાખવા પર પરવાનગી નથી',],],
['🇮🇷', 'ペルシア語 (イラン語)', 'fa', ['لطفاً کمتر از 4000 کاراکتر وارد کنید','کاربر وجود ندارد','مجوز نوشتن وجود ندارد','data اضافه نشد','کاربر وجود ندارد','مجوز حذف وجود ندارد',],],
['🇵🇱', 'ポーランド語', 'pl', ['Wprowadź mniej niż 4000 znaków','Użytkownik nie istnieje','Brak uprawnień do zapisu','data nie został dodany','Użytkownik nie istnieje','Brak uprawnień do usuwania',],],
['🇮🇳', 'シンド語', 'sd-IN', ['4000 ڪردينڊ ڪم ڏينهن ڏسو','يوزر موجود نه ۾','لکڻيون ڪي مجوز نه ۾','data ڪي اضافو نه ۾','يوزر موجود نه ۾','ڊيليٽ ڪي مجوز نه ۾',],],
];

// '/read_f_c'というGETのリクエストを受け取るエンドポイントで、f_cの全てのidとcontent1とcontent2とcreated_atとupdated_atとuserのnameを返す。contentはJSON.parseする
app.get('/read_f_c', (req, res) => {
    const rows = db.prepare('SELECT f_c.id, f_c.content_1, f_c.content_2, f_c.created_at, f_c.updated_at, users.name FROM f_c INNER JOIN users ON f_c.user_id = users.id').all();
    res.json(rows);
});
// これは'/insert_f_c'というPOSTのリクエストを受け取るエンドポイントで、f_cにcontent1とcontent2を追加する。contentはJSON.stringifyする
app.post('/insert_f_c', (req, res) => {
    true_if_within_4000_characters_and_not_empty(JSON.stringify(req.body.content_1)) ? null : error_response(res, '4000文字以内で入力して');
    true_if_within_4000_characters_and_not_empty(JSON.stringify(req.body.content_2)) ? null : error_response(res, '4000文字以内で入力して');
    true_if_within_4000_characters_and_not_empty(JSON.stringify(req.body.content_1 + req.body.content_2)) ? null : error_response(res, '4000文字以内で入力して');
    const user = user_with_permission(req);
    user ? null : error_response(res, 'ユーザーが存在しません');
    user.writable === 1 ? null : error_response(res, '書き込み権限がありません');
    db.prepare('INSERT INTO f_c (user_id, content_1, content_2, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(user.id, req.body.content_1, req.body.content_2, now(), now()).changes === 1
        ? success_response(res, "OK") : error_response(res, 'f_cの追加に失敗しました');
        // ? (db.prepare('SELECT f_c.id, f_c.content_1, f_c.content_2, f_c.created_at, f_c.updated_at, users.name FROM f_c INNER JOIN users ON f_c.user_id = users.id').all(), success_response(res, '追加完了')) : error_response(res, 'f_cの追加に失敗しました');
});
// これは'/delete_f_c'というPOSTのリクエストを受け取るエンドポイントで、f_cのidを指定して削除する
app.post('/delete_f_c', (req, res) => {
    const user = user_with_permission(req);
    user ? null : error_response(res, 'ユーザーが存在しません');
    user.deletable === 1 ? null : error_response(res, '削除権限がありません');
    db.prepare('DELETE FROM f_c WHERE id = ?').run(req.body.id).changes === 1
        ? success_response(res, 'OK') : error_response(res, 'f_cの削除に失敗しました');
        // ? error_response(res, db.prepare('SELECT f_c.id, f_c.content_1, f_c.content_2, f_c.created_at, f_c.updated_at, users.name FROM f_c INNER JOIN users ON f_c.user_id = users.id').all()) : error_response(res, 'f_cの削除に失敗しました');
});






// '/read_f_i_b'というGETのリクエストを受け取るエンドポイントで、f_i_bの全てのidとcontent1とcontent2とcreated_atとupdated_atとuserのnameを返す。contentはJSON.parseする
app.get('/read_f_i_b', (req, res) => {
    const rows = db.prepare('SELECT f_i_b.id, f_i_b.content_1, f_i_b.content_2, f_i_b.created_at, f_i_b.updated_at, users.name FROM f_i_b INNER JOIN users ON f_i_b.user_id = users.id').all();
    res.json(rows);
});
// これは'/insert_f_i_b'というPOSTのリクエストを受け取るエンドポイントで、f_i_bにcontent1とcontent2を追加する。contentはJSON.stringifyする
app.post('/insert_f_i_b', (req, res) => {
    true_if_within_4000_characters_and_not_empty(JSON.stringify(req.body.content_1)) ? null : error_response(res, '4000文字以内で入力して');
    true_if_within_4000_characters_and_not_empty(JSON.stringify(req.body.content_2)) ? null : error_response(res, '4000文字以内で入力して');
    true_if_within_4000_characters_and_not_empty(JSON.stringify(req.body.content_1 + req.body.content_2)) ? null : error_response(res, '4000文字以内で入力して');
    const user = user_with_permission(req);
    user ? null : error_response(res, 'ユーザーが存在しません');
    user.writable === 1 ? null : error_response(res, '書き込み権限がありません');
    db.prepare('INSERT INTO f_i_b (user_id, content_1, content_2, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(user.id, req.body.content_1, req.body.content_2, now(), now()).changes === 1
        ? success_response(res, "OK") : error_response(res, 'f_i_bの追加に失敗しました');
        // ? (db.prepare('SELECT f_i_b.id, f_i_b.content_1, f_i_b.content_2, f_i_b.created_at, f_i_b.updated_at, users.name FROM f_i_b INNER JOIN users ON f_i_b.user_id = users.id').all(), success_response(res, '追加完了')) : error_response(res, 'f_i_bの追加に失敗しました');
});
// これは'/delete_f_i_b'というPOSTのリクエストを受け取るエンドポイントで、f_i_bのidを指定して削除する
app.post('/delete_f_i_b', (req, res) => {
    const user = user_with_permission(req);
    user ? null : error_response(res, 'ユーザーが存在しません');
    user.deletable === 1 ? null : error_response(res, '削除権限がありません');
    db.prepare('DELETE FROM f_i_b WHERE id = ?').run(req.body.id).changes === 1
        ? success_response(res, 'OK') : error_response(res, 'f_i_bの削除に失敗しました');
        // ? error_response(res, db.prepare('SELECT f_i_b.id, f_i_b.content_1, f_i_b.content_2, f_i_b.created_at, f_i_b.updated_at, users.name FROM f_i_b INNER JOIN users ON f_i_b.user_id = users.id').all()) : error_response(res, 'f_i_bの削除に失敗しました');
});



// '/read_i_t_n'というGETのリクエストを受け取るエンドポイントで、i_t_nの全てのidとcontent1とcontent2とcreated_atとupdated_atとuserのnameを返す。contentはJSON.parseする
app.get('/read_i_t_n', (req, res) => {
    const rows = db.prepare('SELECT i_t_n.id, i_t_n.content_1, i_t_n.content_2, i_t_n.created_at, i_t_n.updated_at, users.name FROM i_t_n INNER JOIN users ON i_t_n.user_id = users.id').all();
    res.json(rows);
});
// これは'/insert_i_t_n'というPOSTのリクエストを受け取るエンドポイントで、i_t_nにcontent1とcontent2を追加する。contentはJSON.stringifyする
app.post('/insert_i_t_n', (req, res) => {
    true_if_within_4000_characters_and_not_empty(JSON.stringify(req.body.content_1)) ? null : error_response(res, '4000文字以内で入力して');
    true_if_within_4000_characters_and_not_empty(JSON.stringify(req.body.content_2)) ? null : error_response(res, '4000文字以内で入力して');
    true_if_within_4000_characters_and_not_empty(JSON.stringify(req.body.content_1 + req.body.content_2)) ? null : error_response(res, '4000文字以内で入力して');
    const user = user_with_permission(req);
    user ? null : error_response(res, 'ユーザーが存在しません');
    user.writable === 1 ? null : error_response(res, '書き込み権限がありません');
    db.prepare('INSERT INTO i_t_n (user_id, content_1, content_2, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(user.id, req.body.content_1, req.body.content_2, now(), now()).changes === 1
        ? success_response(res, "OK") : error_response(res, 'i_t_nの追加に失敗しました');
        // ? (db.prepare('SELECT i_t_n.id, i_t_n.content_1, i_t_n.content_2, i_t_n.created_at, i_t_n.updated_at, users.name FROM i_t_n INNER JOIN users ON i_t_n.user_id = users.id').all(), success_response(res, '追加完了')) : error_response(res, 'i_t_nの追加に失敗しました');
});
// これは'/delete_i_t_n'というPOSTのリクエストを受け取るエンドポイントで、i_t_nのidを指定して削除する
app.post('/delete_i_t_n', (req, res) => {
    const user = user_with_permission(req);
    user ? null : error_response(res, 'ユーザーが存在しません');
    user.deletable === 1 ? null : error_response(res, '削除権限がありません');
    db.prepare('DELETE FROM i_t_n WHERE id = ?').run(req.body.id).changes === 1
        ? success_response(res, 'OK') : error_response(res, 'i_t_nの削除に失敗しました');
        // ? error_response(res, db.prepare('SELECT i_t_n.id, i_t_n.content_1, i_t_n.content_2, i_t_n.created_at, i_t_n.updated_at, users.name FROM i_t_n INNER JOIN users ON i_t_n.user_id = users.id').all()) : error_response(res, 'i_t_nの削除に失敗しました');
});


























