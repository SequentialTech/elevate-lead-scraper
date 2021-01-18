var express = require('express')
var router = express.Router()

// Check for initialized db
const db = require('../db/init')

const LinkedinRoutine = require('../routines/linkedin-routine')

/* GET home page. */
router.post('/', function(req, res, next) {
  // Verify access code header on request

  // Create batch ID
  const batchId = Date.now()

  // Save to DB
  db.serialize(() => {
    var stmt = db.prepare("INSERT INTO batches VALUES (?, ?)")
    stmt.run(`${batchId}`, 'running')
  })

  // TO DO: Pull configuration from request
  const config = req.body.config

  // Start scraper routine
  const scraper = new LinkedinRoutine(batchId, config)
  scraper.run()
  .then(results => {
    console.log('finished scraping. sending to elevate...')

  })
  .catch(error => {
    console.log('error with scrape routine, notify elevate')
  })

  // Return batch ID to Elevate
  res.send({batchId})
})

module.exports = router;
