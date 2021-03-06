var should    = require('should'),
    flagger   = require('../index')
    ;

describe('Flagger', function () {
  var policy = {
    flags: [
        {
          flagId: 'flag1',
          words: ['foo','foobar','foobaz'],
          types: ['category_1','category_2']
        },{
          flagId: 'flag2',
          words: ['bar','barfoo','bazfoo'],
          types: ['category_3']
        }
      ]
  }

  var post = {
    postId: '12345',
    authorId: '54321',
    source: {
      network: 'socnet'
    },
    content: {
      text: 'foo foobaz bar #hashfootagged barfoo.'
    },
    permalink: 'https://soc.net/path/to/post'
  }

  var cleanPost = {
    postId: '12345',
    authorId: '54321',
    source: {
      network: 'socnet'
    },
    content: {
      text: 'Clean post with no trigger words.'
    },
    permalink: 'https://soc.net/path/to/post'
  }

  before(function () {
    // whut
  })

  it('should return return the post object data', function (done) {
    flagger(policy, [post], function (err, data) {
      flaggedPost = data[0]

      flaggedPost.postId.should.equal(post.postId)
      flaggedPost.authorId.should.equal(post.authorId)
      flaggedPost.source.network.should.equal(post.source.network)
      flaggedPost.content.text.should.equal(post.content.text)
      flaggedPost.permalink.should.equal(post.permalink)

      done()
    })
  })

  it('should return a flagged property', function (done) {
    flagger(policy, [post], function (err, data) {
      data[0].flagged.should.equal(true)
      done()
    })
  })

  it('should return flag details', function (done) {
    flagger(policy, [post], function (err, data) {
      flaggedPost = data[0]

      flaggedPost.flags.should.be.an.instanceOf(Array).and.have.lengthOf(2)
      flaggedPost.flags[0].flagId.should.equal('flag1')
      flaggedPost.flags[0].loc[0].start.should.equal(0)
      flaggedPost.flags[0].loc[0].end.should.equal(3)
      flaggedPost.flags[0].loc[1].start.should.equal(20)
      flaggedPost.flags[0].loc[1].end.should.equal(23)
      flaggedPost.flags[0].loc[2].start.should.equal(4)
      flaggedPost.flags[0].loc[2].end.should.equal(10)
      flaggedPost.flags[1].flagId.should.equal('flag2')
      flaggedPost.flags[1].loc[0].start.should.equal(11)
      flaggedPost.flags[1].loc[0].end.should.equal(14)
      flaggedPost.flags[1].loc[1].start.should.equal(30)
      flaggedPost.flags[1].loc[1].end.should.equal(36)

      done()
    })
  })

  it('should return a clean object with `flagged: false` when no flags matched', function (done) {
    flagger(policy, [cleanPost], function (err, data) {
      flaggedPost = data[0]

      flaggedPost.should.not.have.property('flags')
      flaggedPost.flagged.should.equal(false)

      done()
    })
  })

  it('should reconcile multiple hits within a hashtag', function (done) {
    var hashedPost = {
      postId: '12345',
      authorId: '54321',
      source: {
        network: 'socnet'
      },
      content: {
        text: '#somefoobares'
      },
      permalink: 'https://soc.net/path/to/post'
    }

    flagger(policy, [hashedPost], function (err, data) {
      flaggedPost = data[0]

      flaggedPost.flags[0].loc.should.be.an.instanceOf(Array).and.have.lengthOf(1)
      flaggedPost.flags[0].loc[0].match.should.equal('foobar')
      flaggedPost.flags[0].loc[0].start.should.equal(5)
      flaggedPost.flags[0].loc[0].end.should.equal(11)

      done()
    })
  })

  it('should throw an error when provided arguments are malformed', function (done) {
    flagger.bind(null, {}, [post], function () {}).should.throw('The policy must have a `flags` property.')
    flagger.bind(null, policy, [post]).should.throw('Missing a callback function.')
    flagger.bind(null, policy, [post], 'not a callback').should.throw('The callback must be a function.')
    flagger.bind(null, policy, null, function () {}).should.throw('Missing an array of posts to flag.')
    flagger.bind(null, policy, [], function () {}).should.throw('Array of posts must not be empty.')
    flagger.bind(null, policy, 'not an array of posts', function () {}).should.throw('Posts must be an array of post objects.')
    flagger(policy, [{}], function (err, data) {
      data[0].flaggingError.should.be.an.Error;
      done()
    })
  })
})
