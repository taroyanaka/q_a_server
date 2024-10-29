const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const cors = require('cors');
app.use(cors());
const port = 8000;
app.listen(port, "0.0.0.0", () => console.log(`App listening!! at http://localhost:${port}`) );
const sqlite = require('better-sqlite3');

// データベースの初期化
const db_for_app8 = new sqlite('./app8.db');

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
    },
};

// タグを追加する関数
function addTag_for_app8(desc_id, name, created_at, updated_at) {
    // created_at, updated_atをISO形式に変換
    created_at = new Date(created_at).toISOString();
    updated_at = new Date(updated_at).toISOString();

    console.log(3.1);
    // タグが既に存在するか確認
    console.log(desc_id, name, created_at, updated_at);
    const selectTagStmt = db_for_app8.prepare(`
        SELECT id FROM tags WHERE name = ?
    `);
    console.log(3.2);
    const existingTag = selectTagStmt.get(name);

    console.log(3.3);
    let tag_id;
    if (existingTag) {
        console.log(3.4);
        // タグが存在する場合、そのIDを使用
        tag_id = existingTag.id;
    } else {
        console.log(3.5);
        // タグが存在しない場合、新規追加
    // タグを挿入または取得するためのステートメント
    const insertTagStmt = db_for_app8.prepare(`
        INSERT INTO tags (name, created_at, updated_at)
        VALUES (?, ?, ?)
    `);

        const result = insertTagStmt.run(name, created_at, updated_at);
        tag_id = result.lastInsertRowid;
    }
    console.log(3.6);
    const insertDescTagsStmt = db_for_app8.prepare(`
        INSERT INTO desc_tags (desc_id, tag_id)
        VALUES (?, ?)
    `);
    console.log(3.7);
    // 中間テーブルに追加
    insertDescTagsStmt.run(desc_id, tag_id);
}


