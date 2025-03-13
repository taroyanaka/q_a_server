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

app.post('/app7/', (req, res) => {
    try {
        // req.bodyからuidを取得
        const { uid } = req.body;
        console.log("uid", uid);
        let user_id = null;
        if(uid) {
            // console.log(1);
            // uidをSHA256でハッシュ化。ハッシュ化されたuidを使用してユーザーIDを取得
            const hashuid = crypto.createHash('sha256').update(uid).digest('hex');
            // console.log(2);
            const stmt = db_for_app7.prepare('SELECT id FROM users WHERE uid = ?');
            // console.log(3);
            const result = stmt.get(hashuid);
            // console.log(4);
            console.log(hashuid,stmt,result,)
            user_id = result.id;
        }
        // console.log("user_id", user_id);

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
            res.json({projects: projects, packs: packs, projects_and_packs: projects_and_packs, user_id: user_id});
        }
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
app.post('/app7/init_db', (req, res) => {
try {
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
                created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
            )`);
            
            // プロジェクトテーブルの作成
            db_for_app7.exec(`
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                kpi INTEGER NOT NULL,
                due_date TEXT NOT NULL,
                difficulty INTEGER NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
            )`);
            
            // パックテーブルの作成
            db_for_app7.exec(`
            CREATE TABLE IF NOT EXISTS packs (
                id INTEGER PRIMARY KEY,
                project_id INTEGER NOT NULL,
                plan_description TEXT NOT NULL,
                plan_done INTEGER CHECK (plan_done IN (0, 1)),
                do_description TEXT NOT NULL,
                do_done INTEGER CHECK (do_done IN (0, 1)),
                check_description TEXT NOT NULL,
                check_done INTEGER CHECK (check_done IN (0, 1)),
                act_description TEXT NOT NULL,
                act_done INTEGER CHECK (act_done IN (0, 1)),
                due_date TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE
            )`);
            
            // リンクテーブルの作成
            db_for_app7.exec(`
            CREATE TABLE IF NOT EXISTS links (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pack_id INTEGER NOT NULL,
                url TEXT NOT NULL,
                stage TEXT NOT NULL,
                description TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
                FOREIGN KEY (pack_id) REFERENCES packs(id) ON DELETE CASCADE ON UPDATE CASCADE
            )`);
        } catch (error) {
            console.error('Error initializing database:', error);
        }
    }
    const { password } = req.body;
    if (password !== 'init') {
        return res.status(400).json({ message: 'Invalid password' });
    }
    init_db();
    // insert_sample_data();
    res.status(201).json({ message: 'Database initialized' });
} catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({ message: 'Internal server error'});
}
});
const app7_all_validation_fn = {
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
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
        if (!isoDateRegex.test(pack.due_date)) {
            errors.push('Invalid pack due date format. Must be ISO 8601 format.');
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
const app7_sql_validation_fn = {
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
    },
    validateLinkId: async (linkId, db) => {
        const errors = [];
        const stmt = db.prepare('SELECT COUNT(*) AS count FROM links WHERE id = ?');
        const result = await stmt.get(linkId);
        if (result.count === 0) {
            errors.push('Link not found');
        }
        return errors;
    }


};
const app7_get_user_id = async (uid, db) => {
    try {
    const stmt = db.prepare('SELECT id FROM users WHERE uid = ?');
    const result = stmt.get(uid);
    if (!result) {
        return false;
    }
    return result.id;
} catch (error) {
    console.error('Error fetching user ID:', error);
    throw error;
    }
};
app.post('/app7/create_projects', async (req, res) => {
    try {
        async function create_users(req, res) {
            try {
                const { uid } = req.body;
                const errors = app7_all_validation_fn.validateUser(uid);
                if (errors.length > 0) {
                    return res.status(400).json({ errors });
                }
        
                // uidをSHA256でハッシュ化
                const hashuid = crypto.createHash('sha256').update(uid).digest('hex');
        
                // すでに存在するuidの場合はそのidを返す
                const userStmt = db_for_app7.prepare('SELECT id FROM users WHERE uid = ?');
                const user = userStmt.get(hashuid);
                if (user) {
                    return user.id;
                }
        
                // 新しいユーザーを作成
                const stmt = db_for_app7.prepare('INSERT INTO users (uid) VALUES (?)');
                const info = stmt.run(hashuid);
        
                const idStmt = db_for_app7.prepare('SELECT id FROM users WHERE uid = ?');
                const newUser = idStmt.get(hashuid);
                console.log(
        "hashuid,", hashuid,
        "user,", user,
        // "user.id,", user.id,
        "newUser,", newUser,
                );
                return newUser.id;
            } catch (error) {
                console.error('Error creating user:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
        const { name, description, kpi, due_date, difficulty, uid} = req.body;
        // app7_get_user_idとcreate_usersでuidをチェック。なければ作成

        // uidをSHA256でハッシュ化
        const hashuid = crypto.createHash('sha256').update(uid).digest('hex');
        // ハッシュ化されたuidを使用してユーザーIDを取得
        let user_id = await app7_get_user_id(hashuid, db_for_app7);
        console.log(user_id);
        if (!user_id) {
            await create_users(req, res);
            user_id = await app7_get_user_id(hashuid, db_for_app7);
        }

        const project = { name, description, kpi, due_date, difficulty };
        const errors = app7_all_validation_fn.validateProject(project);
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        console.log("user_id", user_id);

        const userErrors = await app7_sql_validation_fn.validateUserId(await app7_get_user_id(hashuid, db_for_app7), db_for_app7);
        if (userErrors.length > 0) {
            return res.status(404).json({ errors: userErrors });
        }
        console.log("userErrors", userErrors);

        const stmt = db_for_app7.prepare('INSERT INTO projects (user_id, name, description, kpi, due_date, difficulty) VALUES (?, ?, ?, ?, ?, ?)');
        const info = stmt.run(user_id, name, description, kpi, due_date, difficulty);
        res.status(201).json({ id: info.lastInsertRowid });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Internal server error'});
    }
});
app.post('/app7/create_packs', async (req, res) => {
    try {
        const { project_id, plan_description, plan_done, do_description, do_done, check_description, check_done, act_description, act_done, uid } = req.body;
console.log(req.body);
        let { due_date } = req.body;
        console.log(due_date);
        // due_dateをISO 8601形式に変換
        due_date = new Date(due_date).toISOString();

        const pack = { plan_description, plan_done, do_description, do_done, check_description, check_done, act_description, act_done, due_date };
        const errors = app7_all_validation_fn.validatePack(pack);
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        const projectErrors = await app7_sql_validation_fn.validateProjectId(project_id, db_for_app7);
        if (projectErrors.length > 0) {
            return res.status(404).json({ errors: projectErrors });
        }
        const hashedUid = crypto.createHash('sha256').update(uid).digest('hex');
        const user_id = await app7_get_user_id(hashedUid, db_for_app7);
        if(user_id === false) {
            console.log("user_id", user_id);
            console.log("// エラー処理");
            // エラー処理
            return res.status(404).json({ errors: ['User not found'] });
        }
        const userErrors = await app7_sql_validation_fn.validateUserId(await app7_get_user_id(hashedUid, db_for_app7), db_for_app7);
        if (userErrors.length > 0) {
            return res.status(404).json({ errors: userErrors });
        }

        const stmt = db_for_app7.prepare('INSERT INTO packs (project_id, plan_description, plan_done, do_description, do_done, check_description, check_done, act_description, act_done, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        const info = stmt.run(project_id, plan_description, plan_done, do_description, do_done, check_description, check_done, act_description, act_done, due_date);
        res.status(201).json({ id: info.lastInsertRowid });
    } catch (error) {
        console.error('Error creating pack:', error);
        res.status(500).json({ message: 'Internal server error'});
    }
});
app.post('/app7/create_links', async (req, res) => {
    try {
        console.log(req.body);
        const { pack_id, url, description, stage, uid } = req.body;
        const link = { url, description, stage };
        const errors = app7_all_validation_fn.validateLink(link);
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        const packErrors = await app7_sql_validation_fn.validatePackId(pack_id, db_for_app7);
        if (packErrors.length > 0) {
            return res.status(404).json({ errors: packErrors });
        }
        const hashedUid = crypto.createHash('sha256').update(uid).digest('hex');

        const userErrors = await app7_sql_validation_fn.validateUserId(await app7_get_user_id(hashedUid, db_for_app7), db_for_app7);
        if (userErrors.length > 0) {
            return res.status(404).json({ errors: userErrors });
        }
        
        const stmt = db_for_app7.prepare('INSERT INTO links (pack_id, url, description, stage) VALUES (?, ?, ?, ?)');
        const info = stmt.run(pack_id, url, description, stage);
        res.status(201).json({ id: info.lastInsertRowid });
    } catch (error) {
        console.error('Error creating link:', error);
        res.status(500).json({ message: 'Internal server error'});
    }
});
app.post('/app7/delete_projects', async (req, res) => {
    try {
        const { project_id, uid } = req.body;
        console.log(req.body);
        const projectErrors = await app7_sql_validation_fn.validateProjectId(project_id, db_for_app7);
        if (projectErrors.length > 0) {
            return res.status(404).json({ errors: projectErrors });
        }
        const hashedUid = crypto.createHash('sha256').update(uid).digest('hex');
        const userErrors = await app7_sql_validation_fn.validateUserId(await app7_get_user_id(hashedUid, db_for_app7), db_for_app7);
        if (userErrors.length > 0) {
            return res.status(404).json({ errors: userErrors });
        }
        const stmt = db_for_app7.prepare('DELETE FROM projects WHERE id = ?');
        stmt.run(project_id);
        // project_idに紐づくpacksが存在するか確認し、存在すれば削除
        const packStmt = db_for_app7.prepare('DELETE FROM packs WHERE project_id = ?');
        packStmt.run(project_id);
        // project_idに紐づくpacksに紐づくlinksが存在するか確認し、存在すれば削除
        const linkStmt = db_for_app7.prepare('DELETE FROM links WHERE pack_id IN (SELECT id FROM packs WHERE project_id = ?)');
        linkStmt.run(project_id);

        res.status(200).json({ message: 'Project deleted' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Internal server error'});
    }
});
app.post('/app7/delete_packs', async (req, res) => {
    try {
        const { pack_id, uid } = req.body;
        const packErrors = await app7_sql_validation_fn.validatePackId(pack_id, db_for_app7);
        if (packErrors.length > 0) {
            return res.status(404).json({ errors: packErrors });
        }
        const hashedUid = crypto.createHash('sha256').update(uid).digest('hex');
        const userErrors = await app7_sql_validation_fn.validateUserId(await app7_get_user_id(hashedUid, db_for_app7), db_for_app7);
        if (userErrors.length > 0) {
            return res.status(404).json({ errors: userErrors });
        }
        const stmt = db_for_app7.prepare('DELETE FROM packs WHERE id = ?');
        stmt.run(pack_id);

        // pack_idに紐づくlinksが存在するか確認し、存在すれば削除
        const linkStmt = db_for_app7.prepare('DELETE FROM links WHERE pack_id = ?');
        linkStmt.run(pack_id);

        // jsonで返す
        res.status(200).json({ message: 'Pack deleted' });
    } catch (error) {
        console.error('Error deleting pack:', error);
        res.status(500).json({ message: 'Internal server error'});
    }
});
app.post('/app7/delete_links', async (req, res) => {
    try {
        const { link_id, uid } = req.body;
        const linkErrors = await app7_sql_validation_fn.validateLinkId(link_id, db_for_app7);
        if (linkErrors.length > 0) {
            return res.status(404).json({ errors: linkErrors });
        }
        const hashedUid = crypto.createHash('sha256').update(uid).digest('hex');
        const userErrors = await app7_sql_validation_fn.validateUserId(await app7_get_user_id(hashedUid, db_for_app7), db_for_app7);
        if (userErrors.length > 0) {
            return res.status(404).json({ errors: userErrors });
        }
        const stmt = db_for_app7.prepare('DELETE FROM links WHERE id = ?');
        stmt.run(link_id);
        res.status(200).json({ message: 'Link deleted' });
    } catch (error) {
        console.error('Error deleting link:', error);
        res.status(500).json({ message: 'Internal server error'});
    }
});
app.post('/app7/update_projects', async (req, res) => {
    try {
        const { project_id, name, description, kpi, due_date, difficulty, uid } = req.body;
        const project = { name, description, kpi, due_date, difficulty };
        const errors = app7_all_validation_fn.validateProject(project);
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        const projectErrors = await app7_sql_validation_fn.validateProjectId(project_id, db_for_app7);
        if (projectErrors.length > 0) {
            return res.status(404).json({ errors: projectErrors });
        }
        const hashedUid = crypto.createHash('sha256').update(uid).digest('hex');
        const userErrors = await app7_sql_validation_fn.validateUserId(await app7_get_user_id(hashedUid, db_for_app7), db_for_app7);
        if (userErrors.length > 0) {
            return res.status(404).json({ errors: userErrors });
        }
        const stmt = db_for_app7.prepare('UPDATE projects SET name = ?, description = ?, kpi = ?, due_date = ?, difficulty = ? WHERE id = ?');
        stmt.run(name, description, kpi, due_date, difficulty, project_id);
        res.status(200).json({ message: 'Project updated' });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: 'Internal server error'});
    }
});
app.post('/app7/update_packs', async (req, res) => {
    try {
        const { pack_id, project_id, plan_description, plan_done, do_description, do_done, check_description, check_done, act_description, act_done, due_date, uid } = req.body;
        let pack = { plan_description, plan_done, do_description, do_done, check_description, check_done, act_description, act_done, due_date };
        const errors = app7_all_validation_fn.validatePack(pack);
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        const packErrors = await app7_sql_validation_fn.validatePackId(pack_id, db_for_app7);
        if (packErrors.length > 0) {
            return res.status(404).json({ errors: packErrors });
        }
        const hashedUid = crypto.createHash('sha256').update(uid).digest('hex');
        const userErrors = await app7_sql_validation_fn.validateUserId(await app7_get_user_id(hashedUid, db_for_app7), db_for_app7);
        if (userErrors.length > 0) {
            return res.status(404).json({ errors: userErrors });
        }
        const stmt = db_for_app7.prepare('UPDATE packs SET plan_description = ?, plan_done = ?, do_description = ?, do_done = ?, check_description = ?, check_done = ?, act_description = ?, act_done = ?, due_date = ? WHERE id = ?');
        stmt.run(plan_description, plan_done, do_description, do_done, check_description, check_done, act_description, act_done, due_date, pack_id);
        res.status(200).json({ message: 'Pack updated' });
    } catch (error) {
        console.error('Error updating pack:', error);
        res.status(500).json({ message: 'Internal server error'});
    }
});
