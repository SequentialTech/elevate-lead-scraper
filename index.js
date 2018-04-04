require('dotenv').config()

const scraper = require('./scraper')
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
		console.log('you did it! there should be a pdf rendering of the stackoverflow homepage in the root directory')
	})
})



/**
 * Main scraper route, will accept configuration variables in the request body and an Access-Key in the headers
 *
 * @params Scraper config, access key
 * @return void, will send results to Elevate via webhook
*/

app.post('/', (req, res) => {
  console.log('Scrape request received!\n\n')
  scraper.run({
    url: "https://www.linkedin.com/sales/search/companies?facet=CCR&facet.CCR=us%3A52&count=100&start=0",
    email: process.env.LINKEDIN_EMAIL,
    password: process.env.LINKEDIN_PASSWORD
  })
  res.writeHead(200)
  res.end()
})


// Initialize server
app.listen(3000, () => console.info('Server running.\n'))
