var express = require('express')
var router = express.Router()

const LinkedinRoutine = require('../routines/linkedin-routine')

/* GET home page. */
router.post('/', async function(req, res, next) {
  // Verify access code header on request

  // Create batch ID
  const batchId = Date.now()

  // TO DO: Pull configuration from request
  const config = req.body.config

  // Start scraper routine
  const scraper = new LinkedinRoutine(batchId, config)
  const linkedinResults = await scraper.run()

  // Return batch ID to Elevate
  res.send({batchId, linkedinResults})
})

module.exports = router;
