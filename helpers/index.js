module.exports = {
  constructUrls: function(config) {
    // Base: https://www.linkedin.com/sales/search/companies?facet=CCR&facet.CCR=us%3A52&count=100&start=0&maxCompnanyGrowth=100
    // Construct via config vars:
    // facet.CS (Company Size, loop through)
    // minCompanyGrowth (specified in config per company size)

    const base = 'https://www.linkedin.com/sales/search/companies?geoScope=BY_REGION&facet=CCR&facet=CS&facet.CCR=us%3A52&count=50&maxCompanyGrowth=100&REV=USD'
    const sizes = ['b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']

    return sizes.map( size => {
      return `${base}&facet.CS=${size.toUpperCase()}&minCompanyGrowth=${config['size_'+size]}&start=`
    })
  },

  login: function(config) {
    var email_input = document.querySelector('input#session_key-login')
    var password_input = document.querySelector('input#session_password-login')
    var submit_button = document.querySelector('input[type=submit]')

    email_input.value = config.email
    password_input.value = config.password
    submit_button.click()
  },

  searchResults: function(config) {
    var base_url = "https://www.linkedin.com/sales/company/"
    var companies = []

    var base_indeed = "https://www.indeed.com/jobs?l=Georgia&q="

    var results = document.getElementsByClassName('result')

    for(var i = 0; i<results.length; i++){
      var result = results[i]
      if(!result) continue

      var label = result.querySelector('label.bulk-select')
      if(!label) continue

      var name = result.querySelector('a.name-link')
      if(!name) continue

      var company_id = label.getAttribute('data-id')
      var company_name = name.innerHTML

      // Iterate through info to capture industry and company size
      var info_points = result.querySelectorAll("p.info-value")
      if(info_points.length < 2) continue // If data is not present, or fully present, ignore
      
      var industry = info_points[0].innerHTML
      var number_employees = info_points.length > 2 ? info_points[2].innerHTML : info_points[1].innerHTML

      companies.push({
        company_name: company_name,
        linkedin_id: company_id,
        config_id: config.id,
        industry: industry,
        number_employees: number_employees,
        linkedin_url: base_url+company_id+'/insights',
        indeed_url: base_indeed+encodeURIComponent(company_name)
      })
    }

    return companies
  },

  indeed: function(){
    if(document.querySelectorAll('div.bad_query').length) return 0

    var el = document.querySelector('#searchCount')
    
    return parseInt(el.innerHTML.split('of')[1].split(' ')[1])
  }
}
