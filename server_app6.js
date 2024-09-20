
    ///////////////////////////server_express.js/////////////////////////////
    ///////////////////////////server_express.js/////////////////////////////
    ///////////////////////////server_express.js/////////////////////////////
    
    ///////////////////////////AI/////////////////////////////
    // 以下のコードを以下のルールで書き換えて
    // pop_up_url => app6
    // app5_title => app6_title TEXT not nullで1文字以上100文字以下
    // url_list => app6_text TEXT nullで1文字以上1000文字以下
    ///////////////////////////AI/////////////////////////////
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
    
    const db_for_app6 = new sqlite('app6.db');
    
    const initializeDatabase_app6 = () => {
        db_for_app6.exec('DROP TABLE IF EXISTS app6');
        db_for_app6.exec(`
            CREATE TABLE app6 (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uid TEXT NOT NULL CHECK(length(uid) = 64), -- SHA-256 produces a 64-character hex string
                app6_title TEXT NOT NULL CHECK(length(app6_title) >= 1 AND length(app6_title) <= 100),
                app6_text TEXT NULL CHECK(length(app6_text) >= 1 AND length(app6_text) <= 1000),
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    };
    initializeDatabase_app6();
    
    app.post('/app6/init-database', (req, res) => {
        const { password } = req.body;
    
        if (password === 'init') {
            try {
                initializeDatabase_app6();
                res.status(200).json({ message: 'Database initialized successfully.' });
            } catch (error) {
                res.status(500).json({ error: 'Failed to initialize database.' });
            }
        } else {
            res.status(403).json({ error: 'Unauthorized: Invalid password.' });
        }
    });
    
    app.post('/app6/create', (req, res) => {
        const hashUid = (uid) => {
            return crypto.createHash('sha256').update(uid).digest('hex');
        };
    
        const { uid, app6_title, app6_text } = req.body;
    
        if (typeof uid !== 'string' || uid.length < 1 || uid.length > 50) {
            return res.status(400).json({ error: 'Invalid uid. It must be a string between 1 and 50 characters.' });
        }
    
        if (typeof app6_title !== 'string' || app6_title.length < 1 || app6_title.length > 100) {
            return res.status(400).json({ error: 'Invalid app6_title. It must be a string between 1 and 100 characters.' });
        }
    
        if (app6_text && (typeof app6_text !== 'string' || app6_text.length < 1 || app6_text.length > 1000)) {
            return res.status(400).json({ error: 'Invalid app6_text. It must be a string between 1 and 1000 characters.' });
        }
    
        const hashedUid = hashUid(uid);
    
        const stmt = db_for_app6.prepare('INSERT INTO app6 (uid, app6_title, app6_text) VALUES (?, ?, ?)');
        const result = stmt.run(hashedUid, app6_title, app6_text || null);
    
        return res.status(201).json({
            id: result.lastInsertRowid,
            uid: hashedUid,
            app6_title,
            app6_text,
            created: new Date().toISOString(),
            updated: new Date().toISOString()
        });
    });
    
    app.post('/app6/read', (req, res) => {
        const hashUid = (uid) => {
            return crypto.createHash('sha256').update(uid).digest('hex');
        };
    
        const { uid } = req.body;
    
        try {
            const stmt_all = db_for_app6.prepare('SELECT * FROM app6');
            const all_json = stmt_all.all();
    
            if (uid) {
                const hashedUid = hashUid(uid);
                const stmt_uid = db_for_app6.prepare('SELECT * FROM app6 WHERE uid = ?');
                const uid_json = stmt_uid.all(hashedUid);
                res.status(200).json({ uid_json, all_json });
            } else {
                res.status(200).json({ all_json });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve records.' });
        }
    });
    
    app.post('/app6/update', (req, res) => {
        const hashUid = (uid) => {
            return crypto.createHash('sha256').update(uid).digest('hex');
        };
    
        const { id, uid, app6_title, app6_text } = req.body;
    
        if (typeof id !== 'number' || typeof uid !== 'string' || uid.length < 1 || uid.length > 50 ||
            typeof app6_title !== 'string' || app6_title.length < 1 || app6_title.length > 100 ||
            (app6_text && (typeof app6_text !== 'string' || app6_text.length < 1 || app6_text.length > 1000))) {
            return res.status(400).json({ error: 'Invalid input.' });
        }
    
        const hashedUid = hashUid(uid);
    
        const stmt = db_for_app6.prepare('UPDATE app6 SET app6_title = ?, app6_text = ?, updated = CURRENT_TIMESTAMP WHERE id = ? AND uid = ?');
        const result = stmt.run(app6_title, app6_text || null, id, hashedUid);
    
        if (result.changes > 0) {
            res.status(200).json({ message: 'Record updated successfully.' });
        } else {
            res.status(404).json({ error: 'Record not found or UID mismatch.' });
        }
    });
    
    app.post('/app6/delete', (req, res) => {
        const hashUid = (uid) => {
            return crypto.createHash('sha256').update(uid).digest('hex');
        };
    
        const { id, uid } = req.body;
    
        if (typeof id !== 'number' || typeof uid !== 'string') {
            return res.status(400).json({ error: 'Invalid input.' });
        }
    
        const hashedUid = hashUid(uid);
    
        const stmt = db_for_app6.prepare('DELETE FROM app6 WHERE id = ? AND uid = ?');
        const result = stmt.run(id, hashedUid);
    
        if (result.changes > 0) {
            res.status(200).json({ message: 'Record deleted successfully.' });
        } else {
            res.status(404).json({ error: 'Record not found or UID mismatch.' });
        }
    });
        
        
        ///////////////////////////server_express.js/////////////////////////////
        ///////////////////////////server_express.js/////////////////////////////
        ///////////////////////////server_express.js/////////////////////////////
    