require('dotenv').config()

const scraper = require('./scraper')
const helpers = require('./helpers')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// JSON parsing
app.use(bodyParser.json())


/**
 * Test route for checking service availability
 *
 * @return void
*/

app.get('/', (req, res) => {
  res.writeHead(200)
  res.end()
})



/**
 * Main scraper route, will accept configuration variables in the request body and an Access-Key in the headers
 *
 * @params Scraper config, access key
 * @return void, will send results to Elevate via webhook
*/

app.post('/', (req, res) => {
  console.log('\nScrape request received!')

  // Validate key in header
  if(req.headers['scrape-key'] !== process.env.ELEVATE_KEY){
    res.writeHead(403)
    res.end()
    return
  }

  // Validate request body
  if(!req.body.id || !req.body.size_b || !req.body.size_c || !req.body.size_d || !req.body.size_e || !req.body.size_f || !req.body.size_g || !req.body.size_h || !req.body.size_i){
    res.writeHead(400)
    res.end()
    return
  }

  // Pull from request body
  const config = {
    ...req.body,
    email: process.env.LINKEDIN_EMAIL,
    password: process.env.LINKEDIN_PASSWORD,
    elevate: process.env.ELEVATE_URL
  }

  // Construct search URLs via config
  const urls = helpers.constructUrls(config)

  console.log(urls)

  scraper.run(config, urls)
  res.writeHead(200)
  res.end()
})


/**
 * Indeed Page scraper, will accept configuration variables and scrape results in the request body and an Access-Key in the headers
 *
 * @params Scraper config, access key
 * @return void, will send results to Elevate via webhook
*/

app.post('/indeed', (req, res) => {
  console.log('\nIndeed scrape request received!')

  // Validate key in header
  if(req.headers['scrape-key'] !== process.env.ELEVATE_KEY){
    res.writeHead(403)
    res.end()
    return
  }

  // Validate request body
  if(!req.body.companies){
    console.log(req.body)
    res.writeHead(400)
    res.end()
    return
  }

  // Pull from request body
  const config = {
    ...req.body,
    elevate: process.env.ELEVATE_URL
  }

  scraper.runIndeed(config, config.companies)
  res.writeHead(200)
  res.end()
})


// Initialize server
app.listen(process.env.PORT, () => console.info('Server running on port ' + process.env.PORT))
