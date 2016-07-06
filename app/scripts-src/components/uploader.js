const yo = require('yo-yo')
const pify = require('pify')
const blobToBuffer = pify(require('blob-to-buffer'))

module.exports = function uploader(props) {

  async function upload(e) {
    try {
      let file = e.target.files[0]
      if (!file) {
        props.img = undefined
        return
      }
      file = await blobToBuffer(file)
      props.img = file
    }
    catch (err) {
      console.error(err)
      new Notification('Failed to upload file.')
    }
  }

  return yo`<input type="file" onchange=${upload}/>`
}
