// このサンプルデータを基に、プロジェクトやパック、改善案、メンバー、価格に対するバリデーションルールを策定します。以下に各項目ごとのバリデーションルールを示します。

// - **`id`**: 整数で、重複がないこと。
// - **`name`**: 1文字以上50文字以下であること。空欄禁止。
// - **`description`**: 1文字以上300文字以下であること。
// - **`kpi`**: 0以上100以下の数値。
// - **`due_date`**: プロジェクトの締め切りまでの期間（時間単位）。0以上であること。
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
// - **`due_date`**: 現在の日時より未来の日付であること。


// - `due_date`が過去の日付の場合、バリデーションエラーを返す。


// - **`id`**: 整数で、重複がないこと。
// - **`name`**: 1文字以上50文字以下であること。空欄禁止。
// - **`link`**: 有効なURLであること。

// 1. プロジェクトが `kpi` の範囲外の場合：
//    - エラー例: 「`kpi` は 0 以上 100 以下の範囲でなければなりません。」

// 2. `due_date` が過去の日付の場合：
//    - エラー例: 「`due_date` は現在の日付より未来の日付である必要があります。」

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


// 全てのプロジェクトとそれに紐づくpacksを取得するエンドポイント。packのみも取得している。
app.get('/', (req, res) => {
    try {
// projectsだけを取得する
        const projects = db_for_app7.prepare('SELECT * FROM projects').all();

        // packsだけを取得する
        let packs = db_for_app7.prepare('SELECT * FROM packs').all();

        // packsのそれぞれのstageに対してlinksを取得して、packsに追加する
        // 全てのlinksを取得
        const links = db_for_app7.prepare('SELECT * FROM links').all();
        packs = packs.map(pack => {
            const packLinks = links.filter(link => link.pack_id === pack.id);
            // console.log(packLinks);
            return {
                ...pack,
                plan: {
                    ...pack.plan,
                    links: packLinks.filter(link => link.stage === 'plan')
                },
                do: {
                    ...pack.do,
                    links: packLinks.filter(link => link.stage === 'do')
                },
                check: {
                    ...pack.check,
                    links: packLinks.filter(link => link.stage === 'check')
                },
                act: {
                    ...pack.act,
                    links: packLinks.filter(link => link.stage === 'act')
                }
            };
        });

        // projectsにpacksを追加する
        const projects_and_packs = projects.map(project => {
            const projectPacks = packs.filter(pack => pack.project_id === project.id);
            return {
                ...project,
                packs: projectPacks
            };
        });

        if (projects.length > 0) {
            res.json({projects: projects, packs: packs, projects_and_packs: projects_and_packs});
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
        "due_date": 96,
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
                "due_date": "2023-12-01T00:00:00Z"
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
                "due_date": "2023-12-05T00:00:00Z"
            }
        ]
    },
    {
        "id": 2,
        "name": "Project 2",
        "description": "Description 2",
        "kpi": 60,
        "due_date": 72,
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
                "due_date": "2023-12-10T00:00:00Z"
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
                "due_date": "2023-12-15T00:00:00Z"
            }
        ]
    },
    {
        "id": 3,
        "name": "Project 3",
        "description": "Description 3",
        "kpi": 40,
        "due_date": 48,
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
                "due_date": "2023-12-20T00:00:00Z"
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
                "due_date": "2023-12-25T00:00:00Z"
            }
        ]
    }
];

