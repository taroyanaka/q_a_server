// このサンプルデータを基に、プロジェクトやパック、改善案、メンバー、価格に対するバリデーションルールを策定します。以下に各項目ごとのバリデーションルールを示します。

// - **`id`**: 整数で、重複がないこと。
// - **`name`**: 1文字以上50文字以下であること。空欄禁止。
// - **`description`**: 1文字以上300文字以下であること。
// - **`kpi`**: 0以上100以下の数値。
// - **`dueDate`**: プロジェクトの締め切りまでの期間（時間単位）。0以上であること。
// - **`difficulty`**: 1～5の範囲であること。
// - **`members`**: プロジェクトには1人以上のメンバーが必要。メンバーは重複してはいけない。
// - **`objective_prices`**:
//     - **`objective_price`**: 0以上の整数。
//     - **`price_description`**: 1文字以上100文字以下であること。
// - **`current_price`**: `objective_prices`の範囲内にあること。
// - **`target_price`**: `objective_prices`の範囲内にあること。

// - `current_price`や`target_price`が`objective_prices`の範囲外の場合、エラーメッセージを返す。


// - **`id`**: 整数で、重複がないこと。
// - **`projectId`**: 存在するプロジェクトIDであること。
// - **`plan`, `do`, `check`, `act`**:
//     - **`description`**: 1文字以上300文字以下であること。
//     - **`done`**: ブール値（`true` または `false`）。
//     - **`links`**: 
//         - **`name`**: 1文字以上50文字以下。
//         - **`href`**: 有効なURLであること。
//         - **`stars`**: 1～5の範囲の整数。
// - **`dueDate`**: 現在の日時より未来の日付であること。
// - **`improvement_ideas`**:
//     - **`id`**: 整数で、重複がないこと。
//     - **`packId`**: 既存のパックIDと一致すること。
//     - **`type`**: `'immediate'` または `'non-immediate'` のみを許可。
//     - **`description`**: 1文字以上300文字以下であること。
//     - **`links`**:
//         - **`url`**: 有効なURLであること。
//         - **`description`**: 1文字以上100文字以下。

// - `dueDate`が過去の日付の場合、バリデーションエラーを返す。
// - `improvement_ideas` の`packId`が正しくない場合エラーメッセージを表示。


// - **`id`**: 整数で、重複がないこと。
// - **`name`**: 1文字以上50文字以下であること。空欄禁止。
// - **`position`**: 1文字以上50文字以下であること。空欄禁止。
// - **`link`**: 有効なURLであること。


// - **`objective_price`**: 0以上の整数であること。
// - **`price_description`**: 1文字以上100文字以下であること。
// - **`current_price`, `target_price`**:
//     - **`current_price`**は `objective_prices` 内に含まれている値であること。
//     - **`target_price`**は `objective_prices` 内に含まれている値であること。


// 1. プロジェクトが `kpi` の範囲外の場合：
//    - エラー例: 「`kpi` は 0 以上 100 以下の範囲でなければなりません。」

// 2. `dueDate` が過去の日付の場合：
//    - エラー例: 「`dueDate` は現在の日付より未来の日付である必要があります。」

// 3. `objective_prices` が不正な値の場合：
//    - エラー例: 「`objective_price` は 0 以上でなければなりません。」



const express = require('express');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');

const app = express();
app.use(bodyParser.json());

// データベースの初期化
const db_for_app7 = new Database('app7.db');

