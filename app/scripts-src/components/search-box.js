const yo = require('yo-yo')

module.exports = function searchBox(props) {

  function updateQuery(e) {
    props.q = e.target.value
  }

  return yo`
    <div class="mui-textfield" style="margin: 0 0.5em">
      <input type="search" oninput=${updateQuery} placeholder="Search"/>
    </div>
   `
}
