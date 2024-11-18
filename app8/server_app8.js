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
    validateAuthUid(uid) {
        const uidRegex = /^[a-zA-Z0-9_-]+$/;
        return uidRegex.test(uid);
    },
    validateDescId(id) {
        return Number.isInteger(id) && id > 0;
    },
    validateISODate(date) {
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
        return isoDateRegex.test(date);
    },
    validateTitle(title) {
        return typeof title === 'string' && title.length >= 1 && title.length <= 100;
    },
    validateDescription(description) {
        return typeof description === 'string' && description.length >= 1 && description.length <= 1000;
    },
    validateTagName(name) {
        return typeof name === 'string' && name.length >= 1 && name.length <= 10;
    },
    validateData(data) {
        const { auth_uid, desc_id, created_at, updated_at, title, description, tags } = data;

        const isAuthUidValid = this.validateAuthUid(auth_uid);
        const isDescIdValid = this.validateDescId(desc_id);
        const isCreatedAtValid = this.validateISODate(created_at);
        const isUpdatedAtValid = this.validateISODate(updated_at);
        const isTitleValid = this.validateTitle(title);
        const isDescriptionValid = this.validateDescription(description);
        const areTagsValid = tags.every(tag => this.validateTagName(tag.name));

        return {
            isAuthUidValid,
            isDescIdValid,
            isCreatedAtValid,
            isUpdatedAtValid,
            isTitleValid,
            isDescriptionValid,
            areTagsValid
        };
    }
};


// パラメーターにuidが存在しない場合は、エラーを返す関数(引数はuid)
function checkAuthUid(uid) {
    if (!uid) {
        return res.status(400).json({ message: 'auth_uid is required' });
    }
}

// auth_uidをSHA-256でハッシュ化する関数
function hashAuthUid(auth_uid) {
    return crypto.createHash('sha256').update(auth_uid).digest('hex');
}

