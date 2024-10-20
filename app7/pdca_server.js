// このサンプルデータを基に、プロジェクトやパック、改善案、メンバー、価格に対するバリデーションルールを策定します。以下に各項目ごとのバリデーションルールを示します。

// - **`id`**: 整数で、重複がないこと。
// - **`name`**: 1文字以上50文字以下であること。空欄禁止。
// - **`description`**: 1文字以上300文字以下であること。
// - **`kpi`**: 0以上100以下の数値。
// - **`dueDate`**: プロジェクトの締め切りまでの期間（時間単位）。0以上であること。
// - **`difficulty`**: 1～5の範囲であること。




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


// - `dueDate`が過去の日付の場合、バリデーションエラーを返す。


// - **`id`**: 整数で、重複がないこと。
// - **`name`**: 1文字以上50文字以下であること。空欄禁止。
// - **`position`**: 1文字以上50文字以下であること。空欄禁止。
// - **`link`**: 有効なURLであること。


// - **`price_description`**: 1文字以上100文字以下であること。


// 1. プロジェクトが `kpi` の範囲外の場合：
//    - エラー例: 「`kpi` は 0 以上 100 以下の範囲でなければなりません。」

// 2. `dueDate` が過去の日付の場合：
//    - エラー例: 「`dueDate` は現在の日付より未来の日付である必要があります。」


const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const cors = require('cors');
app.use(cors());
const port = 8000;
app.listen(port, "0.0.0.0", () => console.log(`App listening!! at http://localhost:${port}`) );
const sqlite = require('better-sqlite3');
const crypto = require('crypto');

// データベースの初期化
const db_for_app7 = new sqlite('app7.db');


// 特定のユーザーに紐づくプロジェクトとそれに紐づく全ての情報を取得するエンドポイントを作成します。
// app.get('/users/:id/projects', (req, res) => {
// app.get('/users/projects', (req, res) => {
app.get('/', (req, res) => {
    try {
        // data変数と同じ形式でデータを取得
        const projects = db_for_app7.prepare(`
            SELECT 
                p.id, p.name, p.description, p.kpi, p.due_date, p.difficulty, 
                json_group_array(
                    json_object(
                        'id', pk.id, 
                        'projectId', pk.project_id, 
                        'plan', json_object('description', pk.plan_description, 'done', pk.plan_done),
                        'do', json_object('description', pk.do_description, 'done', pk.do_done),
                        'check', json_object('description', pk.check_description, 'done', pk.check_done),
                        'act', json_object('description', pk.act_description, 'done', pk.act_done),
                        'dueDate', pk.due_date
                    )
                ) as packs
            FROM projects p
            LEFT JOIN packs pk ON p.id = pk.project_id
            GROUP BY p.id
        `).all();
        function convertData(data) {
            return data.map(project => {
                // Parse the packs string into a JSON array
                const parsedPacks = JSON.parse(project.packs);
        
                // Convert each pack and add empty "links" to plan, do, check, act
                const updatedPacks = parsedPacks.map(pack => ({
                    ...pack,
                    plan: {
                        ...pack.plan,
                        links: pack.plan.links || [] // Add an empty links array if not already present
                    },
                    do: {
                        ...pack.do,
                        links: pack.do.links || [] // Add an empty links array if not already present
                    },
                    check: {
                        ...pack.check,
                        links: pack.check.links || [] // Add an empty links array if not already present
                    },
                    act: {
                        ...pack.act,
                        links: pack.act.links || [] // Add an empty links array if not already present
                    }
                }));
        
                // Return the new project object with the corrected field names and structures
                return {
                    ...project,
                    due_date: parseInt(project.due_date), // Convert due_date to an integer dueDate
                    packs: updatedPacks // Replace packs string with parsed and updated packs
                };
            });
        }
                    

        // Convert the data to the correct format
        const convertedData = convertData(projects);        

        if (projects.length > 0) {
            res.json(convertedData);
        }

    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).send('Internal server error');
    }
});