app.post('/init_db', (req, res) => {
    try {
        db_for_app7.exec('DROP TABLE IF EXISTS users');
        db_for_app7.exec('DROP TABLE IF EXISTS projects');
        db_for_app7.exec('DROP TABLE IF EXISTS members');
        db_for_app7.exec('DROP TABLE IF EXISTS project_members');
        db_for_app7.exec('DROP TABLE IF EXISTS objective_prices');
        db_for_app7.exec('DROP TABLE IF EXISTS packs');
        db_for_app7.exec('DROP TABLE IF EXISTS improvement_ideas');
        db_for_app7.exec('DROP TABLE IF EXISTS links');
        
        // ユーザーテーブルの作成
        db_for_app7.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            uid TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`);
        
        // プロジェクトテーブルの作成
        db_for_app7.exec(`
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            name TEXT NOT NULL,
            description TEXT,
            kpi INTEGER,
            due_date INTEGER,
            difficulty INTEGER,
            current_price INTEGER,
            target_price INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`);
        
        // メンバーテーブルの作成
        db_for_app7.exec(`
        CREATE TABLE IF NOT EXISTS members (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            position TEXT,
            link TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`);
        
        // プロジェクトメンバーの関連テーブルの作成
        db_for_app7.exec(`
        CREATE TABLE IF NOT EXISTS project_members (
            project_id INTEGER,
            member_id INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id),
            FOREIGN KEY (member_id) REFERENCES members(id),
            PRIMARY KEY (project_id, member_id)
        )`);
        
        // 価格テーブルの作成
        db_for_app7.exec(`
        CREATE TABLE IF NOT EXISTS objective_prices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER,
            objective_price INTEGER,
            price_description TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id)
        )`);
        
        // パックテーブルの作成
        db_for_app7.exec(`
        CREATE TABLE IF NOT EXISTS packs (
            id INTEGER PRIMARY KEY,
            project_id INTEGER,
            plan_description TEXT,
            plan_done BOOLEAN,
            do_description TEXT,
            do_done BOOLEAN,
            check_description TEXT,
            check_done BOOLEAN,
            act_description TEXT,
            act_done BOOLEAN,
            due_date TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id)
        )`);
        
        // 改善アイデアテーブルの作成
        db_for_app7.exec(`
        CREATE TABLE IF NOT EXISTS improvement_ideas (
            id INTEGER PRIMARY KEY,
            pack_id INTEGER,
            type TEXT,
            description TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (pack_id) REFERENCES packs(id)
        )`);
        
        // リンクテーブルの作成
        db_for_app7.exec(`
        CREATE TABLE IF NOT EXISTS links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pack_id INTEGER,
            improvement_idea_id INTEGER,
            url TEXT,
            description TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (pack_id) REFERENCES packs(id),
            FOREIGN KEY (improvement_idea_id) REFERENCES improvement_ideas(id)
        )`);
        res.status(201).send('Database initialized');
    } catch (error) {
        console.error('Error initializing database:', error);
        res.status(500).send('Internal server error');
    }
});

// CRUD エンドポイントの定義

// ユーザーの作成
app.post('/users', (req, res) => {
    try {
        const { uid, name, email } = req.body;
        if (!uid || !name || !email) {
            return res.status(400).send('Invalid input');
        }
        const stmt = db_for_app7.prepare('INSERT INTO users (uid, name, email) VALUES (?, ?, ?)');
        const info = stmt.run(uid, name, email);
        res.status(201).json({ id: info.lastInsertRowid });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Internal server error');
    }
});

// プロジェクトの作成
app.post('/projects', (req, res) => {
    try {
        const { user_id, name, description, kpi, due_date, difficulty, current_price, target_price } = req.body;
        if (!user_id || !name) {
            return res.status(400).send('Invalid input');
        }
        const stmt = db_for_app7.prepare('INSERT INTO projects (user_id, name, description, kpi, due_date, difficulty, current_price, target_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        const info = stmt.run(user_id, name, description, kpi, due_date, difficulty, current_price, target_price);
        res.status(201).json({ id: info.lastInsertRowid });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).send('Internal server error');
    }
});

// メンバーの作成
app.post('/members', (req, res) => {
    try {
        const { name, position, link } = req.body;
        if (!name) {
            return res.status(400).send('Invalid input');
        }
        const stmt = db_for_app7.prepare('INSERT INTO members (name, position, link) VALUES (?, ?, ?)');
        const info = stmt.run(name, position, link);
        res.status(201).json({ id: info.lastInsertRowid });
    } catch (error) {
        console.error('Error creating member:', error);
        res.status(500).send('Internal server error');
    }
});

// プロジェクトメンバーの関連付け
app.post('/project_members', (req, res) => {
    try {
        const { project_id, member_id } = req.body;
        if (!project_id || !member_id) {
            return res.status(400).send('Invalid input');
        }
        const stmt = db_for_app7.prepare('INSERT INTO project_members (project_id, member_id) VALUES (?, ?)');
        const info = stmt.run(project_id, member_id);
        res.status(201).json({ id: info.lastInsertRowid });
    } catch (error) {
        console.error('Error creating project_member:', error);
        res.status(500).send('Internal server error');
    }
});

// 価格の作成
app.post('/objective_prices', (req, res) => {
    try {
        const { project_id, objective_price, price_description } = req.body;
        if (!project_id || objective_price === undefined) {
            return res.status(400).send('Invalid input');
        }
        const stmt = db_for_app7.prepare('INSERT INTO objective_prices (project_id, objective_price, price_description) VALUES (?, ?, ?)');
        const info = stmt.run(project_id, objective_price, price_description);
        res.status(201).json({ id: info.lastInsertRowid });
    } catch (error) {
        console.error('Error creating objective_price:', error);
        res.status(500).send('Internal server error');
    }
});

// パックの作成
app.post('/packs', (req, res) => {
    try {
        const { project_id, plan_description, plan_done, do_description, do_done, check_description, check_done, act_description, act_done, due_date } = req.body;
        if (!project_id) {
            return res.status(400).send('Invalid input');
        }
        const stmt = db_for_app7.prepare('INSERT INTO packs (project_id, plan_description, plan_done, do_description, do_done, check_description, check_done, act_description, act_done, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        const info = stmt.run(project_id, plan_description, plan_done, do_description, do_done, check_description, check_done, act_description, act_done, due_date);
        res.status(201).json({ id: info.lastInsertRowid });
    } catch (error) {
        console.error('Error creating pack:', error);
        res.status(500).send('Internal server error');
    }
});

// 改善アイデアの作成
app.post('/improvement_ideas', (req, res) => {
    try {
        const { pack_id, type, description } = req.body;
        if (!pack_id || !type || !description) {
            return res.status(400).send('Invalid input');
        }
        const stmt = db_for_app7.prepare('INSERT INTO improvement_ideas (pack_id, type, description) VALUES (?, ?, ?)');
        const info = stmt.run(pack_id, type, description);
        res.status(201).json({ id: info.lastInsertRowid });
    } catch (error) {
        console.error('Error creating improvement_idea:', error);
        res.status(500).send('Internal server error');
    }
});

// リンクの作成
app.post('/links', (req, res) => {
    try {
        const { pack_id, improvement_idea_id, url, description } = req.body;
        if (!pack_id || !url) {
            return res.status(400).send('Invalid input');
        }
        const stmt = db_for_app7.prepare('INSERT INTO links (pack_id, improvement_idea_id, url, description) VALUES (?, ?, ?, ?)');
        const info = stmt.run(pack_id, improvement_idea_id, url, description);
        res.status(201).json({ id: info.lastInsertRowid });
    } catch (error) {
        console.error('Error creating link:', error);
        res.status(500).send('Internal server error');
    }
});

// CRUD 取得エンドポイント

// ユーザーの取得
app.get('/users/:id', (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db_for_app7.prepare('SELECT * FROM users WHERE id = ?');
        const user = stmt.get(id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send('Internal server error');
    }
});

// プロジェクトの取得
app.get('/projects/:id', (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db_for_app7.prepare('SELECT * FROM projects WHERE id = ?');
        const project = stmt.get(id);
        if (project) {
            res.json(project);
        } else {
            res.status(404).send('Project not found');
        }
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).send('Internal server error');
    }
});

// メンバーの取得
app.get('/members/:id', (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db_for_app7.prepare('SELECT * FROM members WHERE id = ?');
        const member = stmt.get(id);
        if (member) {
            res.json(member);
        } else {
            res.status(404).send('Member not found');
        }
    } catch (error) {
        console.error('Error fetching member:', error);
        res.status(500).send('Internal server error');
    }
});

// プロジェクトメンバーの取得
app.get('/project_members/:project_id/:member_id', (req, res) => {
    try {
        const { project_id, member_id } = req.params;
        const stmt = db_for_app7.prepare('SELECT * FROM project_members WHERE project_id = ? AND member_id = ?');
        const project_member = stmt.get(project_id, member_id);
        if (project_member) {
            res.json(project_member);
        } else {
            res.status(404).send('Project Member not found');
        }
    } catch (error) {
        console.error('Error fetching project_member:', error);
        res.status(500).send('Internal server error');
    }
});

// 価格の取得
app.get('/objective_prices/:id', (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db_for_app7.prepare('SELECT * FROM objective_prices WHERE id = ?');
        const objective_price = stmt.get(id);
        if (objective_price) {
            res.json(objective_price);
        } else {
            res.status(404).send('Objective Price not found');
        }
    } catch (error) {
        console.error('Error fetching objective_price:', error);
        res.status(500).send('Internal server error');
    }
});

// パックの取得
app.get('/packs/:id', (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db_for_app7.prepare('SELECT * FROM packs WHERE id = ?');
        const pack = stmt.get(id);
        if (pack) {
            res.json(pack);
        } else {
            res.status(404).send('Pack not found');
        }
    } catch (error) {
        console.error('Error fetching pack:', error);
        res.status(500).send('Internal server error');
    }
});

// 改善アイデアの取得
app.get('/improvement_ideas/:id', (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db_for_app7.prepare('SELECT * FROM improvement_ideas WHERE id = ?');
        const improvement_idea = stmt.get(id);
        if (improvement_idea) {
            res.json(improvement_idea);
        } else {
            res.status(404).send('Improvement Idea not found');
        }
    } catch (error) {
        console.error('Error fetching improvement_idea:', error);
        res.status(500).send('Internal server error');
    }
});

// リンクの取得
app.get('/links/:id', (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db_for_app7.prepare('SELECT * FROM links WHERE id = ?');
        const link = stmt.get(id);
        if (link) {
            res.json(link);
        } else {
            res.status(404).send('Link not found');
        }
    } catch (error) {
        console.error('Error fetching link:', error);
        res.status(500).send('Internal server error');
    }
});

// CRUD 更新エンドポイント

// ユーザーの更新
app.put('/users/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;
        if (!name && !email) {
            return res.status(400).send('Invalid input');
        }
        const updates = [];
        if (name) updates.push(`name = '${name}'`);
        if (email) updates.push(`email = '${email}'`);
        if (updates.length === 0) return res.status(400).send('Nothing to update');
        const stmt = db_for_app7.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`);
        const info = stmt.run(id);
        if (info.changes > 0) {
            res.send('User updated');
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Internal server error');
    }
});

