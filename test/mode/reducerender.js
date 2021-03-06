import test from 'ava'

const sinon = require('sinon')
const Bigview = require("../../packages/bigview")
const Biglet = require("../../packages/biglet")
const ModeInstanceMappings = require('../../packages/bigview/mode')

/**
 * 即连续渲染模式reducerender，不写入布局，所有pagelet顺序执行完成，一次写入到浏览器。(当前)
 * 
 * 检查点：
 * 
 *  - 1) 写入模块，检查cache为空
 *  - 2）检查p1和p2的顺序
 */ 

test('MODE reducerender', t => {
    let req = {}
    let res = {
      render:function(tpl, data){
        return data
      }
    }
    let bigview = new Bigview(req, res, 'tpl', {})

    let result = []

    var p1 = new Biglet()
    p1.owner = bigview
    p1.fetch = function () {
      return sleep(3000).then(function(){
        // console.log('p1')
        result.push('p1')
      })
    }

    p1.parse = function(){

      t.is(bigview.cache.length, 0)
        
      return Promise.reject(new Error('p1 reject'))
    }

    var p2 = new Biglet()
    p2.owner = bigview
    p2.fetch = function () {
      return sleep(1000).then(function(){
        // console.log('p2')
        result.push('p2')
      })
    }

    p2.parse = function(){
      t.is(bigview.cache.length, 0)
        
      return Promise.reject(new Error('p2 reject'))
    }

    let pagelets = [p1, p2]

    let startTime = new Date()
    
    return bigview.getModeInstanceWith('reducerender').execute(pagelets).then(function(){
      let endTime = new Date()
      
      let cost = endTime.getTime() - startTime.getTime()
        
      t.true(cost > 4000)
        
      // 按照执行顺序算的
      t.is(result[0], 'p1')
      t.is(result[1], 'p2')
    })
})

function sleep(time) {
    return new Promise((resolve)=> setTimeout(resolve, time))
}