require('dotenv').config()

const scraper = require('./scraper')
const helpers = require('./helpers')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()


/**
 * Test route for debugging
 *
 * @return void
*/

app.get('/', (req, res) => {
  console.log('running test example...')
	scraper.test().then(resolve => {
		console.log('you did it! there should be a pdf rendering of the page in the root directory')
	})
})



/**
 * Main scraper route, will accept configuration variables in the request body and an Access-Key in the headers
 *
 * @params Scraper config, access key
 * @return void, will send results to Elevate via webhook
*/

app.post('/', (req, res) => {
  console.log('\nScrape request received!')
  // To Do: Pull this from request body
  const config = {
    id: 1,
    name: 'Default Scrape',
    emails: 'ej@sequential.tech',
    size_b: 100,
    size_c: 50,
    size_d: 20,
    size_e: 10,
    size_f: 5,
    size_g: 4,
    size_h: 3,
    size_i: 2,
    email: process.env.LINKEDIN_EMAIL,
    password: process.env.LINKEDIN_PASSWORD,
    elevate: process.env.ELEVATE_URL
  }
  const urls = helpers.constructUrls(config)
  scraper.run(config, urls)
  res.writeHead(200)
  res.end()
})


// Initialize server
app.listen(3001, () => console.info('Server running.'))
