const merge = require('../merge')

describe('An object munger', () => {
  it('should merge two empty objects', () => {
    expect(merge({}, {})).toEqual({})
  })

  it('should not merge something that isn\'t an object', () => {
    expect(merge(1, {})).toEqual({})
    expect(merge({}, 'thing')).toEqual('thing')
  })

  it('should merge two objects with different properties', () => {
    expect(merge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 })
  })

  it('should override a first attribute with a second', () => {
    expect(merge({ a: 1 }, { a: 2 })).toEqual({ a: 2 })
  })

  it('should deep merge attributes that are objects', () => {
    first =    { a: { a: 1 }, b: 2 }
    second =   { a: { b: 1 }, b: 3, c: 1 }
    expected = { a: { a: 1, b: 1 }, b: 3, c: 1 }
    expect(merge(first, second)).toEqual(expected)
  })

  it('should even deeper merge attributes that are objects', () => {
    first =    { a: { a: 1, x: { a: true }}, b: 2 }
    second =   { a: { b: 1, x: { b: 'x' }}, b: 3, c: 1 }
    expected = { a: { a: 1, b: 1, x: { a: true, b: 'x' }}, b: 3, c: 1 }
    expect(merge(first, second)).toEqual(expected)
  })

  it('should overwrite an array with an object', ()  => {
    expect(merge({ a: [1, 2]}, { a: { x: 3 }})).toEqual({ a: { x: 3 }})
  })
})
