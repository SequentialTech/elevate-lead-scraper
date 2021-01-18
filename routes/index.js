var express = require('express')
var router = express.Router()
const db = require('../db/init')

const LinkedinRoutine = require('../routines/linkedin-routine')
const sizeMap = {
  'B': '1-10 employees',
  'C': '11-50 employees',
  'D': '51-200 employees',
  'E': '201-500 employees',
  'F': '501-1,000 employees',
  'G': '1,001-5,000 employees',
  'H': '5,001-10,000 employees',
  'I': '10,001+ employees'
}


/* GET /{batchId}} - Get status/results of batch */
router.get('/:batchId', function(req, res, next) {
  // TO DO: Verify signature

  // Pull record
  db.serialize(() => {
    var stmt = db.prepare("SELECT * FROM batches WHERE batch_id = ?")
    stmt.get(parseInt(req.params.batchId), (error, result) => {
      console.log(result)
      if(result) {
        var stmtResults = db.prepare("SELECT * FROM results WHERE b_id = ?")
        stmtResults.all(req.params.batchId, (err, linkedinResults) => {
          const resultData = linkedinResults.map(result => ({
            ...result,
            data: JSON.parse(result.data)
          }))
          res.render('view-batch', { batch: result, results: resultData || [], employeeCountRange: sizeMap[result.company_size] } )
        })
        stmtResults.finalize()
      } else {
        // TO DO: 404
      }
    })
    stmt.finalize()
  })
  // db.close()
})


/* POST - Trigger scrape routine */
router.post('/', function(req, res, next) {
  // TO DO: Verify signature

  // Create batch ID
  const batchId = Date.now()

  // Pull configuration from request
  const config = req.body.config

  // Save to DB
  db.serialize(() => {
    var stmt = db.prepare("INSERT INTO batches VALUES (?, ?, ?, ?)")
    stmt.run(batchId, 'running', config.companySize, config.minGrowth)
    stmt.finalize()
  })

  // Start scraper routine
  const scraper = new LinkedinRoutine(batchId, config)
  scraper.run()
  .then(results => {
    console.log('finished scraping. updating db...')
    db.serialize(() => {
      // Store results
      var stmt = db.prepare("INSERT INTO results (b_id, data) VALUES (?, ?)")
      results.forEach(result => {
        stmt.run(batchId, JSON.stringify(result))
      })
      stmt.finalize()

      // Update batch status
      var stmtBatch = db.prepare("UPDATE batches SET status = 'succeeded' WHERE batch_id = ?")
      stmtBatch.run(batchId)
      stmtBatch.finalize()
    })
    // db.close()
  })
  .catch(error => {
    console.log('error with scrape routine: ' , error)
    db.serialize(() => {
      var stmt = db.prepare("UPDATE batches SET status = 'failed: ?' WHERE batch_id = ?")
      stmt.run(error, batchId)
      stmt.finalize()
    })
    // db.close()
  })

  // Return batch ID to Elevate
  res.send({batchId})
})

module.exports = router;
