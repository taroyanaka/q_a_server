const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite = require('better-sqlite3');
const crypto = require('crypto');

app.use(bodyParser.json());
app.use(cors());

// データベースの初期化
const db_for_app8 = new sqlite('./app8.db');

const port = 8000;
app.listen(port, "0.0.0.0", () => console.log(`App listening!! at http://localhost:${port}`));

const validators = {
    validate_auth_uid(uid) {
        const uid_regex = /^[a-zA-Z0-9_-]+$/;
        return uid_regex.test(uid);
    },
    validate_desc_id(id) {
        return Number.isInteger(id) && id > 0;
    },
    validate_iso_date(date) {
        const iso_date_regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
        return iso_date_regex.test(date);
    },
    validate_title(title) {
        return typeof title === 'string' && title.length >= 1 && title.length <= 100;
    },
    validate_description(description) {
        return typeof description === 'string' && description.length >= 1 && description.length <= 1000;
    },
    validate_tag_name(name) {
        return typeof name === 'string' && name.length >= 1 && name.length <= 10;
    },
    validate_data(data) {
        const { auth_uid, desc_id, created_at, updated_at, title, description, tags } = data;

        const is_auth_uid_valid = this.validate_auth_uid(auth_uid);
        const is_desc_id_valid = this.validate_desc_id(desc_id);
        const is_created_at_valid = this.validate_iso_date(created_at);
        const is_updated_at_valid = this.validate_iso_date(updated_at);
        const is_title_valid = this.validate_title(title);
        const is_description_valid = this.validate_description(description);
        const are_tags_valid = tags.every(tag => this.validate_tag_name(tag.name));

        return {
            is_auth_uid_valid,
            is_desc_id_valid,
            is_created_at_valid,
            is_updated_at_valid,
            is_title_valid,
            is_description_valid,
            are_tags_valid
        };
    }
};

// パラメーターにuidが存在しない場合は、エラーを返す関数(引数はuid)
function check_auth_uid(uid) {
    if (!uid) {
        return res.status(400).json({ message: 'auth_uid is required' });
    }
}

// auth_uidをSHA-256でハッシュ化する関数
function hash_auth_uid(auth_uid) {
    return crypto.createHash('sha256').update(auth_uid).digest('hex');
}

// タグを追加する関数
function add_tag_for_app8(desc_id, name, created_at, updated_at) {
    created_at = new Date(created_at).toISOString();
    updated_at = new Date(updated_at).toISOString();

    const select_tag_stmt = db_for_app8.prepare(`
        SELECT id FROM tags WHERE name = ?
    `);
    const existing_tag = select_tag_stmt.get(name);

    let tag_id;
    if (existing_tag) {
        tag_id = existing_tag.id;
    } else {
        const insert_tag_stmt = db_for_app8.prepare(`
            INSERT INTO tags (name, created_at, updated_at)
            VALUES (?, ?, ?)
        `);
        const result = insert_tag_stmt.run(name, created_at, updated_at);
        tag_id = result.lastInsertRowid;
    }

    const insert_desc_tags_stmt = db_for_app8.prepare(`
        INSERT INTO desc_tags (desc_id, tag_id)
        VALUES (?, ?)
    `);
    insert_desc_tags_stmt.run(desc_id, tag_id);
}

