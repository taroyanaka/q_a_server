
    ///////////////////////////server_express.js/////////////////////////////
    ///////////////////////////server_express.js/////////////////////////////
    ///////////////////////////server_express.js/////////////////////////////
    
    ///////////////////////////AI/////////////////////////////
    // 以下のコードを以下のルールで書き換えて
    // pop_up_url => app5
    // app5_title => app5_title TEXT not nullで1文字以上100文字以下
    // url_list => app5_text TEXT nullで1文字以上1000文字以下
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
    
    const db_for_app5 = new sqlite('app5.db');
    
// read_all (POST) /app5/surveys_and_responses/read_all params: uid
 //  => 3種類のデータを取得する。
 //  1. 全てのsurveys,
 //  2. 自分が作成したsurveysとそれに紐づく他のユーザーのresponses(responsesに回答したユーザーの情報は含まれない),
 //  3. 自分が回答したresponsesとそのsurvey

// surveys
// create (POST) /app5/surveys/create params: uid, survey_title, survey_description, survey_price, questions
// delete (POST) /app5/surveys/delete params: id

// responses
// create (POST) /app5/responses/create params: uid, survey_id, answers

const initializeDatabase_app5 = () => {
    db_for_app5.exec(`
        DROP TABLE IF EXISTS responses;
        DROP TABLE IF EXISTS surveys;
        DROP TABLE IF EXISTS users;
    `);

    db_for_app5.exec(`
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uid TEXT NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE surveys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            price REAL DEFAULT 100,
            questions TEXT NOT NULL, -- JSON形式で質問を保存
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE responses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            survey_id INTEGER NOT NULL,
            respondent_uid TEXT NOT NULL,
            answers TEXT NOT NULL, -- JSON形式で回答を保存
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (survey_id) REFERENCES surveys(id),
            FOREIGN KEY (respondent_uid) REFERENCES users(uid)
        );
    `);
};

const insertTestData_app5 = () => {
    const users = [
        { uid: 'user1' },
        { uid: 'user2' },
        { uid: 'user3' }
    ];

    const surveys = [
        {
            user_id: 1,
            title: 'Survey 1',
            description: 'Description for survey 1',
            price: 200,
            questions: JSON.stringify(['Question 1', 'Question 2'])
        },
        {
            user_id: 2,
            title: 'Survey 2',
            description: 'Description for survey 2',
            price: 300,
            questions: JSON.stringify(['Question 3', 'Question 4'])
        }
    ];

    const responses = [
        {
            survey_id: 1,
            respondent_uid: 'user2',
            answers: JSON.stringify(['Answer 1', 'Answer 2'])
        },
        {
            survey_id: 2,
            respondent_uid: 'user3',
            answers: JSON.stringify(['Answer 3', 'Answer 4'])
        },
        // user2のsurveyに対するuser1のresponse
        {
            survey_id: 2,
            respondent_uid: 'user1',
            answers: JSON.stringify(['Answer 5', 'Answer 6'])
        },
    ];

    const insertUser = db_for_app5.prepare('INSERT INTO users (uid) VALUES (?)');
    users.forEach(user => insertUser.run(user.uid));

    const insertSurvey = db_for_app5.prepare('INSERT INTO surveys (user_id, title, description, price, questions) VALUES (?, ?, ?, ?, ?)');
    surveys.forEach(survey => insertSurvey.run(survey.user_id, survey.title, survey.description, survey.price, survey.questions));

    const insertResponse = db_for_app5.prepare('INSERT INTO responses (survey_id, respondent_uid, answers) VALUES (?, ?, ?)');
    responses.forEach(response => insertResponse.run(response.survey_id, response.respondent_uid, response.answers));
};


