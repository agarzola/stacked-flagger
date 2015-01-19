

var flagger = function (policy, posts, callback) {
  if (!policy.flags) {
    var err = 'The policy must have a `flags` property.';
    return callback(err, null);
  }

  posts.forEach(function (post, postIndex) {
    policy.flags.forEach(function (flag, flagIndex) {
      if (!post.flagged) {
        post.flagged = flagFinder(flag.words[0], post.content.text);
      }
    });
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

  return foundCollection.length > 0 ? true : false;
}

var wordPattern = function (word) {
  return '(?:^|\\s)(' + word + ')(?:$|\\s)';
}

var hashPattern = function (word) {
  return '#\\w*(' + word + ')\\w*'
}

module.exports = flagger;
