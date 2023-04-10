-- sqlite3で全てのテーブルとそのデータを削除するクエリ
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS q_a;
DROP TABLE IF EXISTS f_i_b;
DROP TABLE IF EXISTS i_t_n;


-- ユーザーのテーブル。カラムはIDはと名前とパスワードと作成日と更新日を持つ。IDは自動的に増加する
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- q_aというブログのようなサービスのテーブル。contentと作成日と更新日を持つ。IDは自動的に増加する。usersのIDを外部キーとして持つ
CREATE TABLE q_a (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- f_i_bというブログのようなサービスのテーブル。contentと作成日と更新日を持つ。IDは自動的に増加する。usersのIDを外部キーとして持つ
CREATE TABLE f_i_b (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
-- i_t_nというブログのようなサービスのテーブル。contentと作成日と更新日を持つ。IDは自動的に増加する。usersのIDを外部キーとして持つ
CREATE TABLE i_t_n (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- usersにデータを3レコード挿入する
INSERT INTO users (name, password, created_at, updated_at) VALUES ('name1', 'password1', DATETIME('now'), DATETIME('now'));
INSERT INTO users (name, password, created_at, updated_at) VALUES ('name2', 'password2', DATETIME('now'), DATETIME('now'));


-- q_aへのデータを10レコード挿入する
-- INSERT INTO q_a (user_id, content, created_at, updated_at) VALUES (1, '["333\\n444\\n555\\n666\\n777\\n888\\n999","9\\n12\\n15\\n18\\n21\\n24\\n27"]', DATETIME('now'), DATETIME('now'));
-- INSERT INTO q_a (user_id, content, created_at, updated_at) VALUES (1, '["111\\n222\\n333\\n444\\n555\\n666\\n777\\n888\\n999","3\\n6\\n9\\n12\\n15\\n18\\n21\\n24\\n27"]', DATETIME('now'), DATETIME('now'));
-- INSERT INTO q_a (user_id, content, created_at, updated_at) VALUES (2, '["1\\n2\\n3\\n4\\n5\\n6\\n7","9\\n12\\n15\\n18\\n21\\n24\\n27"]', DATETIME('now'), DATETIME('now'));

-- f_i_bへのデータを10レコード挿入する
-- INSERT INTO f_i_b (user_id, content, created_at, updated_at) VALUES (1, '["you\\nI\\nto\\na\\nthe\\nEnglish\\nin\\nit\\nof\\nfor","Hi how are you My name is Sarah Whats your name\\nIm good thanks My name is John Nice to meet you\\nNice to meet you too John Where are you from\\nIm from the United States How about you\\nIm from Canada Do you like it here in England\\nYes I do Its a very interesting country with a lot of history\\nI agree Ive been to London before and I loved it\\nLondon is a great city Theres so much to see and do there\\nHave you visited any other places in England\\nYes I went to Bath last year It was beautiful\\nIve heard that Bath is a very pretty city Id love to visit there someday\\nYou should Its definitely worth seeing So what do you do for a living\\nIm a teacher How about you\\nIm a software developer What do you teach\\nI teach English to foreign students\\nThat sounds interesting Im not very good at English myself\\nDont worry Im sure youre better than you think English can be a difficult language to learn but its also very rewarding\\nI hope so Maybe you could teach me a few things\\nSure Id be happy to help you improve your English Do you have any plans for the weekend\\nNot yet Do you have any suggestions\\nWell theres a new museum exhibit opening up downtown It might be fun to check out\\nThat sounds like a good idea Thanks for the suggestion\\nNo problem We could also grab lunch afterwards if you want\\nSure that sounds great What time should we meet\\nHow about noon Does that work for you\\nThats perfect Ill see you then\\nGreat see you on Saturday"]', DATETIME('now'), DATETIME('now'));
-- INSERT INTO f_i_b (user_id, content, created_at, updated_at) VALUES (1, '["vous\\nje\\nà\\nle\\nen\\nanglais\\ndans\\nun\\nde\\npour","Salut comment allez-vous Mon nom est Sarah Quel est votre nom\\nJe vais bien merci Mon nom est John Ravi de vous rencontrer\\nRavi de vous rencontrer aussi John D\\u00f4nde venez-vous\\nJe viens des Etats-Unis Et vous\\nJe viens du Canada Vous aimez ici en Angleterre\\nOui je le fais C\\u2019est un pays tr\\u00e8s int\\u00e9ressant avec beaucoup d\\u2019histoire\\nJe suis d\\u2019accord J\\u2019ai \\u00e9t\\u00e9 \\u00e0 Londres avant et j\\u2019ai ador\\u00e9\\nLondres est une grande ville Il y a tant de choses \\u00e0 voir et \\u00e0 faire l\\u00e0-bas\\nAvez-vous visit\\u00e9 d\\u2019autres endroits en Angleterre\\nOui j\\u2019ai \\u00e9t\\u00e9 \\u00e0 Bath l\\u2019ann\\u00e9e derni\\u00e8re C\\u2019\\u00e9tait beau\\nJ\\u2019ai entendu que Bath est une ville tr\\u00e8s jolie J\\u2019aimerais bien y visiter un jour\\nVous devriez C\\u2019est certainement digne d\\u2019\\u00eatre vu Alors qu\\u2019est-ce que vous faites pour gagner votre vie\\nJe suis un professeur Et vous\\nJe suis un d\\u00e9veloppeur de logiciels Qu\\u2019enseignez-vous\\nJe donne des cours d\\u2019anglais aux \\u00e9tudiants \\u00e9trangers\\nCela sonne int\\u00e9ressant Je ne suis pas tr\\u00e8s bon en anglais moi-m"]', DATETIME('now'), DATETIME('now'));
-- INSERT INTO f_i_b (user_id, content, created_at, updated_at) VALUES (2, '["du\\nich\\nzu\\ndas\\nden\\nenglisch\\nin\\nein\\ndie\\nfür","Hallo wie geht es dir Mein Name ist Sarah Wie heißt du\\nMir geht es gut Danke Mein Name ist John Schön dich kennenzulernen\\nSchön dich kennenzulernen auch John Woher kommst du\\nIch komme aus den Vereinigten Staaten Und du\\nIch komme aus Kanada Magst du es hier in England\\nJa ich mag es Es ist ein sehr interessantes Land mit viel Geschichte\\nIch stimme zu Ich war vor ein paar Jahren in London und ich habe es geliebt\\nLondon ist eine große Stadt Es gibt so viel zu sehen und zu tun dort unten\\nHast du schon andere Orte in England besucht\\nJa ich war letztes Jahr in Bath Es war schön\\nIch habe gehört, dass Bath eine sehr schöne Stadt ist Ich würde gerne einmal dort besuchen\\nDu solltest Es ist definitiv einen Besuch wert Was machst du beruflich\\nIch bin Lehrer Und du\\nIch bin Softwareentwickler Was unterrichtest du\\nIch unterrichte Englisch an ausländischen Studenten\\nDas klingt interessant Ich bin nicht sehr gut in Englisch selbst\\nKeine Sorge Ich bin sicher, dass du besser bist als du denkst Englisch kann eine schwierige Sprache zu lernen, aber es ist auch sehr lohnend\\nIch hoffe so Vielleicht könntest du mir ein paar Dinge beibringen\\nGerne würde ich dir helfen, deine Englischkenntnisse zu verbessern Hast du schon Pläne für das Wochenende\\nNoch nicht Hast du Vorschläge\\nNun, es gibt eine neue Museumsausstellung im Stadtzentrum Es könnte Spaß machen, es zu besuchen\\nDas klingt nach einer guten Idee Danke für den Vorschlag\\nKein Problem Wir könnten auch nach dem Mittagessen zusammen essen, wenn du möchtest\\nJa, das klingt gut Wann treffen wir uns\\nWie wäre es mit Mittagessen Passt das für dich\\nDas passt perfekt Ich sehe dich dann\\nGroßartig"]', DATETIME('now'), DATETIME('now'));

-- i_t_nへのデータを3レコード挿入する。データは"[\"cat\\ndog\\nhalr\\ngrf\\neleph\",\"https://taroyanaka.github.io/q_a/asset/cat.png\\nhttps://taroyanaka.github.io/q_a/asset/dog.png\\nhttps://taroyanaka.github.io/q_a/asset/halr.png\\nhttps://taroyanaka.github.io/q_a/asset/grf.png\\nhttps://taroyanaka.github.io/q_a/asset/eleph.png\"]"の形式で入れる。
-- INSERT INTO i_t_n (user_id, content, created_at, updated_at) VALUES (1, '["cat\\ndog\\nhalr\\ngrf\\neleph","https://taroyanaka.github.io/q_a/asset/cat.png\\nhttps://taroyanaka.github.io/q_a/asset/dog.png\\nhttps://taroyanaka.github.io/q_a/asset/halr.png\\nhttps://taroyanaka.github.io/q_a/asset/grf.png\\nhttps://taroyanaka.github.io/q_a/asset/eleph.png"]', DATETIME('now'), DATETIME('now'));
-- INSERT INTO i_t_n (user_id, content, created_at, updated_at) VALUES (2, '["cat\\ndog\\nhalr\\ngrf\\neleph","https://taroyanaka.github.io/q_a/asset/cat.png\\nhttps://taroyanaka.github.io/q_a/asset/dog.png\\nhttps://taroyanaka.github.io/q_a/asset/halr.png\\nhttps://taroyanaka.github.io/q_a/asset/grf.png\\nhttps://taroyanaka.github.io/q_a/asset/eleph.png"]', DATETIME('now'), DATETIME('now'));
-- INSERT INTO i_t_n (user_id, content, created_at, updated_at) VALUES (3, '["cat\\ndog\\nhalr\\ngrf\\neleph","https://taroyanaka.github.io/q_a/asset/cat.png\\nhttps://taroyanaka.github.io/q_a/asset/dog.png\\nhttps://taroyanaka.github.io/q_a/asset/halr.png\\nhttps://taroyanaka.github.io/q_a/asset/grf.png\\nhttps://taroyanaka.github.io/q_a/asset/eleph.png"]', DATETIME('now'), DATETIME('now'));