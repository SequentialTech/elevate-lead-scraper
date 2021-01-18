const sqlite3 = require('sqlite3').verbose()

const init = () => {
  const db = new sqlite3.Database('scraper_data')
  db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS batches (batch_id INTEGER PRIMARY KEY, status TEXT, company_size TEXT, min_growth TEXT)")
    db.run(`
      CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY,
        b_id INTEGER,
        data TEXT,
        FOREIGN KEY (b_id)
          REFERENCES batches (batch_id)
            ON DELETE CASCADE
            ON UPDATE NO ACTION
      )
    `)
  })
  return db
}

module.exports = init()
