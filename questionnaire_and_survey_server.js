const hashing = false;

const express = require('express');
const sqlite = require('better-sqlite3');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const port = 8000;
app.listen(port, "0.0.0.0", () => {
    console.log(`App listening at http://localhost:${port}`);
});

const db = new sqlite('survey.db');

const initializeDatabase = () => {
    try {
        // 既存のテーブルを削除
        db.exec("DROP TABLE IF EXISTS survey_access;");
        db.exec("DROP TABLE IF EXISTS responses;");
        db.exec("DROP TABLE IF EXISTS questions;");
        db.exec("DROP TABLE IF EXISTS surveys;");
        db.exec("DROP TABLE IF EXISTS survey_completed;");
        db.exec("DROP TABLE IF EXISTS users;");
        db.exec("DROP TABLE IF EXISTS balance;");
    } catch (error) {
        console.error("Error dropping existing tables:", error);
    }
    
    try {
        // 1. users テーブルを作成
        db.exec(`
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uid TEXT NOT NULL UNIQUE, 
                role TEXT NOT NULL CHECK(role IN ('requester', 'respondent', 'admin'))
            );
        `);
    } catch (error) {
        console.error("Error creating users table:", error);
    }
    
    try {
        // balanceを管理するテーブルを作成
        db.exec(`
            CREATE TABLE balance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL, 
                balance REAL NOT NULL, 
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        `);
    } catch (error) {
        console.error("Error creating balance table:", error);
    }
    
    try {
        // 2. surveys テーブルを作成
        db.exec(`
            CREATE TABLE surveys (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL, 
                description TEXT, 
                price REAL NOT NULL, 
                requester_id INTEGER NOT NULL, 
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (requester_id) REFERENCES users(id)
            );
        `);
    } catch (error) {
        console.error("Error creating surveys table:", error);
    }
    
    try {
        // 3. questions テーブルを作成
        db.exec(`
            CREATE TABLE questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                survey_id INTEGER NOT NULL, 
                question_text TEXT NOT NULL, 
                FOREIGN KEY (survey_id) REFERENCES surveys(id)
            );
        `);
    } catch (error) {
        console.error("Error creating questions table:", error);
    }
    
    try {
        // 4. responses テーブルを作成
        db.exec(`
            CREATE TABLE responses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question_id INTEGER NOT NULL, 
                respondent_id INTEGER NOT NULL, 
                response_value INTEGER NOT NULL CHECK(response_value BETWEEN 1 AND 5), 
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (question_id) REFERENCES questions(id),
                FOREIGN KEY (respondent_id) REFERENCES users(id)
            );
        `);
    } catch (error) {
        console.error("Error creating responses table:", error);
    }
    
    try {
        // 5. survey_access テーブルを作成
        db.exec(`
            CREATE TABLE survey_access (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                survey_id INTEGER NOT NULL, 
                user_id INTEGER NOT NULL, 
                FOREIGN KEY (survey_id) REFERENCES surveys(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        `);
    } catch (error) {
        console.error("Error creating survey_access table:", error);
    }
    
    try {
        // survey_completed テーブルを作成
        db.exec(`
            CREATE TABLE survey_completed (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                survey_id INTEGER NOT NULL, 
                user_id INTEGER NOT NULL, 
                FOREIGN KEY (survey_id) REFERENCES surveys(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        `);
    } catch (error) {
        console.error("Error creating survey_completed table:", error);
    }
    
    try {
        // サンプルデータの挿入 - users テーブル
        db.exec(`
            INSERT INTO users (uid, role) VALUES ('user1_uid', 'requester');
            INSERT INTO users (uid, role) VALUES ('user2_uid', 'respondent');
            INSERT INTO users (uid, role) VALUES ('user3_uid', 'admin');
            INSERT INTO users (uid, role) VALUES ('user4_uid', 'respondent');
        `);
    } catch (error) {
        console.error("Error inserting sample data into users table:", error);
    }
    
    try {
        // サンプルデータの挿入 - balance テーブル
        db.exec(`
            INSERT INTO balance (user_id, balance) VALUES (1, 1000.00); -- user1の残高
            INSERT INTO balance (user_id, balance) VALUES (2, 0.00); -- user2の残高
            INSERT INTO balance (user_id, balance) VALUES (3, 0.00); -- user3の残高
            INSERT INTO balance (user_id, balance) VALUES (4, 0.00); -- user4の残高
        `);
    } catch (error) {
        console.error("Error inserting sample data into balance table:", error);
    }
    
    try {
        // サンプルデータの挿入 - surveys テーブル
        db.exec(`
            INSERT INTO surveys (title, description, price, requester_id) VALUES ('Customer Satisfaction Survey', 'A survey to measure customer satisfaction.', 100.00, 1);
            INSERT INTO surveys (title, description, price, requester_id) VALUES ('Employee Engagement Survey', 'A survey to gauge employee engagement.', 200.00, 1);
        `);
    } catch (error) {
        console.error("Error inserting sample data into surveys table:", error);
    }
    
    try {
        // サンプルデータの挿入 - questions テーブル
        db.exec(`
            INSERT INTO questions (survey_id, question_text) VALUES (1, 'How satisfied are you with our service?');
            INSERT INTO questions (survey_id, question_text) VALUES (1, 'How likely are you to recommend us to a friend?');
            INSERT INTO questions (survey_id, question_text) VALUES (2, 'How engaged do you feel at work?');
            INSERT INTO questions (survey_id, question_text) VALUES (2, 'How satisfied are you with your current role?');
        `);
    } catch (error) {
        console.error("Error inserting sample data into questions table:", error);
    }
    
    try {
        // サンプルデータの挿入 - responses テーブル
        db.exec(`
            INSERT INTO responses (question_id, respondent_id, response_value) VALUES (1, 2, 4);
            INSERT INTO responses (question_id, respondent_id, response_value) VALUES (2, 2, 5);
            INSERT INTO responses (question_id, respondent_id, response_value) VALUES (3, 4, 3);
            INSERT INTO responses (question_id, respondent_id, response_value) VALUES (4, 4, 2);
        `);
    } catch (error) {
        console.error("Error inserting sample data into responses table:", error);
    }
    
    try {
        // サンプルデータの挿入 - survey_access テーブル
        db.exec(`
            INSERT INTO survey_access (survey_id, user_id) VALUES (1, 1);
            INSERT INTO survey_access (survey_id, user_id) VALUES (1, 3);
            INSERT INTO survey_access (survey_id, user_id) VALUES (2, 1);
            INSERT INTO survey_access (survey_id, user_id) VALUES (2, 3);
        `);
    } catch (error) {
        console.error("Error inserting sample data into survey_access table:", error);
    }
};


