const showdown = require('showdown')
const fs = require('fs')

class Article {
  constructor(params){
    params = params || {}
    this.uploadpath = params['uploadpath'] || ''
    this.filename = params['filename'] || ''
    this.user = params['user'] || null
    this.converter = new showdown.Converter()
    this.markdown = ''
    this.html = ''

    this.loadMarkdown = this.loadMarkdown.bind(this)
    this.convertToHtml = this.convertToHtml.bind(this)
    this.writeHtml = this.writeHtml.bind(this)
  }

  valid(){
    //is markdown
    //file exists
    //filename given
  }
  async save(){
    //valid()?
    const result = await this.loadMarkdown()
    .then(this.convertToHtml)
    .then(this.writeHtml)

    return result
  }

  async loadMarkdown(path){
    const uploadpath = path || this.uploadpath
    this.markdown = await new Promise( resolve => {
      fs.readFile(uploadpath, 'utf8', (err, data) => resolve(data) )
    })
    return this.markdown
  }

  async convertToHtml(input){
    const mdinput = input || this.markdown
    this.html = this.converter.makeHtml(mdinput)
    return this.html
  }

  //TODO: Get full path to hosted file
  //TODO: make less brittle (what if missing user?, what if directory doesn't exist?, what if file already exists)
  async writeHtml(){
    const result = await new Promise( resolve => {
      fs.writeFile(`./articles/${this.user.username}/${this.namify()}`, this.html, (err) => {
        if(err){
          resolve({success: false, errors: err})
        }else{
          resolve({success: true, uri: 'path/to/file'})
        }
      })
    })

    return result
  }

  namify(filename){
    const fullName = filename || this.filename
    let name = fullName.split('.')[0]
    name = name.toLowerCase()
    name = name.replace(/ /g, '-')
    name = name.replace(/[^a-z0-9-]+/g, '')
    return name+'.html'
  }
}

module.exports = Article