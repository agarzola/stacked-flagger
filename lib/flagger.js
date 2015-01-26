var flagger = function (policy, posts, callback) {
  if (!callback) {
    var err = new Error('Missing a callback function.');
    callback(err);
  } else if (typeof(callback) !== 'function') {
    var err = new Error('The callback must be a function.')
    callback(err);
  } else if (!policy.flags) {
    var err = new Error('The policy must have a `flags` property.');
    callback(err);
  } else if (!posts) {
    var err = new Error('Missing an array of posts to flag.');
    callback(err);
  } else if (!Array.isArray(posts)) {
    var err = new Error('Posts must be an array of post objects.');
    callback(err);
  } else if (posts.length === 0) {
    var err = new Error('Array of posts must not be empty.');
    callback(err);
  }

  posts.forEach(function (post, postIndex) {
    post.flags = [];

    if (!post.content || !post.content.text) {
      post.flaggingError = new Error('Post must have a `content` property which contains a `text` property.');
    } else {
      policy.flags.forEach(function (flag, flagIndex) {
        var flagLocations = [];

        flag.words.forEach(function (word, wordIndex) {
          var foundWords;
          foundWords = flagFinder(word, post.content.text);

          if (foundWords) {
            post.flagged = true;

            foundWords.forEach(function (newerMatch) {
              flagLocations.forEach(function (olderMatch, index) {
                if (newerMatch.start === olderMatch.start) {
                  if (newerMatch.match.length > olderMatch.match.length) {
                    flagLocations[index] = newerMatch;
                    newerMatch = null;
                  } else {
                    newerMatch = null;
                  }
                }
              });

              if (newerMatch) {
                flagLocations.push(newerMatch);
              }
            });
          }
        });

        if (flagLocations.length > 0) {
          post.flags.push({
            flagId: flag.flagId,
            words: flag.words,
            loc: flagLocations,
            types: flag.types
          });
        }
      });

      if (post.flags.length === 0) {
        post.flagged = false;
        delete post.flags;
      }
    }
  });

  if (callback && typeof(callback) === 'function') {
    callback(null, posts);
  }
}

var flagFinder = function (word, text) {
  var regExp = {
    word: new RegExp(wordPattern(word), 'gim'),
    hash: new RegExp(hashPattern(word), 'gi')
  }
  var found;
  var foundCollection = [];

  for (var pattern in regExp) {
    if (regExp.hasOwnProperty(pattern)) {

      while((found = regExp[pattern].exec(text)) !== null) {
        var foundObj = {
          match: found[1],
          start: found.index + found[0].search(found[1]),
          end: found.index + found[0].search(found[1]) + found[1].length
        }
        foundCollection.push(foundObj);
        regExp[pattern].lastIndex--;
      }

    }
  }

  return foundCollection.length === 0 ? false : foundCollection;
}

var wordPattern = function (word) {
  return '(?:^|\\s)(' + word + ')(?:$|\\s)';
}

var hashPattern = function (word) {
  return '#\\w*(' + word + ')\\w*'
}

module.exports = flagger;
