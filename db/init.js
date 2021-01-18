const sqlite3 = require('sqlite3').verbose()

const init = () => {
  const db = new sqlite3.Database('scraper')
  db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS batches (batch_id INTEGER PRIMARY KEY, status TEXT)")
  })
  return db
}

module.exports = init()
