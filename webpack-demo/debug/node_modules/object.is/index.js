module.exports = typeof Object.is === 'function' ? Object.is : require('./is')
