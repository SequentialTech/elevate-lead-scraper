module.exports = {
  constructUrls: function(config) {
    // Base: https://www.linkedin.com/sales/search/companies?facet=CCR&facet.CCR=us%3A52&count=100&start=0&maxCompnanyGrowth=100
    // Construct via config vars:
    // facet.CS (Company Size, loop through)
    // minCompanyGrowth (specified in config per company size)

    const base = 'https://www.linkedin.com/sales/search/companies?geoScope=BY_REGION&facet=CCR&facet=CS&facet.CCR=us%3A52&count=75&maxCompanyGrowth=100&REV=USD'
    const sizes = ['b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']

    return sizes.map( size => {
      return `${base}&facet.CS=${size.toUpperCase()}&minCompanyGrowth=${config['size_'+size]}&start=`
    })
  },

  login: function(config) {
    var email_input = document.querySelector('input#username')
    var password_input = document.querySelector('input#password')
    var submit_button = document.querySelector('button[type=submit]')

    email_input.value = config.email
    password_input.value = config.password
    submit_button.click()
  },

  searchResults: function(config) {
    var base_url = "https://www.linkedin.com"
    var companies = []

    var base_indeed = "https://www.indeed.com/jobs?l=Georgia&q="

    var results = document.getElementsByClassName('search-results__result-item')
    console.log('results: ', results)

    for(var i = 0; i<results.length; i++){
      var result = results[i]
      console.log('result: ', result)
      if(!result) continue

      var name = result.querySelector('dt.result-lockup__name a')
      console.log('name: ', name)
      if(!name) continue

      var company_url = name.getAttribute('href').split('?')[0]
      var company_name = name.innerHTML.replace(/(\r\n|\n|\r)/gm, "").replace(/^\s+/, "")
      var company_id = company_url.split('/')[3]

      // Iterate through info to capture industry and company size
      var info_points = result.querySelectorAll("li.result-lockup__misc-item")
      if(info_points.length < 2) continue // If data is not present, or fully present, ignore

      var industry = info_points[0].innerHTML.replace(/(\r\n|\n|\r)/gm, "")
      var number_employees = info_points[1].querySelector('a').innerHTML.replace(/(\r\n|\n|\r)/gm, "").replace(/^\s+/, "")

      companies.push({
        company_name: company_name,
        linkedin_id: company_id,
        config_id: config.id,
        industry: industry,
        number_employees: number_employees,
        linkedin_url: base_url+company_url+'/insights',
        indeed_url: base_indeed+encodeURIComponent(company_name)
      })
    }

    return companies
  },

  indeed: function(){
    if(document.querySelectorAll('div.bad_query').length) return 0

    var el = document.querySelector('#searchCount')

    return parseInt(el.innerHTML.split('of')[1].split(' ')[1])
  },

  appendGrowthPercent: function(results, config){
    const sizeMap = {
      '1-10 employees': 'size_b',
      '11-50 employees': 'size_c',
      '51-200 employees': 'size_d',
      '201-500 employees': 'size_e',
      '501-1000 employees': 'size_f',
      '1001-5000 employees': 'size_g',
      '5001-10,000 employees': 'size_h',
      '10,000+ employees': 'size_i',
    }
    results.forEach(result => {
      result.growth_percent = config[sizeMap[result.number_employees]]
      console.log(result, config[sizeMap[result.number_employees]])
    })
    return results
  }
}
