const fs = require('fs')
const parser = require('@babel/parser')

const body = fs.readFileSync('./index.js','utf-8')

console.log(body)

const ast = parser.parse(body, {
  sourceType: 'module'
})

console.log(ast)