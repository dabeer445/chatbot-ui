import { MYSQL_DB, MYSQL_HOST, MYSQL_PASS, MYSQL_USER } from '@/utils/app/const';
import mysql from 'mysql2/promise';


const pool = mysql.createPool({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASS,
    database: MYSQL_DB,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
export async function queryDatabase(query: string) {
    const connection = await pool.getConnection();

    try {
        const [rows] = await connection.query(query);
        return rows;
    } finally {
        connection.release();
    }
}