// プロジェクトの更新
app.put('/projects/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, kpi, due_date, difficulty, current_price, target_price } = req.body;
        const updates = [];
        if (name) updates.push(`name = '${name}'`);
        if (description) updates.push(`description = '${description}'`);
        if (kpi !== undefined) updates.push(`kpi = ${kpi}`);
        if (due_date) updates.push(`due_date = ${due_date}`);
        if (difficulty !== undefined) updates.push(`difficulty = ${difficulty}`);
        if (current_price !== undefined) updates.push(`current_price = ${current_price}`);
        if (target_price !== undefined) updates.push(`target_price = ${target_price}`);
        if (updates.length === 0) return res.status(400).send('Nothing to update');
        const stmt = db_for_app7.prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`);
        const info = stmt.run(id);
        if (info.changes > 0) {
            res.send('Project updated');
        } else {
            res.status(404).send('Project not found');
        }
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).send('Internal server error');
    }
});

// メンバーの更新
app.put('/members/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name, position, link } = req.body;
        const updates = [];
        if (name) updates.push(`name = '${name}'`);
        if (position) updates.push(`position = '${position}'`);
        if (link) updates.push(`link = '${link}'`);
        if (updates.length === 0) return res.status(400).send('Nothing to update');
        const stmt = db_for_app7.prepare(`UPDATE members SET ${updates.join(', ')} WHERE id = ?`);
        const info = stmt.run(id);
        if (info.changes > 0) {
            res.send('Member updated');
        } else {
            res.status(404).send('Member not found');
        }
    } catch (error) {
        console.error('Error updating member:', error);
        res.status(500).send('Internal server error');
    }
});

// プロジェクトメンバーの更新
app.put('/project_members/:project_id/:member_id', (req, res) => {
    try {
        const { project_id, member_id } = req.params;
        const { role } = req.body;
        if (role === undefined) return res.status(400).send('Invalid input');
        const stmt = db_for_app7.prepare('UPDATE project_members SET role = ? WHERE project_id = ? AND member_id = ?');
        const info = stmt.run(role, project_id, member_id);
        if (info.changes > 0) {
            res.send('Project Member updated');
        } else {
            res.status(404).send('Project Member not found');
        }
    } catch (error) {
        console.error('Error updating project_member:', error);
        res.status(500).send('Internal server error');
    }
});

// 価格の更新
app.put('/objective_prices/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { price } = req.body;
        if (price === undefined) return res.status(400).send('Invalid input');
        const stmt = db_for_app7.prepare('UPDATE objective_prices SET price = ? WHERE id = ?');
        const info = stmt.run(price, id);
        if (info.changes > 0) {
            res.send('Objective Price updated');
        } else {
            res.status(404).send('Objective Price not found');
        }
    } catch (error) {
        console.error('Error updating objective_price:', error);
        res.status(500).send('Internal server error');
    }
});

// パックの更新
app.put('/packs/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const updates = [];
        if (name) updates.push(`name = '${name}'`);
        if (description) updates.push(`description = '${description}'`);
        if (updates.length === 0) return res.status(400).send('Nothing to update');
        const stmt = db_for_app7.prepare(`UPDATE packs SET ${updates.join(', ')} WHERE id = ?`);
        const info = stmt.run(id);
        if (info.changes > 0) {
            res.send('Pack updated');
        } else {
            res.status(404).send('Pack not found');
        }
    } catch (error) {
        console.error('Error updating pack:', error);
        res.status(500).send('Internal server error');
    }
});

// 改善アイデアの更新
app.put('/improvement_ideas/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { type, description } = req.body;
        const updates = [];
        if (type) updates.push(`type = '${type}'`);
        if (description) updates.push(`description = '${description}'`);
        if (updates.length === 0) return res.status(400).send('Nothing to update');
        const stmt = db_for_app7.prepare(`UPDATE improvement_ideas SET ${updates.join(', ')} WHERE id = ?`);
        const info = stmt.run(id);
        if (info.changes > 0) {
            res.send('Improvement Idea updated');
        } else {
            res.status(404).send('Improvement Idea not found');
        }
    } catch (error) {
        console.error('Error updating improvement_idea:', error);
        res.status(500).send('Internal server error');
    }
});

// リンクの更新
app.put('/links/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { url, description } = req.body;
        const updates = [];
        if (url) updates.push(`url = '${url}'`);
        if (description) updates.push(`description = '${description}'`);
        if (updates.length === 0) return res.status(400).send('Nothing to update');
        const stmt = db_for_app7.prepare(`UPDATE links SET ${updates.join(', ')} WHERE id = ?`);
        const info = stmt.run(id);
        if (info.changes > 0) {
            res.send('Link updated');
        } else {
            res.status(404).send('Link not found');
        }
    } catch (error) {
        console.error('Error updating link:', error);
        res.status(500).send('Internal server error');
    }
});

// CRUD 削除エンドポイント

// ユーザーの削除
app.delete('/users/:id', (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db_for_app7.prepare('DELETE FROM users WHERE id = ?');
        const info = stmt.run(id);
        if (info.changes > 0) {
            res.send('User deleted');
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Internal server error');
    }
});

// プロジェクトの削除
app.delete('/projects/:id', (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db_for_app7.prepare('DELETE FROM projects WHERE id = ?');
        const info = stmt.run(id);
        if (info.changes > 0) {
            res.send('Project deleted');
        } else {
            res.status(404).send('Project not found');
        }
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).send('Internal server error');
    }
});

// メンバーの削除
app.delete('/members/:id', (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db_for_app7.prepare('DELETE FROM members WHERE id = ?');
        const info = stmt.run(id);
        if (info.changes > 0) {
            res.send('Member deleted');
        } else {
            res.status(404).send('Member not found');
        }
    } catch (error) {
        console.error('Error deleting member:', error);
        res.status(500).send('Internal server error');
    }
});

// プロジェクトメンバーの削除
app.delete('/project_members/:project_id/:member_id', (req, res) => {
    try {
        const { project_id, member_id } = req.params;
        const stmt = db_for_app7.prepare('DELETE FROM project_members WHERE project_id = ? AND member_id = ?');
        const info = stmt.run(project_id, member_id);
        if (info.changes > 0) {
            res.send('Project Member deleted');
        } else {
            res.status(404).send('Project Member not found');
        }
    } catch (error) {
        console.error('Error deleting project_member:', error);
        res.status(500).send('Internal server error');
    }
});

// 価格の削除
app.delete('/objective_prices/:id', (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db_for_app7.prepare('DELETE FROM objective_prices WHERE id = ?');
        const info = stmt.run(id);
        if (info.changes > 0) {
            res.send('Objective Price deleted');
        } else {
            res.status(404).send('Objective Price not found');
        }
    } catch (error) {
        console.error('Error deleting objective_price:', error);
        res.status(500).send('Internal server error');
    }
});

// パックの削除
app.delete('/packs/:id', (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db_for_app7.prepare('DELETE FROM packs WHERE id = ?');
        const info = stmt.run(id);
        if (info.changes > 0) {
            res.send('Pack deleted');
        } else {
            res.status(404).send('Pack not found');
        }
    } catch (error) {
        console.error('Error deleting pack:', error);
        res.status(500).send('Internal server error');
    }
});

// 改善アイデアの削除
app.delete('/improvement_ideas/:id', (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db_for_app7.prepare('DELETE FROM improvement_ideas WHERE id = ?');
        const info = stmt.run(id);
        if (info.changes > 0) {
            res.send('Improvement Idea deleted');
        } else {
            res.status(404).send('Improvement Idea not found');
        }
    } catch (error) {
        console.error('Error deleting improvement_idea:', error);
        res.status(500).send('Internal server error');
    }
});

// リンクの削除
app.delete('/links/:id', (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db_for_app7.prepare('DELETE FROM links WHERE id = ?');
        const info = stmt.run(id);
        if (info.changes > 0) {
            res.send('Link deleted');
        } else {
            res.status(404).send('Link not found');
        }
    } catch (error) {
        console.error('Error deleting link:', error);
        res.status(500).send('Internal server error');
    }
});

app.listen(8000, () => {
    console.log('Server is running on http://localhost:3000');
});
