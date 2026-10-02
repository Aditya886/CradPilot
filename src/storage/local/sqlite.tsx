import { open } from 'react-native-quick-sqlite';

const masterDb = open({
    name: 'master.db',
});

// Initialize master schema
masterDb.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    recovery_type TEXT NOT NULL, -- 'QA' or 'code'
    recovery_question TEXT,
    recovery_answer TEXT,
    recovery_codes TEXT, -- comma-separated
    display_name TEXT,
    profile_image TEXT
  );
`);

try {
    masterDb.execute(`ALTER TABLE users ADD COLUMN display_name TEXT;`);
} catch (e) {}

try {
    masterDb.execute(`ALTER TABLE users ADD COLUMN profile_image TEXT;`);
} catch (e) {}

let db = open({
    name: 'money.db',
});

export const switchUserDatabase = (username: string) => {
    try {
        db = open({
            name: `money_${username}.db`,
        });

        // Initialize schema for this user
        db.execute(`
          CREATE TABLE IF NOT EXISTS borrowers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL UNIQUE,
            address TEXT
          );
        `);

        db.execute(`
          CREATE TABLE IF NOT EXISTS loans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            borrower_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            amount REAL NOT NULL,
            description TEXT,
            loan_date TEXT NOT NULL,
            due_date TEXT,
            rate REAL NOT NULL,
            rate_period TEXT NOT NULL,
            interest_type TEXT NOT NULL,
            compound_freq TEXT,
            interest_applied TEXT,
            repayment_method TEXT NOT NULL,
            term INTEGER,
            status TEXT NOT NULL,
            FOREIGN KEY(borrower_id) REFERENCES borrowers(id) ON DELETE CASCADE
          );
        `);

        db.execute(`
          CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            loan_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            mode TEXT NOT NULL,
            to_principal REAL NOT NULL,
            to_interest REAL NOT NULL,
            balance_after REAL NOT NULL,
            notes TEXT,
            FOREIGN KEY(loan_id) REFERENCES loans(id) ON DELETE CASCADE
          );
        `);

        db.execute(`
          CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            saved REAL NOT NULL,
            target REAL NOT NULL,
            days INTEGER NOT NULL
          );
        `);

        db.execute(`
          CREATE TABLE IF NOT EXISTS debt_persons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL
          );
        `);

        db.execute(`
          CREATE TABLE IF NOT EXISTS debt_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            person_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            type TEXT NOT NULL, -- 'incoming', 'outgoing', 'done'
            date TEXT NOT NULL,
            mode TEXT NOT NULL,
            notes TEXT,
            FOREIGN KEY(person_id) REFERENCES debt_persons(id) ON DELETE CASCADE
          );
        `);

        db.execute(`
          CREATE TABLE IF NOT EXISTS plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            type TEXT NOT NULL,
            total REAL NOT NULL,
            note TEXT,
            created_at TEXT NOT NULL
          );
        `);

        db.execute(`
          CREATE TABLE IF NOT EXISTS plan_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plan_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            paid REAL DEFAULT 0,
            owes REAL DEFAULT 0,
            FOREIGN KEY(plan_id) REFERENCES plans(id) ON DELETE CASCADE
          );
        `);

        db.execute(`
          CREATE TABLE IF NOT EXISTS plan_spends (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plan_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            amount REAL NOT NULL,
            paid_by TEXT NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY(plan_id) REFERENCES plans(id) ON DELETE CASCADE
          );
        `);

        // Clear pre-seeded dummy data on launch if present
        db.execute(`
            DELETE FROM payments WHERE loan_id IN (
                SELECT id FROM loans WHERE borrower_id IN (
                    SELECT id FROM borrowers WHERE phone IN ('9876756573', '8765432109', '7654321098', '9999999999')
                )
            )
        `);
        db.execute(`
            DELETE FROM loans WHERE borrower_id IN (
                SELECT id FROM borrowers WHERE phone IN ('9876756573', '8765432109', '7654321098', '9999999999')
            )
        `);
        db.execute(`
            DELETE FROM borrowers WHERE phone IN ('9876756573', '8765432109', '7654321098', '9999999999')
        `);
        db.execute(`
            DELETE FROM goals WHERE title IN ('Goa Trip', 'New Car')
        `);
    } catch (e) {
        console.error("Error initializing user database:", e);
    }
};

// Default setup at startup
switchUserDatabase('default');

export const masterQuery = (sql: string, params: any[] = []) => {
    try {
        const result = masterDb.execute(sql, params);
        return result.rows?._array || [];
    } catch (e) {
        console.error('masterQuery error:', e);
        return [];
    }
};

export const masterInsert = (table: string, data: Record<string, any>) => {
    try {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(',');
        masterDb.execute(
            `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`,
            values,
        );
    } catch (e) {
        console.error('masterInsert error:', e);
        throw e;
    }
};

export const masterUpdate = (table: string, id: number, data: Record<string, any>) => {
    try {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const set = keys.map(key => `${key}=?`).join(',');
        masterDb.execute(
            `UPDATE ${table} SET ${set} WHERE id=?`,
            [...values, id],
        );
    } catch (e) {
        console.error('masterUpdate error:', e);
        throw e;
    }
};

export default db;

/* ===========================
   TABLE
=========================== */

export const createTable = (
    table: string,
    columns: string,
) => {
    db.execute(
        `CREATE TABLE IF NOT EXISTS ${table} (${columns})`,
    );
};

export const dropTable = (table: string) => {
    db.execute(`DROP TABLE IF EXISTS ${table}`);
};

export const clearTable = (table: string) => {
    db.execute(`DELETE FROM ${table}`);
};

/* ===========================
   INSERT
=========================== */

export const insert = (
    table: string,
    data: Record<string, any>,
) => {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const placeholders = keys.map(() => '?').join(',');

    db.execute(
        `INSERT INTO ${table}
    (${keys.join(',')})
    VALUES (${placeholders})`,
        values,
    );
};

/* ===========================
   GET
=========================== */

export const getAll = (table: string) => {
    const result = db.execute(
        `SELECT * FROM ${table}`,
    );

    return result.rows?._array || [];
};

export const getOne = (
    table: string,
    id: number,
) => {
    const result = db.execute(
        `SELECT * FROM ${table}
     WHERE id=?
     LIMIT 1`,
        [id],
    );

    return result.rows?._array?.[0] || null;
};

export const getWhere = (
    table: string,
    where: string,
    params: any[] = [],
) => {
    const result = db.execute(
        `SELECT * FROM ${table}
     WHERE ${where}`,
        params,
    );

    return result.rows?._array || [];
};

/* ===========================
   UPDATE
=========================== */

export const update = (
    table: string,
    id: number,
    data: Record<string, any>,
) => {
    const keys = Object.keys(data);

    const values = Object.values(data);

    const set = keys
        .map(key => `${key}=?`)
        .join(',');

    db.execute(
        `UPDATE ${table}
     SET ${set}
     WHERE id=?`,
        [...values, id],
    );
};

/* ===========================
   DELETE
=========================== */

export const remove = (
    table: string,
    id: number,
) => {
    db.execute(
        `DELETE FROM ${table}
     WHERE id=?`,
        [id],
    );
};

export const removeWhere = (
    table: string,
    where: string,
    params: any[] = [],
) => {
    db.execute(
        `DELETE FROM ${table}
     WHERE ${where}`,
        params,
    );
};

/* ===========================
   SEARCH
=========================== */

export const search = (
    table: string,
    column: string,
    keyword: string,
) => {
    const result = db.execute(
        `SELECT *
     FROM ${table}
     WHERE ${column} LIKE ?`,
        [`%${keyword}%`],
    );

    return result.rows?._array || [];
};

/* ===========================
   CUSTOM QUERY
=========================== */

export const query = (
    sql: string,
    params: any[] = [],
) => {
    const result = db.execute(sql, params);

    return result.rows?._array || [];
};