const init_db = () => {
    try {
        db_for_app8.exec('DROP TABLE IF EXISTS desc');
        db_for_app8.exec('DROP TABLE IF EXISTS desc_tags');
        db_for_app8.exec('DROP TABLE IF EXISTS tags');

        db_for_app8.exec(`
        CREATE TABLE IF NOT EXISTS desc (
            id INTEGER PRIMARY KEY,
            auth_uid TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL
        )
        `);

        db_for_app8.exec(`
        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        `);

        db_for_app8.exec(`
        CREATE TABLE IF NOT EXISTS desc_tags (
            id INTEGER PRIMARY KEY,
            desc_id INTEGER NOT NULL,
            tag_id INTEGER NOT NULL,
            FOREIGN KEY (desc_id) REFERENCES desc(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        )
        `);

    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

app.post('/init_db', (req, res) => {
    try {
        init_db();
        res.status(200).json({ message: 'Database initialized successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

function get_all(req) {
    try {
        console.log(req.body);
        const all_descs = db_for_app8.prepare(`SELECT * FROM desc`).all();
        const all_tags = db_for_app8.prepare(`SELECT * FROM tags`).all();
        const desc_tags = db_for_app8.prepare(`SELECT * FROM desc_tags`).all();

        let all_descs_with_tags = all_descs.map(desc => {
            desc.tags = desc_tags
                .filter(desc_tag => desc_tag.desc_id === desc.id)
                .map(desc_tag => {
                    const tag = all_tags.find(tag => tag.id === desc_tag.tag_id);
                    return tag;
                });
            return desc;
        });

        const new_all_descs_with_tags = all_descs_with_tags.map(desc => {
            if (desc.tags) {
                let new_desc_tags = desc.tags.map(tag => {
                    tag.desc_id = desc.id;
                    return tag;
                });
                new_desc_tags = JSON.parse(JSON.stringify(new_desc_tags));
                desc.tags = new_desc_tags;
            } else {
                desc.tags = [];
            }
            return desc;
        });

        console.log(0);
        console.log(new_all_descs_with_tags);
        console.log(0.5);
        console.log(new_all_descs_with_tags.filter(desc => desc.auth_uid === hash_auth_uid(req.body.auth_uid)));

        const any_user_new_all_descs_with_tags = req.body.auth_uid ? new_all_descs_with_tags.filter(desc => desc.auth_uid === hash_auth_uid(req.body.auth_uid)) : [];

        console.log(any_user_new_all_descs_with_tags);

        let new_all_descs_with_tags_without_auth_uid = [];
        let any_user_new_all_descs_with_tags_without_auth_uid = [];
        console.log(1);
        if (req.body.auth_uid) {
            console.log(2);
            // auth_uid以外のユーザーのデータを取得
            new_all_descs_with_tags_without_auth_uid = new_all_descs_with_tags.map(desc => {
                let new_obj = {};
                Object.keys(desc).forEach(key => {
                    if (key !== 'auth_uid') {
                        new_obj[key] = desc[key];
                    }
                });
                return new_obj;
            })
            console.log(3);
            any_user_new_all_descs_with_tags_without_auth_uid = any_user_new_all_descs_with_tags.map(desc => {
                console.log(any_user_new_all_descs_with_tags);
                let new_obj = {};
                Object.keys(desc).forEach(key => {
                    console.log(key);
                    if (key !== 'auth_uid') {
                        console.log(4);
                        new_obj[key] = desc[key];
                    }
                });
                return new_obj;
            });
            console.log(5);
            console.log(any_user_new_all_descs_with_tags_without_auth_uid);
        }
        // all_tags, new_all_descs_with_tags_without_auth_uidとany_user_new_all_descs_with_tags_without_auth_uidそれぞれで、titile, descriptionが1文字未満のdescを削除
        function final_filter(array) {
            return array.filter(desc => desc.title.length >= 1 && desc.description.length >= 1);
        }

        const all_objects = { all_descs: new_all_descs_with_tags_without_auth_uid, all_tags: all_tags, any_user_new_all_descs_with_tags: any_user_new_all_descs_with_tags_without_auth_uid };
        return all_objects;
    } catch (error) {
        return { message: 'Internal server error' };
    }
}

app.post('/', (req, res) => {
    try {
        const all_obj = get_all(req);

        res.status(200).json(all_obj);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/insert_desc', (req, res) => {
    try {
        let { auth_uid, title, description, tags } = req.body;
        check_auth_uid(auth_uid);
        auth_uid = hash_auth_uid(auth_uid);
        const created_at = new Date().toISOString();
        const updated_at = new Date().toISOString();

        const validation_results = validators.validate_data(req.body);

        if (!validation_results.is_auth_uid_valid) {
            return res.status(400).json({ message: 'Invalid auth_uid' });
        }
        if (!validation_results.is_title_valid) {
            return res.status(400).json({ message: 'Invalid title' });
        }
        if (!validation_results.is_description_valid) {
            return res.status(400).json({ message: 'Invalid description' });
        }
        if (!validation_results.are_tags_valid) {
            return res.status(400).json({ message: 'Invalid tags' });
        }

        const insert_desc_stmt = db_for_app8.prepare(`
            INSERT INTO desc (auth_uid, created_at, updated_at, title, description)
            VALUES (?, ?, ?, ?, ?)
        `);
        const result = insert_desc_stmt.run(auth_uid, created_at, updated_at, title, description);

        const desc_id = result.lastInsertRowid;

        tags.forEach(tag => add_tag_for_app8(desc_id, tag.name, created_at, updated_at));
        const res_obj = { message: 'Description and tags inserted successfully', desc_id };

        Object.assign(res_obj, get_all(req));
        res.status(201).json(res_obj);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/update_desc', (req, res) => {
    try {
        let { desc_id, auth_uid, title, description, tags } = req.body;
        check_auth_uid(auth_uid);
        auth_uid = hash_auth_uid(auth_uid);
        const updated_at = new Date().toISOString();

        const validation_results = validators.validate_data(req.body);

        if (!validation_results.is_auth_uid_valid) {
            return res.status(400).json({ message: 'Invalid auth_uid' });
        }
        if (!validation_results.is_title_valid) {
            return res.status(400).json({ message: 'Invalid title' });
        }
        if (!validation_results.is_description_valid) {
            return res.status(400).json({ message: 'Invalid description' });
        }
        if (!validation_results.are_tags_valid) {
            return res.status(400).json({ message: 'Invalid tags' });
        }

        const check_auth_uid_stmt = db_for_app8.prepare(`
            SELECT COUNT(*) AS count FROM desc WHERE id = ? AND auth_uid = ?
        `);
        const { count } = check_auth_uid_stmt.get(desc_id, auth_uid);
        if (count === 0) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const update_desc_stmt = db_for_app8.prepare(`
            UPDATE desc
            SET updated_at = ?, title = ?, description = ?
            WHERE id = ?
        `);
        update_desc_stmt.run(updated_at, title, description, desc_id);

        const delete_desc_tags_stmt = db_for_app8.prepare(`
            DELETE FROM desc_tags WHERE desc_id = ?
        `);
        delete_desc_tags_stmt.run(desc_id);

        tags.forEach(tag => add_tag_for_app8(desc_id, tag.name, tag.created_at, tag.updated_at));

        const res_obj = { message: 'Description and tags updated successfully', desc_id: desc_id };
        Object.assign(res_obj, get_all(req));
        res.status(200).json(res_obj);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/delete_desc', (req, res) => {
    try {
        let { id, auth_uid } = req.body;
        check_auth_uid(auth_uid);
        auth_uid = hash_auth_uid(auth_uid);

        if (!validators.validate_auth_uid(auth_uid)) {
            return res.status(400).json({ message: 'Invalid auth_uid' });
        }

        const check_auth_uid_stmt = db_for_app8.prepare(`
            SELECT COUNT(*) AS count FROM desc WHERE id = ? AND auth_uid = ?
        `);
        const { count } = check_auth_uid_stmt.get(id, auth_uid);
        if (count === 0) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        if (!validators.validate_desc_id(id)) {
            return res.status(400).json({ message: 'Invalid desc_id' });
        }

        const delete_desc_stmt = db_for_app8.prepare(`
            DELETE FROM desc WHERE id = ?
        `);
        delete_desc_stmt.run(id);

        const res_obj = { message: 'Description deleted successfully' };
        Object.assign(res_obj, get_all(req));

        res.status(200).json(res_obj);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/delete_desc_tag', (req, res) => {
    try {
        let { id, desc_id, auth_uid } = req.body;
        check_auth_uid(auth_uid);
        auth_uid = hash_auth_uid(auth_uid);

        if (!validators.validate_auth_uid(auth_uid)) {
            return res.status(400).json({ message: 'Invalid auth_uid' });
        }

        const check_auth_uid_stmt = db_for_app8.prepare(`
            SELECT COUNT(*) AS count FROM desc WHERE id = ? AND auth_uid = ?
        `);
        const { count } = check_auth_uid_stmt.get(desc_id, auth_uid);
        if (count === 0) {
            return res.status(403).json({ message: 'Forbidden1' });
        }

        const delete_desc_tag_stmt = db_for_app8.prepare(`
            DELETE FROM desc_tags WHERE tag_id = ? AND desc_id = ?
        `);
        delete_desc_tag_stmt.run(id, desc_id);

        const res_obj = { message: 'Description tag deleted successfully' };

        Object.assign(res_obj, get_all(req));
        res.status(200).json(res_obj);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/insert_desc_tag', (req, res) => {
    try {
        console.log(1);
        let { desc_id, name } = req.body;
        console.log(req.body);
        const created_at = new Date().toISOString();
        const updated_at = new Date().toISOString();
        console.log(2);

        const select_tag_stmt = db_for_app8.prepare(`
            SELECT id FROM tags WHERE name = ?
        `);
        const existing_tag = select_tag_stmt.get(name);
        console.log(3);
        
        let tag_id;
        if (existing_tag) {
            tag_id = existing_tag.id;
            console.log(4);
        } else {
            console.log(5);
            // エラーチェック
            if (!validators.validate_tag_name(name)) {
                console.log(6);
                return res.status(400).json({ message: 'Invalid tag name' });
            }
            console.log(7);

            const insert_tag_stmt = db_for_app8.prepare(`
                INSERT INTO tags (name, created_at, updated_at)
                VALUES (?, ?, ?)
            `);
            const result = insert_tag_stmt.run(name, created_at, updated_at);
            tag_id = result.lastInsertRowid;
        }
        
        const insert_desc_tags_stmt = db_for_app8.prepare(`
            INSERT INTO desc_tags (desc_id, tag_id)
            VALUES (?, ?)
        `);
        insert_desc_tags_stmt.run(desc_id, tag_id);

        const res_obj = { message: 'Description tag inserted successfully', tag_id };
        Object.assign(res_obj, get_all(req));

        res.status(201).json(res_obj);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});