app.post('/survey/init-database', (req, res) => {
    const { password } = req.body;

    if (password === 'init') {
        try {
            initializeDatabase();
            res.status(200).json({ message: 'Database initialized successfully.' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to initialize database.' });
        }
    } else {
        res.status(403).json({ error: 'Unauthorized: Invalid password.' });
    }
});


app.post('/survey/create', (req, res) => {
    const { uid, title, description, price, validQuestions } = req.body;
    if (!uid || typeof title !== 'string' || title.length < 1 || title.length > 100
        || validQuestions.length === 0 || validQuestions.some(question => !question.text || question.text.length === 0 || !question.selectedAnswer
            //  || question.selectedAnswer < 1 || question.selectedAnswer > 5
            )
    ) {
        console.log({uid, title, description, price, validQuestions});
        // エラーごとにconsole.logを追加
        if(!uid) console.log('uid is missing');
        if(typeof title !== 'string') console.log('title is not a string');
        if(title.length <= 1) console.log('title is too short');
        if(title.length > 100) console.log('title is too long');
        if(validQuestions.length === 0) console.log('validQuestions is empty');
        if(validQuestions.some(question => !question.text)) console.log('question.text is missing');
        if(validQuestions.some(question => question.text.length === 0)) console.log('question.text is empty');
        if(validQuestions.some(question => !question.selectedAnswer)) console.log('selectedAnswer is missing');
        // selectedAnswerは全て3


        // if(validQuestions.some(question => question.selectedAnswer < 1)) console.log('selectedAnswer is too small');
        // if(validQuestions.some(question => question.selectedAnswer > 5)) console.log('selectedAnswer is too large');


      

        return res.status(400).json({ error: 'Invalid input.' });
    }

    const hashedUid = crypto.createHash('sha256').update(uid).digest('hex');
    const requester = db.prepare('SELECT id FROM users WHERE uid = ? AND role = ?').get(hashing === true ?hashedUid:uid, 'requester');

    if (!requester) {
        return res.status(403).json({ error: 'Unauthorized: Invalid requester UID.' });
    }

    const stmt = db.prepare('INSERT INTO surveys (title, description, price, requester_id) VALUES (?, ?, ?, ?)');
    const result = stmt.run(title, description || null, price, requester.id);
    // questionsをvalidQuestionsから取得して、それをquestionsテーブルにinsertする
    const surveyId = result.lastInsertRowid;
    validQuestions.forEach(question => {
        // selectedAnswerは全て3
        question.selectedAnswer = 3;
        const stmt2 = db.prepare('INSERT INTO questions (survey_id, question_text) VALUES (?, ?)');
        stmt2.run(surveyId, question.text);
    });

    return res.status(201).json({
        id: result.lastInsertRowid,
        title,
        description,
        price,
        created_at: new Date().toISOString()
    });
});

// add-questionは不要
// app.post('/survey/:surveyId/add-question', (req, res) => {
//     const { uid, question_text } = req.body;
//     const { surveyId } = req.params;

//     if (!uid || typeof question_text !== 'string' || question_text.length < 1 || question_text.length > 255) {
//         return res.status(400).json({ error: 'Invalid input.' });
//     }

//     const hashedUid = crypto.createHash('sha256').update(uid).digest('hex');
//     const requester = db.prepare('SELECT s.id FROM surveys s JOIN users u ON s.requester_id = u.id WHERE u.uid = ? AND s.id = ? AND u.role = ?').get(hashing === true ?hashedUid:uid, surveyId, 'requester');

//     if (!requester) {
//         return res.status(403).json({ error: 'Unauthorized: Invalid requester UID or survey not found.' });
//     }

//     const stmt = db.prepare('INSERT INTO questions (survey_id, question_text) VALUES (?, ?)');
//     const result = stmt.run(surveyId, question_text);

//     return res.status(201).json({
//         id: result.lastInsertRowid,
//         survey_id: surveyId,
//         question_text
//     });
// });

app.post('/survey/read', (req, res) => {
    const { uid } = req.body;

    try {
        const hashedUid = crypto.createHash('sha256').update(uid).digest('hex');
        const user = db.prepare('SELECT id FROM users WHERE uid = ?').get(hashing === true ?hashedUid:uid);

        if (!user) {
            return res.status(403).json({ error: 'Unauthorized: Invalid UID.' });
        }

        const surveys = db.prepare(`
            SELECT s.id AS survey_id, s.title, s.description, s.price, s.created_at,
                   q.id AS question_id, q.question_text
            FROM surveys s
            JOIN questions q ON s.id = q.survey_id
        `).all();

        // survey_completedテーブルに、uidが存在するかどうかを確認する
        // 存在する場合は、surveysからそのuidのアンケートを取り除く
        const completedSurvey = db.prepare('SELECT * FROM survey_completed WHERE user_id = ?').all(user.id);
        // completedSurveyからdone_surveryを作成
        let done_survery = [];
        done_survery = completedSurvey.map(completed => {
            return surveys.find(survey => survey.survey_id === completed.survey_id);
        }
        );
        // done_surveryからtitileだけを取り出して同じものがあれば削除して集約
        done_survery = done_survery.reduce((acc, current) => {
            const x = acc.find(item => item.title === current.title);
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          }
            , []);

        // completedSurveyは、[
//   { id: 1, survey_id: 1, user_id: 2 },
//   { id: 2, survey_id: 1, user_id: 2 }
// ]
// のような形式

if(completedSurvey.length > 0){
    surveys.forEach((survey, index) => {
        completedSurvey.forEach(completed => {
            if(survey.survey_id === completed.survey_id){
                surveys.splice(index, 1);
            }
        });
    });

}


        // console.log(completedSurvey);

        res.status(200).json({ surveys
            , done_survery
         });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve surveys.' });
    }
});
// 特定のuidのアンケートだけをreadするエンドポイントを作って
app.post('/survey/read-by-requester', (req, res) => {
    const { uid } = req.body;

    try {
        const hashedUid = crypto.createHash('sha256').update(uid).digest('hex');
        const user = db.prepare('SELECT id FROM users WHERE uid = ?').get(hashing === true ?hashedUid:uid);

        if (!user) {
            return res.status(403).json({ error: 'Unauthorized: Invalid UID.' });
        }

        const surveys = db.prepare(`
            SELECT s.id AS survey_id, s.title, s.description, s.price, s.created_at,
                   q.id AS question_id, q.question_text
            FROM surveys s
            JOIN questions q ON s.id = q.survey_id
            WHERE s.requester_id = ?
        `).all(user.id);
        
        // 複数のquestionを抱えるsurveysを、resするsql
        const surveyQuestions = surveys.reduce((acc, survey) => {
            const existingSurvey = acc.find(item => item.survey_id === survey.survey_id);
            if (existingSurvey) {
                existingSurvey.questions.push({
                    question_id: survey.question_id,
                    question_text: survey.question_text
                });
            } else {
                acc.push({
                    survey_id: survey.survey_id,
                    title: survey.title,
                    description: survey.description,
                    price: survey.price,
                    created_at: survey.created_at,
                    questions: [{
                        question_id: survey.question_id,
                        question_text: survey.question_text
                    }]
                });
            }
            return acc;
        }, []);

        res.status(200).json({ surveys: surveyQuestions });
        // res.status(200).json({ surveys });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve surveys.' });
    }
});



app.post('/survey/:questionId/respond', (req, res) => {
    const { uid, response_value } = req.body;
    const { questionId } = req.params;

    if (!uid || typeof response_value !== 'number' || response_value < 1 || response_value > 5) {
        return res.status(400).json({ error: 'Invalid input.' });
    }

    const hashedUid = crypto.createHash('sha256').update(uid).digest('hex');
    const respondent = db.prepare('SELECT id FROM users WHERE uid = ? AND role = ?').get(hashing === true ?hashedUid:uid, 'respondent');

    if (!respondent) {
        return res.status(403).json({ error: 'Unauthorized: Invalid respondent UID.' });
    }

    const stmt = db.prepare('INSERT INTO responses (question_id, respondent_id, response_value) VALUES (?, ?, ?)');
    const result = stmt.run(questionId, respondent.id, response_value);

    // survey_completedに、uidとsurvey_idをinsertする
    const surveyId = db.prepare('SELECT survey_id FROM questions WHERE id = ?').get(questionId).survey_id;
    db.prepare('INSERT INTO survey_completed (survey_id, user_id) VALUES (?, ?)').run(surveyId, respondent.id);


    // ここで、respondentのbalanceを増やし、requesterのbalanceを減らす
    const requesterId = db.prepare('SELECT requester_id FROM surveys WHERE id = ?').get(surveyId).requester_id;
    const price = db.prepare('SELECT price FROM surveys WHERE id = ?').get(surveyId).price;
    const requesterBalance = db.prepare('SELECT balance FROM balance WHERE user_id = ?').get(requesterId).balance;
    const respondentBalance = db.prepare('SELECT balance FROM balance WHERE user_id = ?').get(respondent.id).balance;
    db.prepare('UPDATE balance SET balance = ? WHERE user_id = ?').run(requesterBalance - price, requesterId);
    db.prepare('UPDATE balance SET balance = ? WHERE user_id = ?').run(respondentBalance + price, respondent.id);






    return res.status(201).json({
        id: result.lastInsertRowid,
        question_id: questionId,
        respondent_id: respondent.id,
        response_value,
        created_at: new Date().toISOString()
    });
});

app.post('/survey/update', (req, res) => {
    const { uid, survey_id, title, description, price } = req.body;

    if (!uid || !survey_id || typeof title !== 'string' || title.length < 1 || title.length > 100) {
        return res.status(400).json({ error: 'Invalid input.' });
    }

    const hashedUid = crypto.createHash('sha256').update(uid).digest('hex');
    const requester = db.prepare('SELECT s.id FROM surveys s JOIN users u ON s.requester_id = u.id WHERE u.uid = ? AND s.id = ? AND u.role = ?').get(hashing === true ?hashedUid:uid, survey_id, 'requester');

    if (!requester) {
        return res.status(403).json({ error: 'Unauthorized: Invalid requester UID or survey not found.' });
    }

    const stmt = db.prepare('UPDATE surveys SET title = ?, description = ?, price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND requester_id = ?');
    const result = stmt.run(title, description || null, price, survey_id, requester.id);

    if (result.changes > 0) {
        res.status(200).json({ message: 'Survey updated successfully.' });
    } else {
        res.status(404).json({ error: 'Survey not found or UID mismatch.' });
    }
});

app.post('/survey/delete', (req, res) => {
    const { uid, survey_id } = req.body;

    // Debugging: Log the incoming request data
    console.log('Request body:', req.body);

    if (!uid || !survey_id) {
        console.log('Invalid input: missing uid or survey_id');
        return res.status(400).json({ error: 'Invalid input.' });
    }

    const hashedUid = crypto.createHash('sha256').update(uid).digest('hex');

    // Debugging: Log the hashed UID
    console.log('Hashed UID:', hashedUid);

    // Query to check if the requester is authorized
    const requester = db.prepare(
        'SELECT s.id FROM surveys s JOIN users u ON s.requester_id = u.id WHERE u.uid = ? AND s.id = ? AND u.role = ?'
    ).get(hashedUid, survey_id, 'requester');

    // Debugging: Log the result of the authorization query
    console.log('Requester query result:', requester);

    if (!requester) {
        console.log('Unauthorized: Invalid requester UID or survey not found.');
        return res.status(403).json({ error: 'Unauthorized: Invalid requester UID or survey not found.' });
    }

    // Delete the survey
    const stmt = db.prepare('DELETE FROM surveys WHERE id = ? AND requester_id = ?');
    const result = stmt.run(survey_id, requester.id);

    // Debugging: Log the result of the deletion operation
    console.log('Delete operation result:', result);

    if (result.changes > 0) {
        console.log('Survey deleted successfully.');
        res.status(200).json({ message: 'Survey deleted successfully.' });
    } else {
        console.log('Survey not found or UID mismatch.');
        res.status(404).json({ error: 'Survey not found or UID mismatch.' });
    }
});


app.post('/survey/responses', (req, res) => {
    const { uid } = req.body;
    console.log(uid);

    const hashedUid = crypto.createHash('sha256').update(uid).digest('hex');
    console.log(hashedUid);
    const admin = db.prepare('SELECT id FROM users WHERE uid = ? AND role = ?').get(hashing === true ?hashedUid:uid, 'admin');
    console.log(hashing === true ?hashedUid:uid);
    console.log(admin);

    if (!admin) {
        return res.status(403).json({ error: 'Unauthorized: Invalid admin UID.' });
    }

    const responses = db.prepare(`
        SELECT r.id, r.question_id, r.respondent_id, r.response_value, r.created_at,
               q.question_text, s.title AS survey_title
        FROM responses r
        JOIN questions q ON r.question_id = q.id
        JOIN surveys s ON q.survey_id = s.id
    `).all();

    console.log(responses);

    res.status(200).json({ responses });
});

app.post('/register', (req, res) => {
    const { uid, role } = req.body;

    if (!uid || !role || !['requester', 'respondent', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid input.' });
    }

    const hashedUid = crypto.createHash('sha256').update(uid).digest('hex');

    try {
        const stmt = db.prepare('INSERT INTO users (uid, role) VALUES (?, ?)');
        stmt.run(hashing === true ?hashedUid:uid, role);
        // requesterにはbalanceをANY_FIRST_BALANCE与える
        const user = db.prepare('SELECT * FROM users WHERE uid = ?').get(hashing === true ?hashedUid:uid);
        if(user.role === 'requester'){
            db.prepare('INSERT INTO balance (user_id, balance) VALUES (?, ?)').run(user.id, ANY_FIRST_BALANCE);
        }
        // respondentにはbalanceを0与える
        if(user.role === 'respondent'){
            db.prepare('INSERT INTO balance (user_id, balance) VALUES (?, ?)').run(user.id, 0);
        }

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            res.status(409).json({ error: 'User already registered.' });
        } else {
            res.status(500).json({ error: 'Failed to register user.' });
        }
    }
});


// admin用のエンドポイント
// それぞれのユーザーの残高を取得する
app.post('/all_balance', (req, res) => {
    const { uid } = req.body;

    const hashedUid = crypto.createHash('sha256').update(uid).digest('hex');
    const admin = db.prepare('SELECT id FROM users WHERE uid = ? AND role = ?').get(hashing === true ?hashedUid:uid, 'admin');

    if (!admin) {
        return res.status(403).json({ error: 'Unauthorized: Invalid admin UID.' });
    }

    const balances = db.prepare(`
        SELECT u.uid, b.balance
        FROM balance b
        JOIN users u ON b.user_id = u.id
    `).all();

    res.status(200).json({ balances });
});    