const init_db = () => {
    try {
        db_for_app8.exec('DROP TABLE IF EXISTS desc');
        db_for_app8.exec('DROP TABLE IF EXISTS desc_tags');
        db_for_app8.exec('DROP TABLE IF EXISTS tags');

        // ユーザーテーブルの作成
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
        
        // タグテーブルの作成
        db_for_app8.exec(`
        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        `);

        // desc_tagsテーブルの作成
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



app.get('/', (req, res) => {
    try {
        // 最終的にall_descs(付属するtagsも含む)とall_tagsを返す
        // get_all_descsとget_all_tagsを使って取得する
        const allDescs = db_for_app8.prepare(`SELECT * FROM desc`).all();
        const allTags = db_for_app8.prepare(`SELECT * FROM tags`).all();
        // console.log(allTags);
        const descTags = db_for_app8.prepare(`SELECT * FROM desc_tags`).all();
        allDescs_with_tags = allDescs.map(desc => {
            filter_descTags = descTags.filter(descTag => descTag.desc_id === desc.id).forEach(descTag => {
                const tag = allTags.find(tag => tag.id === descTag.tag_id);
                if (!desc.tags) {
                    desc.tags = [];
                }
                desc.tags.push(tag);
            })
            return desc;
        });
// allDescs_with_tagsのそれぞれのtagsの配列のそれぞれの要素にdesc_idのプロパティを追加する
const new_allDescs_with_tags = allDescs_with_tags.map(desc => {
    if (desc.tags) {
        let new_des_tags = desc.tags.map(tag => {
            tag.desc_id = desc.id;
            return tag;
        });
        // 参照透過性の対策で、新しい配列を作成
        new_des_tags = JSON.parse(JSON.stringify(new_des_tags));
        desc.tags = new_des_tags;
    }else{
        desc.tags = [];
    }
    return desc;
});


        res.status(200).json({ allDescs: new_allDescs_with_tags, allTags: allTags });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/insert_desc', (req, res) => {
try {
    const { auth_uid, title, description, tags } = req.body;
    // iso形式のcreated_atとupdated_atを作る
    const created_at = new Date().toISOString();
    const updated_at = created_at;

    const validationResults = validators.validateData(req.body);

    if (!validationResults.isAuthUidValid) {
        return res.status(400).json({ message: 'Invalid auth_uid' });
    }
    if (!validationResults.isCreatedAtValid) {
        return res.status(400).json({ message: 'Invalid created_at' });
    }
    if (!validationResults.isUpdatedAtValid) {
        return res.status(400).json({ message: 'Invalid updated_at' });
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


    const insertDescStmt = db_for_app8.prepare(`
        INSERT INTO desc (auth_uid, created_at, updated_at, title, description)
        VALUES (?, ?, ?, ?, ?)
    `);
    const result = insertDescStmt.run(auth_uid, created_at, updated_at, title, description);

    const descId = result.lastInsertRowid;

    const insertDescTagsStmt = db_for_app8.prepare(`
        INSERT INTO desc_tags (desc_id, tag_id)
        VALUES (?, ?)
    `);
    // 同じnameのタグがあれば中間テーブルに追加し、なければ新規追加してから中間テーブルに追加
// タグを挿入または取得するためのステートメント
const insertTagStmt = db_for_app8.prepare(`
    INSERT INTO tags (name, created_at, updated_at)
    VALUES (?, ?, ?)
`);


// タグを追加
tags.forEach(tag => addTag_for_app8(descId, tag.name, created_at, updated_at));


    res.status(201).json({ message: 'Description and tags inserted successfully', descId });

} catch (error) {
    res.status(500).json({ message: 'Internal server error' });
}
});


// descの更新のエンドポイント
app.post('/update_desc', (req, res) => {
    try {
        const { desc_id, auth_uid, title, description, tags } = req.body;
        // iso形式のupdated_atを作る
        const updated_at = new Date().toISOString();

        const validationResults = validators.validateData(req.body);

        if (!validationResults.isAuthUidValid) {
            return res.status(400).json({ message: 'Invalid auth_uid' });
        }
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

        const checkAuthUidStmt = db_for_app8.prepare(`
            SELECT COUNT(*) AS count FROM desc WHERE id = ? AND auth_uid = ?
        `);
        console.log(desc_id, auth_uid);
        const { count } = checkAuthUidStmt.get(desc_id, auth_uid);
        if (count === 0) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        console.log(1);

        const updateDescStmt = db_for_app8.prepare(`
            UPDATE desc
            SET updated_at = ?, title = ?, description = ?
            WHERE id = ?
        `);
        updateDescStmt.run(updated_at, title, description, desc_id);

        console.log(2);
        const deleteDescTagsStmt = db_for_app8.prepare(`
            DELETE FROM desc_tags WHERE desc_id = ?
        `);
        deleteDescTagsStmt.run(desc_id);

        console.log(3);
        console.log(tags);


        tags.forEach(tag => addTag_for_app8(tag.desc_id, tag.name, tag.created_at, tag.updated_at));

        console.log(4);
        res.status(200).json({ message: 'Description and tags updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// descの削除のエンドポイント
app.post('/delete_desc', (req, res) => {
    try {
        console.log(req.body);
        const { id, auth_uid } = req.body;
        // uidが正しいかどうかを確認
        if (!validators.validateAuthUid(auth_uid)) {
            return res.status(400).json({ message: 'Invalid auth_uid' });
        }
        // sqlでuidをチェック
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

// id(tag_id)とdesc_idとauth_uidを受け取って、desc_tagsテーブルから削除する
app.post('/delete_desc_tag', (req, res) => {
    try {
        const { id, desc_id, auth_uid } = req.body;
        console.log(req.body);
        // uidが正しいかどうかを確認
        if (!validators.validateAuthUid(auth_uid)) {
            return res.status(400).json({ message: 'Invalid auth_uid' });
        }

        // sqlでuidをチェック
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
}
);
