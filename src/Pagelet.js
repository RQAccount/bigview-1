'use strict'

const debug = require('debug')('bigview')

module.exports = class Pagelet {
  constructor () {
    if (arguments.length >= 3) {
        //(name, tpl, data) 
       this.name   = arguments[0];
       this.tpl      = arguments[1];
       this.data      = arguments[2];
     } else if (arguments.length == 2) {
       // (name, data) 
       this.name   = arguments[0];
       this.data      = arguments[1]
       this.tpl = 'index.html'
     } else {
       debug('Pagelet constructor(name, tpl, data) or constructor(name, data)')
     }
     
     this.root = '.'
     this.selector = '.xxxx'  // css
     this.location = '#main'  //location

     this.options = {} // for compiler
     this.done = false

     this.delay = 0
     this.children = []
  }

  addChild (subPagelet) {
    this.children.push(subPagelet)
  }

  // private only call by bigview
  // step1: fetch data
  // step2: compile(tpl + data) => html
  // step3: write html to browser
  _exec () {
    let self = this
    
    return self.fetch()
      .then(self.complile.bind(self))

      .then(self.finish.bind(self))
  }

  fetch () {
    if (this.owner.done === true) return
    console.log('Pagelet fetch')
    let self = this
    return new Promise(function(resolve, reject){
      setTimeout(function() {
        // self.owner.end()
        resolve(self.data)
      }, self.delay);
    })
  }
  
  log () {
    let self = this
    return new Promise(function(resolve, reject){
      console.log('log')
      // resolve(self.data)
    })
  }

  complile (tpl, data) {
    if (this.owner.done === true) return
    // if (tpl) this.tpl = tpl
    // if (data) this.data = data

    const ejs = require('ejs')
    let self = this

    return new Promise(function (resolve, reject) {
      try {
        ejs.renderFile(self.root + '/' + self.tpl, self.data, self.options, function(err, str){
            // str => Rendered HTML string
            if (err) {
              console.log(err)
              reject(err)
            }

            // writeToBrowser
            self.owner.write(str)
            resolve(str)
        });
      } catch (err) {      
        console.log(err)
        reject(err)
      }    
    })
  }

  noopPromise () {
    let self = this
    return new Promise(function(resolve, reject){
      resolve(true)
    })
  }

  finish () {
    let self = this
    let q = []
    for (let i in this.children) {
      let subPagelet = this.children[i]
      subPagelet.owner = this.owner

      q.push(subPagelet._exec())
    }

    return Promise.all(q).then(function(){
      self.done = true
    }) 
  }
}
