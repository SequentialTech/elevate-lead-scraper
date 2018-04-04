module.exports = {
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
    var result_urls = []

    var results = document.getElementsByClassName('result')

    for(var i = 0; i<results.length; i++){
      var result = results[i]
      if(!result) continue

      var label = result.querySelector('label.bulk-select')
      if(!label) continue

      var company_id = label.getAttribute('data-id')
      result_urls.push(base_url+company_id+'/insights')
    }

    return result_urls
  }
}