const insert_sample_data = () => {
try {
    // usersにサンプルデータを挿入
    const userStmt = db_for_app7.prepare('INSERT INTO users (uid) VALUES (?)');
    userStmt.run('user1');
    userStmt.run('user2');
    userStmt.run('user3');

    data.forEach(project => {
        const projectStmt = db_for_app7.prepare('INSERT INTO projects (name, description, kpi, due_date, difficulty, user_id) VALUES (?, ?, ?, ?, ?, 1)');
        const projectInfo = projectStmt.run(project.name, project.description, project.kpi, project.due_date, project.difficulty);
        const projectId = projectInfo.lastInsertRowid;

        // project.packsが存在しない場合はスキップ
        if (!project.packs) return;
        project.packs.forEach(pack => {
            const packStmt = db_for_app7.prepare('INSERT INTO packs (project_id, plan_description, plan_done, do_description, do_done, check_description, check_done, act_description, act_done, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            const packInfo = packStmt.run(projectId, pack.plan.description, pack.plan.done, pack.do.description, pack.do.done, pack.check.description, pack.check.done, pack.act.description, pack.act.done, pack.due_date);
            const packId = packInfo.lastInsertRowid;

                    // packのそれぞれのstageに対してlinksが存在する場合linksを挿入

                if (pack.plan.links) {
                    pack.plan.links.forEach(link => {
                        const linkStmt = db_for_app7.prepare('INSERT INTO links (pack_id, url, description, stage) VALUES (?, ?, ?, ?)');
                        linkStmt.run(packId, link.href, link.description, 'plan');
                    });
                }
                if (pack.do.links) {
                    pack.do.links.forEach(link => {
                        const linkStmt = db_for_app7.prepare('INSERT INTO links (pack_id, url, description, stage) VALUES (?, ?, ?, ?)');
                        linkStmt.run(packId, link.href, link.description, 'do');
                    });
                }
                if (pack.check.links) {
                    pack.check.links.forEach(link => {
                        const linkStmt = db_for_app7.prepare('INSERT INTO links (pack_id, url, description, stage) VALUES (?, ?, ?, ?)');
                        linkStmt.run(packId, link.href, link.description, 'check');
                    });
                }
                if (pack.act.links) {
                    pack.act.links.forEach(link => {
                        const linkStmt = db_for_app7.prepare('INSERT INTO links (pack_id, url, description, stage) VALUES (?, ?, ?, ?)');
                        linkStmt.run(packId, link.href, link.description, 'act');
                    });
                }

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
            url TEXT,
            stage TEXT,
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
        const { password } = req.body;
        if (password !== 'init') {
            return res.status(400).send('Invalid password');
        }
        insert_sample_data();
        res.status(201).send('Sample data inserted');
    } catch (error) {
        console.error('Error inserting sample data:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/init_db', (req, res) => {
    try {
        const { password } = req.body;
        if (password !== 'init') {
            return res.status(400).send('Invalid password');
        }
        init_db();
        insert_sample_data();
        res.status(201).send('Database initialized');
    } catch (error) {
        console.error('Error initializing database:', error);
        res.status(500).send('Internal server error');
    }
});

const all_validation_fn = {
    validateUser: (uid) => {
        const errors = [];
        const uidRegex = /^[a-zA-Z0-9_-]{28}$/; // Google Firebase Authentication UID format
        if (!uidRegex.test(uid)) {
            errors.push('Invalid UID format');
        }
        return errors;
    },
    validateProject: (project) => {
        const errors = [];
        if (typeof project.name !== 'string' || project.name.length < 1 || project.name.length > 50) {
            errors.push('Invalid project name');
        }
        if (typeof project.description !== 'string' || project.description.length < 1 || project.description.length > 300) {
            errors.push('Invalid project description');
        }
        if (!Number.isInteger(project.kpi) || project.kpi < 0 || project.kpi > 100) {
            errors.push('Invalid project KPI');
        }
        if (isNaN(Date.parse(project.due_date))) {
            errors.push('Invalid project due date');
        }
        if (!Number.isInteger(project.difficulty) || project.difficulty < 1 || project.difficulty > 5) {
            errors.push('Invalid project difficulty');
        }
        return errors;
    },
    validatePack: (pack) => {
        const errors = [];
        if (typeof pack.plan_description !== 'string' || pack.plan_description.length < 1 || pack.plan_description.length > 300) {
            errors.push('Invalid plan description');
        }
        if (![0, 1].includes(pack.plan_done)) {
            errors.push('Invalid plan done value');
        }
        if (typeof pack.do_description !== 'string' || pack.do_description.length < 1 || pack.do_description.length > 300) {
            errors.push('Invalid do description');
        }
        if (![0, 1].includes(pack.do_done)) {
            errors.push('Invalid do done value');
        }
        if (typeof pack.check_description !== 'string' || pack.check_description.length < 1 || pack.check_description.length > 300) {
            errors.push('Invalid check description');
        }
        if (![0, 1].includes(pack.check_done)) {
            errors.push('Invalid check done value');
        }
        if (typeof pack.act_description !== 'string' || pack.act_description.length < 1 || pack.act_description.length > 300) {
            errors.push('Invalid act description');
        }
        if (![0, 1].includes(pack.act_done)) {
            errors.push('Invalid act done value');
        }
        if (isNaN(Date.parse(pack.due_date))) {
            errors.push('Invalid pack due date');
        }
        return errors;
    },
    validateLink: (link) => {
        const errors = [];
        const validStages = ['plan', 'do', 'check', 'act'];
    
        if (typeof link.url !== 'string' || link.url.length < 1 || link.url.length > 300 || !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(link.url)) {
            errors.push('Invalid URL');
        }
        if (typeof link.description !== 'string' || link.description.length < 1 || link.description.length > 300) {
            errors.push('Invalid link description');
        }
        if (!validStages.includes(link.stage)) {
            errors.push('Invalid stage');
        }
        return errors;
    }
};


const sql_validation_fn = {
    validateUserId: async (userId, db) => {
        const errors = [];
        const stmt = db.prepare('SELECT COUNT(*) AS count FROM users WHERE id = ?');
        const result = await stmt.get(userId);
        if (result.count === 0) {
            errors.push('User not found');
        }
        return errors;
    },
    validateProjectId: async (projectId, db) => {
        const errors = [];
        const stmt = db.prepare('SELECT COUNT(*) AS count FROM projects WHERE id = ?');
        const result = await stmt.get(projectId);
        if (result.count === 0) {
            errors.push('Project not found');
        }
        return errors;
    },
    validatePackId: async (packId, db) => {
        const errors = [];
        const stmt = db.prepare('SELECT COUNT(*) AS count FROM packs WHERE id = ?');
        const result = await stmt.get(packId);
        if (result.count === 0) {
            errors.push('Pack not found');
        }
        return errors;
    }
};

// CRUD エンドポイントの定義
// uidからuserIdを取得する関数
const get_user_id = async (uid, db) => {
    try {
    const stmt = db.prepare('SELECT id FROM users WHERE uid = ?');
    const result = stmt.get(uid);
    if (!result) {
        throw new Error('User not found');
    }
    return result.id;
} catch (error) {
    console.error('Error fetching user ID:', error);
    throw error;
    }
};
// userの作成
async function create_users(req, res) {
    try {
        const { uid } = req.body;
        const errors = all_validation_fn.validateUser(uid);
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        // すでに存在するuidの場合は正常終了
        const userStmt = db_for_app7.prepare('SELECT id FROM users WHERE uid = ?');
        const user = userStmt.get(uid);
        if (user) {
            return res.status(200).json({ id: user.id });
        }
        const stmt = db_for_app7.prepare('INSERT INTO users (uid) VALUES (?)');
        const info = stmt.run(uid);
        res.status(201).json({ id: info.lastInsertRowid });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Internal server error');
    }
}

// プロジェクトの作成
app.post('/create_projects', async (req, res) => {
    try {
        const { name, description, kpi, due_date, difficulty, uid} = req.body;
        // get_user_idとcreate_usersでuidをチェック。なければ作成

        const user_id = await get_user_id(uid, db_for_app7);
        if (!user_id) {
            await create_users(req, res);
        }

        const project = { name, description, kpi, due_date, difficulty };
        const errors = all_validation_fn.validateProject(project);
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        const userErrors = await sql_validation_fn.validateUserId(await get_user_id(uid, db_for_app7), db_for_app7);
        if (userErrors.length > 0) {
            return res.status(404).json({ errors: userErrors });
        }

        const stmt = db_for_app7.prepare('INSERT INTO projects (user_id, name, description, kpi, due_date, difficulty) VALUES (?, ?, ?, ?, ?, ?)');
        const info = stmt.run(user_id, name, description, kpi, due_date, difficulty);
        res.status(201).json({ id: info.lastInsertRowid });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).send('Internal server error');
    }
});

// パックの作成
app.post('/create_packs', async (req, res) => {
    try {
        const { project_id, plan_description, plan_done, do_description, do_done, check_description, check_done, act_description, act_done, due_date, uid } = req.body;
        const pack = { plan_description, plan_done, do_description, do_done, check_description, check_done, act_description, act_done, due_date };
        const errors = all_validation_fn.validatePack(pack);
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        const projectErrors = await sql_validation_fn.validateProjectId(project_id, db_for_app7);
        if (projectErrors.length > 0) {
            return res.status(404).json({ errors: projectErrors });
        }
        const userErrors = await sql_validation_fn.validateUserId(await get_user_id(uid, db_for_app7), db_for_app7);
        if (userErrors.length > 0) {
            return res.status(404).json({ errors: userErrors });
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
app.post('/create_links', async (req, res) => {
    try {
        const { pack_id, url, description, stage, uid } = req.body;
        const link = { url, description, stage };
        const errors = all_validation_fn.validateLink(link);
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        const packErrors = await sql_validation_fn.validatePackId(pack_id, db_for_app7);
        if (packErrors.length > 0) {
            return res.status(404).json({ errors: packErrors });
        }
        const userErrors = await sql_validation_fn.validateUserId(await get_user_id(uid, db_for_app7), db_for_app7);
        if (userErrors.length > 0) {
            return res.status(404).json({ errors: userErrors });
        }

        const stmt = db_for_app7.prepare('INSERT INTO links (pack_id, url, description) VALUES (?, ?, ?)');
        const info = stmt.run(pack_id, url, description);
        res.status(201).json({ id: info.lastInsertRowid });
    } catch (error) {
        console.error('Error creating link:', error);
        res.status(500).send('Internal server error');
    }
});