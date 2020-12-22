var express = require('express')
var router = express.Router()

import LinkedinRoutine from '../routines/linkedin-routine'

/* GET home page. */
router.post('/', function(req, res, next) {
  // Verify access code header on request

  // Create batch ID
  const batchId = Date.now()

  // Pull configuration from request
  //const config = req.data

  // Start scraper routine
  //const scraper = new LinkedinRoutine(batchId, config)
  //const linkedinResults = await scraper.run()

  // Return batch ID to Elevate
  res.send({batchId})
})

module.exports = router;