// タグを追加する関数
function addTag_for_app8(desc_id, name, created_at, updated_at) {
    created_at = new Date(created_at).toISOString();
    updated_at = new Date(updated_at).toISOString();

    const selectTagStmt = db_for_app8.prepare(`
        SELECT id FROM tags WHERE name = ?
    `);
    const existingTag = selectTagStmt.get(name);

    let tag_id;
    if (existingTag) {
        tag_id = existingTag.id;
    } else {
        const insertTagStmt = db_for_app8.prepare(`
            INSERT INTO tags (name, created_at, updated_at)
            VALUES (?, ?, ?)
        `);
        const result = insertTagStmt.run(name, created_at, updated_at);
        tag_id = result.lastInsertRowid;
    }

    const insertDescTagsStmt = db_for_app8.prepare(`
        INSERT INTO desc_tags (desc_id, tag_id)
        VALUES (?, ?)
    `);
    insertDescTagsStmt.run(desc_id, tag_id);
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

app.post('/', (req, res) => {
    try {
        const allDescs = db_for_app8.prepare(`SELECT * FROM desc`).all();
        const allTags = db_for_app8.prepare(`SELECT * FROM tags`).all();
        const descTags = db_for_app8.prepare(`SELECT * FROM desc_tags`).all();

        let allDescs_with_tags = allDescs.map(desc => {
            desc.tags = descTags
                .filter(descTag => descTag.desc_id === desc.id)
                .map(descTag => {
                    const tag = allTags.find(tag => tag.id === descTag.tag_id);
                    return tag;
                });
            return desc;
        });

        const new_allDescs_with_tags = allDescs_with_tags.map(desc => {
            if (desc.tags) {
                let new_des_tags = desc.tags.map(tag => {
                    tag.desc_id = desc.id;
                    return tag;
                });
                new_des_tags = JSON.parse(JSON.stringify(new_des_tags));
                desc.tags = new_des_tags;
            } else {
                desc.tags = [];
            }
            return desc;
        });

        // req.bodyにauth_uidが存在する場合は追加オブジェクトを取得する
        let new_allDescs_with_tags_without_auth_uid = [];
        let any_user_new_allDescs_with_tags_without_auth_uid = [];
        if(req.body.auth_uid){
            new_allDescs_with_tags_without_auth_uid = new_allDescs_with_tags.map(desc => {
                // auth_uid以外のロウデータを取得
                let new_obj = {};
                Object.keys(desc).forEach(key => {
                    if(key !== 'auth_uid'){
                        new_obj[key] = desc[key];
                    }
                });
                return new_obj;
            })
            any_user_new_allDescs_with_tags_without_auth_uid = new_allDescs_with_tags.map(desc => {
                // auth_uid以外のユーザーのデータを取得
                let new_obj = {};
                Object.keys(desc).forEach(key => {
                    if(key !== 'auth_uid'){
                        new_obj[key] = desc[key];
                    }
                });
                return new_obj;
            });
        }





        // res.status(200).json({ allDescs: new_allDescs_with_tags, allTags: allTags, any_user_new_allDescs_with_tags: any_user_new_allDescs_with_tags });
        res.status(200).json({ allDescs: new_allDescs_with_tags_without_auth_uid, allTags: allTags, any_user_new_allDescs_with_tags: any_user_new_allDescs_with_tags_without_auth_uid });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/insert_desc', (req, res) => {
    try {
        let { auth_uid, title, description, tags } = req.body;
        checkAuthUid(auth_uid);
        auth_uid = hashAuthUid(auth_uid);
        const created_at = new Date().toISOString();
        const updated_at = new Date().toISOString();

        const validationResults = validators.validateData(req.body);

        if (!validationResults.isAuthUidValid) {
            return res.status(400).json({ message: 'Invalid auth_uid' });
        }
        // if (!validationResults.isCreatedAtValid) {
        //     return res.status(400).json({ message: 'Invalid created_at' });
        // }
        // if (!validationResults.isUpdatedAtValid) {
        //     return res.status(400).json({ message: 'Invalid updated_at' });
        // }
        if (!validationResults.isTitleValid) {
            return res.status(400).json({ message: 'Invalid title' });
        }
        if (!validationResults.isDescriptionValid) {
            return res.status(400).json({ message: 'Invalid description' });
        }
        if (!validationResults.areTagsValid) {
            return res.status(400).json({ message: 'Invalid tags' });
        }

        const insertDescStmt = db_for_app8.prepare(`
            INSERT INTO desc (auth_uid, created_at, updated_at, title, description)
            VALUES (?, ?, ?, ?, ?)
        `);
        const result = insertDescStmt.run(auth_uid, created_at, updated_at, title, description);

        const descId = result.lastInsertRowid;

        tags.forEach(tag => addTag_for_app8(descId, tag.name, created_at, updated_at));

        res.status(201).json({ message: 'Description and tags inserted successfully', descId });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/update_desc', (req, res) => {
    try {
        let { desc_id, auth_uid, title, description, tags } = req.body;
        checkAuthUid(auth_uid);
        auth_uid = hashAuthUid(auth_uid);
        const updated_at = new Date().toISOString();

        const validationResults = validators.validateData(req.body);

        if (!validationResults.isAuthUidValid) {
            return res.status(400).json({ message: 'Invalid auth_uid' });
        }
        if (!validationResults.isTitleValid) {
            return res.status(400).json({ message: 'Invalid title' });
        }
        if (!validationResults.isDescriptionValid) {
            return res.status(400).json({ message: 'Invalid description' });
        }
        if (!validationResults.areTagsValid) {
            return res.status(400).json({ message: 'Invalid tags' });
        }

        const checkAuthUidStmt = db_for_app8.prepare(`
            SELECT COUNT(*) AS count FROM desc WHERE id = ? AND auth_uid = ?
        `);
        const { count } = checkAuthUidStmt.get(desc_id, auth_uid);
        if (count === 0) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const updateDescStmt = db_for_app8.prepare(`
            UPDATE desc
            SET updated_at = ?, title = ?, description = ?
            WHERE id = ?
        `);
        updateDescStmt.run(updated_at, title, description, desc_id);

        const deleteDescTagsStmt = db_for_app8.prepare(`
            DELETE FROM desc_tags WHERE desc_id = ?
        `);
        deleteDescTagsStmt.run(desc_id);

        tags.forEach(tag => addTag_for_app8(desc_id, tag.name, tag.created_at, tag.updated_at));

        res.status(200).json({ message: 'Description and tags updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/delete_desc', (req, res) => {
    try {
        let { id, auth_uid } = req.body;
        checkAuthUid(auth_uid);
        auth_uid = hashAuthUid(auth_uid);

        if (!validators.validateAuthUid(auth_uid)) {
            return res.status(400).json({ message: 'Invalid auth_uid' });
        }

        const checkAuthUidStmt = db_for_app8.prepare(`
            SELECT COUNT(*) AS count FROM desc WHERE id = ? AND auth_uid = ?
        `);
        const { count } = checkAuthUidStmt.get(id, auth_uid);
        if (count === 0) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        if (!validators.validateDescId(id)) {
            return res.status(400).json({ message: 'Invalid desc_id' });
        }

        const deleteDescStmt = db_for_app8.prepare(`
            DELETE FROM desc WHERE id = ?
        `);
        deleteDescStmt.run(id);

        res.status(200).json({ message: 'Description deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/delete_desc_tag', (req, res) => {
    try {
        let { id, desc_id, auth_uid } = req.body;
        checkAuthUid(auth_uid);
        auth_uid = hashAuthUid(auth_uid);

        if (!validators.validateAuthUid(auth_uid)) {
            return res.status(400).json({ message: 'Invalid auth_uid' });
        }

        const checkAuthUidStmt = db_for_app8.prepare(`
            SELECT COUNT(*) AS count FROM desc WHERE id = ? AND auth_uid = ?
        `);
        const { count } = checkAuthUidStmt.get(desc_id, auth_uid);
        if (count === 0) {
            return res.status(403).json({ message: 'Forbidden1' });
        }

        const deleteDescTagStmt = db_for_app8.prepare(`
            DELETE FROM desc_tags WHERE tag_id = ? AND desc_id = ?
        `);
        deleteDescTagStmt.run(id, desc_id);

        res.status(200).json({ message: 'Description tag deleted successfully' });
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

        const selectTagStmt = db_for_app8.prepare(`
            SELECT id FROM tags WHERE name = ?
        `);
        const existingTag = selectTagStmt.get(name);
        console.log(3);
        
        let tagId;
        if (existingTag) {
            tagId = existingTag.id;
            console.log(4);
        } else {
            console.log(5);
            // エラーチェック
            if (!validators.validateTagName(name)) {
                console.log(6);
                return res.status(400).json({ message: 'Invalid tag name' });
            }
            console.log(7);

            const insertTagStmt = db_for_app8.prepare(`
                INSERT INTO tags (name, created_at, updated_at)
                VALUES (?, ?, ?)
            `);
            const result = insertTagStmt.run(name, created_at, updated_at);
            tagId = result.lastInsertRowid;
        }
        
        const insertDescTagsStmt = db_for_app8.prepare(`
            INSERT INTO desc_tags (desc_id, tag_id)
            VALUES (?, ?)
        `);
        insertDescTagsStmt.run(desc_id, tagId);

        res.status(201).json({ message: 'Description tag inserted successfully', tagId });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

