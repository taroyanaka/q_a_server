# q_a_server
The server-side repository for https://github.com/taroyanaka/q_a, which was created temporarily for development purposes and is likely to be deleted later.

ファイルは
https://github.com/taroyanaka/q_a/blob/main/sql_init_for_index.sql
https://github.com/taroyanaka/q_a/blob/main/CRUD_endpoint_sql_for_index.js

実行環境はnode.jsとnpmとsqlite3が必要

コマンドラインで以下を実行
& npm install express better-sqlite3 validator cors
& touch ./q_a.sqlite3
& sqlite3 ./q_a.sqlite3 < ./sql_init_for_index.sql
& nodemon ./index.js