app.post('/app5/init-database', (req, res) => {
    const { password } = req.body;

    if (password === 'init') {
        try {
            initializeDatabase_app5();
            // insertTestData_app5();
            res.status(200).json({ message: 'Database initialized successfully.' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to initialize database.' });
        }
    } else {
        res.status(403).json({ error: 'Unauthorized: Invalid password.' });
    }
});

// initializeDatabase_app5();
// insertTestData_app5();

app.post('/app5/insert-test-data', (req, res) => {
    const { password } = req.body;

    if (password === 'testdata') {
        try {
            insertTestData_app5();
            res.status(200).json({ message: 'Test data inserted successfully.' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to insert test data.' });
        }
    } else {
        res.status(403).json({ error: 'Unauthorized: Invalid password.' });
    }
});

app.post('/app5/surveys_and_responses/read_all', (req, res) => {
try {
const readAllSurveysAndResponses = () => {
    // 回答のないsurveyも含めて全て取得するため、LEFT JOINを使用
    const stmt = db_for_app5.prepare(`
        SELECT surveys.*, responses.answers 
        FROM surveys 
        LEFT JOIN responses ON surveys.id = responses.survey_id
    `);
    const res1 = stmt.all();
    // console.log(res1);


    // 同じidのsurveyが複数回表示されるのを防ぐために、idをキーにしてanswersを配列にまとめる
    const surveys = res1.reduce((acc, cur) => {
        if (!acc[cur.id]) {
            acc[cur.id] = { ...cur, answers: [] };
        }
        if (cur.answers) {
            acc[cur.id].answers.push(cur.answers);
        }
        return acc;
    }, {});
    return Object.values(surveys);

};
// ログインしていない場合でも表示するためにuidを受け取っていない場合はreadAllSurveysのみを返す
if (!req.body.uid) {
    const result_1 = readAllSurveys();
    res.status(200).json({ surveys: result_1 });
}else{
        // 以降はuidを受け取っている場合の処理
        const { uid } = req.body;
        if (typeof uid !== 'string' || uid.length < 1 || uid.length > 50) {
            return res.status(400).json({ error: 'Invalid uid. It must be a string between 1 and 50 characters.' });
        }
        // 存在しないuidの場合は、エラーを返す
        const stmt = db_for_app5.prepare('SELECT COUNT(*) AS count FROM users WHERE uid = ?');
        const result = stmt.get(uid);
        result.count === 0 ? (() => { throw new Error('UID does not exist.'); })() : null;
    
        const hashUid = (uid) => {
            return crypto.createHash('sha256').update(uid).digest('hex');
        };
    
        const hashedUid = hashUid(uid);
        // const hashedUid = uid;
    
        const readMySurveysAndResponses = (hashedUid) => {
            const stmt = db_for_app5.prepare(`
                SELECT surveys.*, responses.answers 
                FROM surveys 
                LEFT JOIN responses ON surveys.id = responses.survey_id 
                WHERE surveys.user_id = (SELECT id FROM users WHERE uid = ?)
            `);
            // 同じidのsurveyが複数回表示されるのを防ぐために、idをキーにしてanswersを配列にまとめる
            const res2 = stmt.all(hashedUid);
            const surveys = res2.reduce((acc, cur) => {
                if (!acc[cur.id]) {
                    acc[cur.id] = { ...cur, answers: [] };
                }
                if (cur.answers) {
                    acc[cur.id].answers.push(cur.answers);
                }
                return acc;
            }, {});
            return Object.values(surveys);
        };
        const readMyResponses = (hashedUid) => {
            const stmt = db_for_app5.prepare(`
                SELECT surveys.*, responses.answers 
                FROM responses 
                LEFT JOIN surveys ON responses.survey_id = surveys.id 
                WHERE responses.respondent_uid = ?
            `);
            return stmt.all(hashedUid);
        };
        // uidからidを取得する
        const userCheckStmt = db_for_app5.prepare('SELECT id FROM users WHERE uid = ?');
        const user = userCheckStmt.get(hashedUid);
        const id = user.id || null;

        const result_1 = readAllSurveysAndResponses();
        const result_2 = readMySurveysAndResponses(hashedUid);
        const result_3 = readMyResponses(hashedUid);
        // console.log(result_1);
        // console.log(result_2);
        // console.log(result_3);
        res.status(200).json({ id: id ,surveys: result_1, mySurveysAndResponses: result_2, myResponses: result_3 });
}
} catch (error) {
    res.status(500).json({ error: 'Failed to read data.' });
    
}
});

app.post('/app5/surveys/create', (req, res) => {
    const hashUid = (uid) => {
        return crypto.createHash('sha256').update(uid).digest('hex');
    };

    const { uid, survey_title, survey_description, survey_price, questions } = req.body;

    if (typeof uid !== 'string' || uid.length < 1 || uid.length > 50) {
        return res.status(400).json({ error: 'Invalid uid. It must be a string between 1 and 50 characters.' });
    }

    if (typeof survey_title !== 'string' || survey_title.length < 1 || survey_title.length > 100) {
        return res.status(400).json({ error: 'Invalid survey_title. It must be a string between 1 and 100 characters.' });
    }

    if (survey_description && (typeof survey_description !== 'string' || survey_description.length > 1000)) {
        return res.status(400).json({ error: 'Invalid survey_description. It must be a string up to 1000 characters.' });
    }

    if (typeof survey_price !== 'number' || survey_price < 100 || survey_price > 10000 || survey_price % 100 !== 0) {
        return res.status(400).json({ error: 'Invalid survey_price. It must be a number between 100 and 10000, in increments of 100.' });
    }


if (!Array.isArray(questions)) return res.status(400).json({ error: 'Invalid questions. It must be an array.' });
if (questions.length === 0) return res.status(400).json({ error: 'Invalid questions. It must contain at least one question.' });
if (questions.some(q => typeof q !== 'string')) return res.status(400).json({ error: 'Invalid questions. All questions must be strings.' });
if (questions.some(q => q.length < 1)) return res.status(400).json({ error: 'Invalid questions. Each question must contain at least one character.' });
if (questions.some(q => q.length > 1000)) return res.status(400).json({ error: 'Invalid questions. Each question must not exceed 1000 characters.' });
    

const hashedUid = hashUid(uid);

// ユーザーが存在するか確認
const userCheckStmt = db_for_app5.prepare('SELECT id FROM users WHERE uid = ?');
let user = userCheckStmt.get(hashedUid);

if (!user) {
    // ユーザーが存在しない場合、追加
    const addUserStmt = db_for_app5.prepare('INSERT INTO users (uid) VALUES (?)');
    const addUserResult = addUserStmt.run(hashedUid);
    user = { id: addUserResult.lastInsertRowid };
}

// surveysテーブルに追加
const surveyStmt = db_for_app5.prepare('INSERT INTO surveys (user_id, title, description, price, questions) VALUES (?, ?, ?, ?, ?)');
const surveyResult = surveyStmt.run(user.id, survey_title, survey_description || null, survey_price, JSON.stringify(questions));


    res.status(201).json({ message: 'Survey created successfully.', survey_id: surveyResult.lastInsertRowid });
});

app.post('/app5/surveys/delete', (req, res) => {
    const { id } = req.body;

    const stmt = db_for_app5.prepare('DELETE FROM surveys WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
        return res.status(404).json({ error: 'Survey not found.' });
    }

    res.status(200).json({ message: 'Survey deleted successfully.' });
});

app.post('/app5/responses/create', (req, res) => {
    const hashUid = (uid) => {
        return crypto.createHash('sha256').update(uid).digest('hex');
    };

    const { uid, survey_id, } = req.body;
    let { answers } = req.body;

    if (typeof uid !== 'string' || uid.length < 1 || uid.length > 50) {
        return res.status(400).json({ error: 'Invalid uid. It must be a string between 1 and 50 characters.' });
    }

    if (typeof survey_id !== 'number') {
        return res.status(400).json({ error: 'Invalid survey_id. It must be a number.' });
    }

    answers = answers.split('\n');
    if (!Array.isArray(answers)) {
        return res.status(400).json({ error: 'Invalid answers. It must be an array.' });
    }

    if (answers.length === 0) {
        return res.status(400).json({ error: 'Invalid answers. The array must contain at least one answer.' });
    }
    
    if (answers.some(a => typeof a !== 'string')) {
        return res.status(400).json({ error: 'Invalid answers. Each answer must be a string.' });
    }
    
    if (answers.some(a => a.length < 1)) {
        return res.status(400).json({ error: 'Invalid answers. Each answer must contain at least one character.' });
    }
    
    if (answers.some(a => a.length > 1000)) {
        return res.status(400).json({ error: 'Invalid answers. Each answer must not exceed 1000 characters.' });
    }

    const hashedUid = hashUid(uid);

    // 自分の作ったsurveyに対する回答は不可のため、uidとsurvey_idからuser_idを取得し、user_idが一致するか確認
    // user_idが一致する場合はエラーを返す
    const idCheckStmt = db_for_app5.prepare(`
        SELECT COUNT(*) AS count 
        FROM surveys 
        WHERE id = ? AND user_id = (SELECT id FROM users WHERE uid = ?)
    `);
    const id_check = idCheckStmt.get(survey_id, hashedUid).count > 0;
    if (id_check) {
        // 自分の作ったsurveyに対する回答は不可と表示するために、エラーを返す
        return res.status(404).json({ error: 'you can not answer to the survey you created.' });
    }

    const stmt = db_for_app5.prepare('INSERT INTO responses (survey_id, respondent_uid, answers) VALUES (?, ?, ?)');
    stmt.run(survey_id, hashedUid, JSON.stringify(answers));

    res.status(201).json({ message: 'Response created successfully.' });
});

