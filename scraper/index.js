const phantom = require('phantom')

module.exports = {
  test: async () => {
    const instance = await phantom.create()
    const page = await instance.createPage()

    await page.property('viewportSize', { width: 1024, height: 600 })
    const status = await page.open('https://stackoverflow.com/')
    console.log(`Page opened with status [${status}].`)

    await page.render('stackoverflow.pdf')
    console.log(`File created at [./stackoverflow.pdf]`)

    await instance.exit()
  },

  run: async (config) => {
    console.log(config)

    // Initialize PhantomJS
    const instance = await phantom.create()
    const page = await instance.createPage()

    // Load linkedin URL via config
    console.log(config.search_url)
  }
}
