const scraper = require('./scraper')
const express = require('express')
const app = express()

// Respond to options (if needed)
app.options('*', (req, res) => {
	// to do:
	// respond with appropriate headers, etc
})

app.get('/', (req, res) => {
	// Test example
	scraper().then(resolve => {
		console.log('you did it!')
	})
})

app.post('/', (req, res) => {

})

app.listen(3000, () => console.log('Example app listening on port 3000!'))