import initSqlJs from 'sql.js';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname } from 'path';

/** 数据库文件路径 */
const DB_PATH = process.env.DB_PATH || './data/reputation.db';

/** 确保 data 目录存在 */
mkdirSync(dirname(DB_PATH), { recursive: true });

/** 建表 SQL */
const CREATE_TABLES = `
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS product_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    parsed_text TEXT DEFAULT '',
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS methodologies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    file_path TEXT,
    version INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS generated_copies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    platform TEXT NOT NULL CHECK(platform IN ('xiaohongshu','bilibili','douyin')),
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS copy_feedbacks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    copy_id INTEGER NOT NULL,
    feedback_text TEXT NOT NULL,
    applied INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (copy_id) REFERENCES generated_copies(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS bili_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_url TEXT,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    collected_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

/** 全局数据库实例（初始化后赋值） */
let _db = null;

/**
 * Statement 包装类
 * 模拟 better-sqlite3 的 prepare().run()/get()/all() 语法
 */
class Statement {
  constructor(sqlJsDb, sql, onSave) {
    this._sqlJsDb = sqlJsDb;
    this._sql = sql;
    this._onSave = onSave;
  }

  /** 绑定参数并执行，返回 { lastInsertRowid, changes } */
  run(...params) {
    this._sqlJsDb.run(this._sql, params);
    const row = this._sqlJsDb.exec('SELECT last_insert_rowid() as id');
    const lastInsertRowid = row.length > 0 && row[0].values.length > 0 ? row[0].values[0][0] : 0;
    this._onSave();
    return { lastInsertRowid, changes: this._sqlJsDb.getRowsModified() };
  }

  /** 绑定参数并查询单行 */
  get(...params) {
    const stmt = this._sqlJsDb.prepare(this._sql);
    stmt.bind(params);
    if (stmt.step()) {
      const columns = stmt.getColumnNames();
      const values = stmt.get();
      stmt.free();
      const result = {};
      columns.forEach((col, i) => {
        result[col] = values[i];
      });
      return result;
    }
    stmt.free();
    return undefined;
  }

  /** 绑定参数并查询所有行 */
  all(...params) {
    const stmt = this._sqlJsDb.prepare(this._sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      const columns = stmt.getColumnNames();
      const values = stmt.get();
      const row = {};
      columns.forEach((col, i) => {
        row[col] = values[i];
      });
      results.push(row);
    }
    stmt.free();
    return results;
  }
}

/** 保存防抖定时器 */
let _saveTimer = null;

/** 定时保存到磁盘（防抖） */
function scheduleSave() {
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    if (_db) {
      try {
        const data = _db.export();
        const buffer = Buffer.from(data);
        writeFileSync(DB_PATH, buffer);
      } catch (err) {
        console.error('[DB Save Error]', err.message);
      }
    }
  }, 300);
}

/**
 * 数据库代理对象，提供类似 better-sqlite3 的同步 API
 * 所有方法直接操作底层的 sql.js 实例
 */
const dbProxy = {
  /** 执行 SQL 语句（无返回值） */
  exec(sql) {
    if (!_db) throw new Error('Database not initialized');
    _db.run(sql);
    scheduleSave();
  },

  /** 执行 PRAGMA */
  pragma(pragmaStr) {
    if (!_db) throw new Error('Database not initialized');
    _db.run(pragmaStr);
  },

  /** 准备语句，返回 Statement 对象 */
  prepare(sql) {
    if (!_db) throw new Error('Database not initialized');
    return new Statement(_db, sql, scheduleSave);
  },

  /** 关闭数据库 */
  close() {
    if (_db) {
      scheduleSave();
      // 立即保存
      try {
        const data = _db.export();
        const buffer = Buffer.from(data);
        writeFileSync(DB_PATH, buffer);
      } catch (err) {
        console.error('[DB Close Save Error]', err.message);
      }
      _db.close();
      _db = null;
    }
  },
};

/**
 * 初始化数据库（在 server/index.js 启动时调用一次）
 */
async function initDatabase() {
  const SQL = await initSqlJs();

  // 如果数据库文件已存在，加载它
  if (existsSync(DB_PATH)) {
    const buffer = readFileSync(DB_PATH);
    _db = new SQL.Database(buffer);
  } else {
    _db = new SQL.Database();
  }

  // 启用外键
  _db.run('PRAGMA foreign_keys = ON;');

  // 执行建表
  _db.run(CREATE_TABLES);

  // 初始保存
  const data = _db.export();
  const buffer = Buffer.from(data);
  writeFileSync(DB_PATH, buffer);

  console.log(`[DB] Database initialized at ${DB_PATH}`);
}

export { dbProxy as default, initDatabase };