const data = [
    {
        "id": 1,
        "name": "Project 1",
        "description": "Description 1",
        "kpi": 80,
        "dueDate": 96,
        "difficulty": 3,
        "packs": [
            {
                "id": 1,
                "projectId": 1,
                "plan": {
                    "description": "Plan 1",
                    "done": 1,
                    "links": [
                        {
                            "description": "Link 1",
                            "href": "https://example.com",
                            "stars": 3
                        }
                    ]
                },
                "do": {
                    "description": "Do 1",
                    "done": 0,
                    "links": []
                },
                "check": {
                    "description": "Check 1",
                    "done": 0,
                    "links": []
                },
                "act": {
                    "description": "Act 1",
                    "done": 0,
                    "links": []
                },
                "dueDate": "2023-12-01T00:00:00Z"
            },
            {
                "id": 2,
                "projectId": 1,
                "plan": {
                    "description": "Plan 2",
                    "done": 1,
                    "links": []
                },
                "do": {
                    "description": "Do 2",
                    "done": 1,
                    "links": []
                },
                "check": {
                    "description": "Check 2",
                    "done": 0,
                    "links": []
                },
                "act": {
                    "description": "Act 2",
                    "done": 0,
                    "links": []
                },
                "dueDate": "2023-12-05T00:00:00Z"
            }
        ]
    },
    {
        "id": 2,
        "name": "Project 2",
        "description": "Description 2",
        "kpi": 60,
        "dueDate": 72,
        "difficulty": 2,
        "packs": [
            {
                "id": 3,
                "projectId": 2,
                "plan": {
                    "description": "Plan 3",
                    "done": 1,
                    "links": []
                },
                "do": {
                    "description": "Do 3",
                    "done": 1,
                    "links": []
                },
                "check": {
                    "description": "Check 3",
                    "done": 1,
                    "links": []
                },
                "act": {
                    "description": "Act 3",
                    "done": 1,
                    "links": []
                },
                "dueDate": "2023-12-10T00:00:00Z"
            },
            {
                "id": 4,
                "projectId": 2,
                "plan": {
                    "description": "Plan 4",
                    "done": 1,
                    "links": []
                },
                "do": {
                    "description": "Do 4",
                    "done": 1,
                    "links": []
                },
                "check": {
                    "description": "Check 4",
                    "done": 1,
                    "links": []
                },
                "act": {
                    "description": "Act 4",
                    "done": 0,
                    "links": []
                },
                "dueDate": "2023-12-15T00:00:00Z"
            }
        ]
    },
    {
        "id": 3,
        "name": "Project 3",
        "description": "Description 3",
        "kpi": 40,
        "dueDate": 48,
        "difficulty": 1,
        "packs": [
            {
                "id": 5,
                "projectId": 3,
                "plan": {
                    "description": "Plan 5",
                    "done": 1,
                    "links": []
                },
                "do": {
                    "description": "Do 5",
                    "done": 1,
                    "links": []
                },
                "check": {
                    "description": "Check 5",
                    "done": 0,
                    "links": []
                },
                "act": {
                    "description": "Act 5",
                    "done": 0,
                    "links": []
                },
                "dueDate": "2023-12-20T00:00:00Z"
            },
            {
                "id": 6,
                "projectId": 3,
                "plan": {
                    "description": "Plan 6",
                    "done": 1,
                    "links": []
                },
                "do": {
                    "description": "Do 6",
                    "done": 1,
                    "links": []
                },
                "check": {
                    "description": "Check 6",
                    "done": 1,
                    "links": []
                },
                "act": {
                    "description": "Act 6",
                    "done": 0,
                    "links": []
                },
                "dueDate": "2023-12-25T00:00:00Z"
            }
        ]
    }
];

const insert_sample_data = () => {
try {
    // usersにサンプルデータを挿入
    const userStmt = db_for_app7.prepare('INSERT INTO users (uid, name, email) VALUES (?, ?, ?)');
    userStmt.run('user1', 'User One', 'user1@example.com');
    userStmt.run('user2', 'User Two', 'user2@example.com');
    userStmt.run('user3', 'User Three', 'user3@example.com');

    data.forEach(project => {
        const projectStmt = db_for_app7.prepare('INSERT INTO projects (name, description, kpi, due_date, difficulty, user_id) VALUES (?, ?, ?, ?, ?, ?)');
        const projectInfo = projectStmt.run(project.name, project.description, project.kpi, project.dueDate, project.difficulty, project.userId);
        const projectId = projectInfo.lastInsertRowid;

        // project.packsが存在しない場合はスキップ
        if (!project.packs) return;
        project.packs.forEach(pack => {
            const packStmt = db_for_app7.prepare('INSERT INTO packs (project_id, plan_description, plan_done, do_description, do_done, check_description, check_done, act_description, act_done, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            const packInfo = packStmt.run(projectId, pack.plan.description, pack.plan.done, pack.do.description, pack.do.done, pack.check.description, pack.check.done, pack.act.description, pack.act.done, pack.dueDate);
            const packId = packInfo.lastInsertRowid;
    
            // pack.plan.linksが存在しない場合はスキップ
            if (!pack.plan.links) return;
            pack.plan.links.forEach(link => {
                const linkStmt = db_for_app7.prepare('INSERT INTO links (pack_id, url, description) VALUES (?, ?, ?)');
                linkStmt.run(packId, link.href, link.description);
            });
    
        });
    });
} catch (error) {
    console.error('Error inserting sample data:', error);
}
}

const init_db = () => {
    try {
        db_for_app7.exec('DROP TABLE IF EXISTS links');
        db_for_app7.exec('DROP TABLE IF EXISTS packs');
        db_for_app7.exec('DROP TABLE IF EXISTS projects');
        db_for_app7.exec('DROP TABLE IF EXISTS users');
        
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
            due_date TEXT,
            difficulty INTEGER,
            current_price INTEGER,
            target_price INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`);
        

        
        // パックテーブルの作成
        db_for_app7.exec(`
            CREATE TABLE IF NOT EXISTS packs (
                id INTEGER PRIMARY KEY,
                project_id INTEGER,
                plan_description TEXT,
                plan_done INTEGER,
                do_description TEXT,
                do_done INTEGER,
                check_description TEXT,
                check_done INTEGER,
                act_description TEXT,
                act_done INTEGER,
                due_date TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id)
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
            FOREIGN KEY (pack_id) REFERENCES packs(id)
        )`);
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// サンプルデータ(data)をデータベースに挿入
app.get('/insert_sample_data', (req, res) => {
    try {
        init_db();
        insert_sample_data();
        res.status(201).send('Sample data inserted');
    } catch (error) {
        console.error('Error inserting sample data:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/init_db', (req, res) => {
    try {
        init_db();
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

