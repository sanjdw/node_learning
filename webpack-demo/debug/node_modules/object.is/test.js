'use strict'

var test = require('tape')
var is = require('./is')
var ponyfill = require('./')

test('is', function (t) {
  var obj = { a: 1 }
  var array = [ 'a', 1 ]
  var window = typeof window === 'undefined' ? false : window
  var global = typeof global === 'undefined' ? window : global

  ;[
    [ 'foo', 'foo' ],
    [ global, global ],
    [ obj, obj ],
    [ array, array ],
    [ true, true ],
    [ null, null ],
    [ -0, -0 ],
    [ NaN, 0 / 0 ]
  ].forEach(function (set) {
    var a = set[0]
    var b = set[1]
    t.equal(is(a, b), true, 'is(' + a + ', ' + b + ') === true')
  })

  ;[
    [ 'foo', 'bar' ],
    [ [], [] ],
    [ 0, -0 ]
  ].forEach(function (set) {
    var a = set[0]
    var b = set[1]
    t.equal(is(a, b), false, 'is(' + a + ', ' + b + ') === false')
  })

  if (typeof Object.is === 'function') {
    t.equal(ponyfill, Object.is, 'ponyfill exports native Object.is when available')
  } else {
    t.equal(ponyfill, is, 'ponyfill uses own implementation when native is not available')
  }

  t.end()
})
