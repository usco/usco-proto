(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var repo = {};

// This only works for normal repos.  Github doesn't allow access to gists as
// far as I can tell.
var githubName = "usco/js-gittest";

// Your user can generate these manually at https://github.com/settings/tokens/new
// Or you can use an oauth flow to get a token for the user.
var githubToken = "96543aec8e9bded203baa89428943938554edf73";

// Mixin the main library using github to provide the following:
// - repo.loadAs(type, hash) => value
// - repo.saveAs(type, value) => hash
// - repo.readRef(ref) => hash
// - repo.updateRef(ref, hash) => hash
// - repo.createTree(entries) => hash
// - repo.hasHash(hash) => has
require('./mixins/github-db')(repo, githubName, githubToken);


// Github has this built-in, but it's currently very buggy so we replace with
// the manual implementation in js-git.
require('js-git/mixins/create-tree')(repo);

// Cache everything except blobs over 100 bytes in memory.
// This makes path-to-hash lookup a sync operation in most cases.
require('js-git/mixins/mem-cache')(repo);

// Combine concurrent read requests for the same hash
require('js-git/mixins/read-combiner')(repo);

// Add in value formatting niceties.  Also adds text and array types.
require('js-git/mixins/formats')(repo);

// I'm using generator syntax, but callback style also works.
// See js-git main docs for more details.

function errback(error)
{
  console.log("error");
  console.log(error);
}


repo.readRef("refs/heads/master", function (err, headHash) {
  if (err) return errback(err);
  console.log("headHash ok",headHash);
  
  repo.loadAs("commit",headHash, function (err, commit) {
    if (err) return errback(err);
    console.log("commit load ok",commit);
    
    repo.loadAs("tree", commit.tree, function (err, tree) {
      if (err) return errback(err);
      console.log("tree load ok",tree);
      var entry = tree["README.md"];
      
      repo.loadAs("text", entry.hash, function (err, readme) {
        if (err) return errback(err);
        console.log("opened readme;\n",readme);
      });
      
    });
  });
});

//repo.readRef("refs/heads/master",fetchHeadOk,errback);

/*var run = require('gen-run');
run(function* () {
  var headHash = yield repo.readRef("refs/heads/master");
  var commit = yield repo.loadAs("commit", headHash);
  console.log("commit load ok");
  var tree = yield repo.loadAs("tree", commit.tree);
  var entry = tree["README.md"];
  var readme = yield repo.loadAs("text", entry.hash);
  console.log("opened readme",readme);

  // Build the updates array
  var updates = [
    {
      path: "README.md", // Update the existing entry
      mode: entry.mode,  // Preserve the mode (it might have been executible)
      content: readme.toUpperCase() // Write the new content
    }
  ];
  // Based on the existing tree, we only want to update, not replace.
  updates.base = commit.tree;

  // Create the new file and the updated tree.
  var treeHash = yield repo.createTree(updates);

  var commitHash = yield repo.saveAs("commit", {
    tree: treeHash,
    author: {
      name: "bla bla",
      email: "kaosat.dev@gmail.com"
    },
    parent: headHash,
    message: "Change README.md to be all uppercase using js-github"
  });

  // Now we can browse to this commit by hash, but it's still not in master.
  // We need to update the ref to point to this new commit.
  console.log("COMMIT", commitHash)
  yield repo.updateRef("refs/heads/master", commitHash);
});*/

},{"./mixins/github-db":3,"js-git/mixins/create-tree":8,"js-git/mixins/formats":9,"js-git/mixins/mem-cache":10,"js-git/mixins/read-combiner":11}],2:[function(require,module,exports){
(function (process){
"use strict";

// Node.js https module
if (typeof process === 'object' && typeof process.versions === 'object' && process.versions.node) {
  var nodeRequire = require; // Prevent mine.js from seeing this require
  module.exports = nodeRequire('./xhr-node.js');
}

// Browser XHR
else {
  module.exports = function (root, accessToken) {
    return function request(method, url, body, callback) {
      if (typeof body === "function" && callback === undefined) {
        callback = body;
        body = undefined;
      }
      url = url.replace(":root", root);
      if (!callback) return request.bind(this, accessToken, method, url, body);
      var done = false;
      var json;
      var xhr = new XMLHttpRequest();
      xhr.timeout = 8000;
      xhr.open(method, 'https://api.github.com' + url, true);
      xhr.setRequestHeader("Authorization", "token " + accessToken);
      if (body) {
        xhr.setRequestHeader("Content-Type", "application/json");
        try { json = JSON.stringify(body); }
        catch (err) { return callback(err); }
      }
      xhr.ontimeout = onTimeout;
      xhr.onreadystatechange = onReadyStateChange;
      xhr.send(json);

      function onReadyStateChange() {
        if (done) return;
        if (xhr.readyState !== 4) return;
        // Give onTimeout a chance to run first if that's the reason status is 0.
        if (!xhr.status) return setTimeout(onReadyStateChange, 0);
        done = true;
        var response = {message:xhr.responseText};
        if (xhr.responseText){
          try { response = JSON.parse(xhr.responseText); }
          catch (err) {}
        }
        return callback(null, xhr, response);
      }

      function onTimeout() {
        if (done) return;
        done = true;
        callback(new Error("Timeout requesting " + url));
      }
    };
  };
}
}).call(this,require("/usr/local/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/usr/local/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":16}],3:[function(require,module,exports){
"use strict";

var modes = require('js-git/lib/modes');
var xhr = require('../lib/xhr');
var binary = require('bodec');
var sha1 = require('git-sha1');
var frame = require('js-git/lib/object-codec').frame;

var modeToType = {
  "040000": "tree",
  "100644": "blob",  // normal file
  "100755": "blob",  // executable file
  "120000": "blob",  // symlink
  "160000": "commit" // gitlink
};

var encoders = {
  commit: encodeCommit,
  tag: encodeTag,
  tree: encodeTree,
  blob: encodeBlob
};

var decoders = {
  commit: decodeCommit,
  tag: decodeTag,
  tree: decodeTree,
  blob: decodeBlob,
};

// Precompute hashes for empty blob and empty tree since github won't
var empty = binary.create(0);
var emptyBlob = sha1(frame({ type: "blob", body: empty }));
var emptyTree = sha1(frame({ type: "tree", body: empty }));

// Implement the js-git object interface using github APIs
module.exports = function (repo, root, accessToken) {

  var apiRequest = xhr(root, accessToken);

  repo.loadAs = loadAs;         // (type, hash) -> value, hash
  repo.saveAs = saveAs;         // (type, value) -> hash, value
  repo.readRef = readRef;       // (ref) -> hash
  repo.updateRef = updateRef;   // (ref, hash) -> hash
  repo.createTree = createTree; // (entries) -> hash, tree
  repo.hasHash = hasHash;

  function loadAs(type, hash, callback) {
    console.log("here", callback);
    if (!callback) return loadAs.bind(this, type, hash);
    // Github doesn't like empty trees, but we know them already.
    if (type === "tree" && hash === emptyTree) return callback(null, {}, hash);
    apiRequest("GET", "/repos/:root/git/" + type + "s/" + hash, onValue);

    function onValue(err, xhr, result) {
      if (err) return callback(err);
      if (xhr.status < 200 || xhr.status >= 500) {
        return callback(new Error("Invalid HTTP response: " + xhr.statusCode + " " + result.message));
      }
      if (xhr.status >= 300 && xhr.status < 500) return callback();
      var body;
      try { body = decoders[type].call(repo, result); }
      catch (err) { return callback(err); }
      if (hashAs(type, body) !== hash) {
        if (fixDate(type, body, hash)) console.log(type + " repaired", hash);
        // else console.warn("Unable to repair " + type, hash);
      }
      return callback(null, body, hash);
    }
  }

  function hasHash(type, hash, callback) {
    if (!callback) return hasHash.bind(this, type, hash);
    apiRequest("GET", "/repos/:root/git/" + type + "s/" + hash, onValue);

    function onValue(err, xhr, result) {
      if (err) return callback(err);
      if (xhr.status < 200 || xhr.status >= 500) {
        return callback(new Error("Invalid HTTP response: " + xhr.statusCode + " " + result.message));
      }
      if (xhr.status >= 300 && xhr.status < 500) return callback(null, false);
      callback(null, true);
    }
  }

  function saveAs(type, body, callback) {
    if (!callback) return saveAs.bind(this, type, body);
    var request;
    try {
      request = encoders[type](body);
    }
    catch (err) {
      return callback(err);
    }

    // Github doesn't allow creating empty trees.
    if (type === "tree" && request.tree.length === 0) {
      return callback(null, emptyTree, body);
    }
    return apiRequest("POST", "/repos/:root/git/" + type + "s", request, onWrite);

    function onWrite(err, xhr, result) {
      if (err) return callback(err);
      if (xhr.status < 200 || xhr.status >= 300) {
        return callback(new Error("Invalid HTTP response: " + xhr.status + " " + result.message));
      }
      return callback(null, result.sha, body);
    }
  }

  // Create a tree with optional deep paths and create new blobs.
  // Entries is an array of {mode, path, hash|content}
  // Also deltas can be specified by setting entries.base to the hash of a tree
  // in delta mode, entries can be removed by specifying just {path}
  function createTree(entries, callback) {
    if (!callback) return createTree.bind(this, entries);
    var toDelete = entries.base && entries.filter(function (entry) {
      return !entry.mode;
    }).map(function (entry) {
      return entry.path;
    });
    if (toDelete && toDelete.length) return slowUpdateTree(entries, toDelete, callback);
    return fastUpdateTree(entries, callback);
  }

  function fastUpdateTree(entries, callback) {
    var request = { tree: entries.map(mapTreeEntry) };
    if (entries.base) request.base_tree = entries.base;

    apiRequest("POST", "/repos/:root/git/trees", request, onWrite);

    function onWrite(err, xhr, result) {
      if (err) return callback(err);
      if (xhr.status < 200 || xhr.status >= 300) {
        return callback(new Error("Invalid HTTP response: " + xhr.status + " " + result.message));
      }
      return callback(null, result.sha, decoders.tree(result));
    }
  }

  // Github doesn't support deleting entries via the createTree API, so we
  // need to manually create those affected trees and modify the request.
  function slowUpdateTree(entries, toDelete, callback) {
    callback = singleCall(callback);
    var root = entries.base;

    var left = 0;

    // Calculate trees that need to be re-built and save any provided content.
    var parents = {};
    toDelete.forEach(function (path) {
      var parentPath = path.substr(0, path.lastIndexOf("/"));
      var parent = parents[parentPath] || (parents[parentPath] = {
        add: {}, del: []
      });
      var name = path.substr(path.lastIndexOf("/") + 1);
      parent.del.push(name);
    });
    var other = entries.filter(function (entry) {
      if (!entry.mode) return false;
      var parentPath = entry.path.substr(0, entry.path.lastIndexOf("/"));
      var parent = parents[parentPath];
      if (!parent) return true;
      var name = entry.path.substr(entry.path.lastIndexOf("/") + 1);
      if (entry.hash) {
        parent.add[name] = {
          mode: entry.mode,
          hash: entry.hash
        };
        return false;
      }
      left++;
      repo.saveAs("blob", entry.content, function(err, hash) {
        if (err) return callback(err);
        parent.add[name] = {
          mode: entry.mode,
          hash: hash
        };
        if (!--left) onParents();
      });
      return false;
    });
    if (!left) onParents();

    function onParents() {
      Object.keys(parents).forEach(function (parentPath) {
        left++;
        // TODO: remove this dependency on pathToEntry
        repo.pathToEntry(root, parentPath, function (err, entry) {
          if (err) return callback(err);
          var tree = entry.tree;
          var commands = parents[parentPath];
          commands.del.forEach(function (name) {
            delete tree[name];
          });
          for (var name in commands.add) {
            tree[name] = commands.add[name];
          }
          repo.saveAs("tree", tree, function (err, hash, tree) {
            if (err) return callback(err);
            other.push({
              path: parentPath,
              hash: hash,
              mode: modes.tree
            });
            if (!--left) {
              other.base = entries.base;
              if (other.length === 1 && other[0].path === "") {
                return callback(null, hash, tree);
              }
              fastUpdateTree(other, callback);
            }
          });
        });
      });
    }
  }


  function readRef(ref, callback) {
    if (!callback) return readRef.bind(this, ref);
    if (ref === "HEAD") ref = "refs/heads/master";
    if (!(/^refs\//).test(ref)) {
      return callback(new TypeError("Invalid ref: " + ref));
    }
    return apiRequest("GET", "/repos/:root/git/" + ref, onRef);

    function onRef(err, xhr, result) {
      if (err) return callback(err);
      if (xhr.status === 404) return callback();
      if (xhr.status < 200 || xhr.status >= 300) {
        return callback(new Error("Invalid HTTP response: " + xhr.status + " " + result.message));
      }
      return callback(null, result.object.sha);
    }
  }

  function updateRef(ref, hash, callback) {
    if (!callback) return updateRef.bind(this, ref, hash);
    if (!(/^refs\//).test(ref)) {
      return callback(new Error("Invalid ref: " + ref));
    }
    return apiRequest("PATCH", "/repos/:root/git/" + ref, {
      sha: hash
    }, onResult);

    function onResult(err, xhr, result) {
      if (err) return callback(err);
      if (xhr.status === 422 && result.message === "Reference does not exist") {
        return apiRequest("POST", "/repos/:root/git/refs", {
          ref: ref,
          sha: hash
        }, onResult);
      }
      if (xhr.status < 200 || xhr.status >= 300) {
        return callback(new Error("Invalid HTTP response: " + xhr.status + " " + result.message));
      }
      if (err) return callback(err);
      callback(null, hash);
    }

  }

};

// GitHub has a nasty habit of stripping whitespace from messages and loosing
// the timezone.  This information is required to make our hashes match up, so
// we guess it by mutating the value till the hash matches.
// If we're unable to match, we will just force the hash when saving to the cache.
function fixDate(type, value, hash) {
  if (type !== "commit" && type !== "tag") return;
  // Add up to 2 extra newlines and try all 30-minutes timezone offsets.
  for (var x = 0; x < 3; x++) {
    for (var i = -720; i < 720; i += 30) {
      if (type === "commit") {
        value.author.date.timezoneOffset = i;
        value.committer.date.timezoneOffset = i;
      }
      else if (type === "tag") {
        value.tagger.date.timezoneOffset = i;
      }
      if (hash === hashAs(type, value)) return true;
    }
    value.message += "\n";
  }
  // Guessing failed, remove the temporary offset.
  if (type === "commit") {
    delete value.author.date.timezoneOffset;
    delete value.committer.date.timezoneOffset;
  }
  else if (type === "tag") {
    delete value.tagger.date.timezoneOffset;
  }
}

function mapTreeEntry(entry) {
  if (!entry.mode) throw new TypeError("Invalid entry");
  var mode = modeToString(entry.mode);
  var item = {
    path: entry.path,
    mode: mode,
    type: modeToType[mode]
  };
  // Magic hash for empty file since github rejects empty contents.
  if (entry.content === "") entry.hash = emptyBlob;

  if (entry.hash) item.sha = entry.hash;
  else item.content = entry.content;
  return  item;
}

function encodeCommit(commit) {
  var out = {};
  out.message = commit.message;
  out.tree = commit.tree;
  if (commit.parents) out.parents = commit.parents;
  else if (commit.parent) out.parents = [commit.parent];
  else commit.parents = [];
  if (commit.author) out.author = encodePerson(commit.author);
  if (commit.committer) out.committer = encodePerson(commit.committer);
  return out;
}

function encodeTag(tag) {
  return {
    tag: tag.tag,
    message: tag.message,
    object: tag.object,
    tagger: encodePerson(tag.tagger)
  };
}

function encodePerson(person) {
  return {
    name: person.name,
    email: person.email,
    date: (new Date(person.date.seconds * 1000)).toISOString()
  };
}

function encodeTree(tree) {
  return {
    tree: Object.keys(tree).map(function (name) {
      var entry = tree[name];
      var mode = modeToString(entry.mode);
      return {
        path: name,
        mode: mode,
        type: modeToType[mode],
        sha: entry.hash
      };
    })
  };
}

function encodeBlob(blob) {
  if (typeof blob === "string") return {
    content: binary.encodeUtf8(blob),
    encoding: "utf-8"
  };
  if (binary.isBinary(blob)) return {
    content: binary.toBase64(blob),
    encoding: "base64"
  };
  console.error({blob:blob})
  throw new TypeError("Invalid blob type, must be binary or string");
}

function modeToString(mode) {
  var string = mode.toString(8);
  // Github likes all modes to be 6 chars long
  if (string.length === 5) string = "0" + string;
  return string;
}

function decodeCommit(result) {
  return {
    tree: result.tree.sha,
    parents: result.parents.map(function (object) {
      return object.sha;
    }),
    author: pickPerson(result.author),
    committer: pickPerson(result.committer),
    message: result.message
  };
}

function decodeTag(result) {
  return {
    object: result.object.sha,
    type: result.object.type,
    tag: result.tag,
    tagger: pickPerson(result.tagger),
    message: result.message
  };
}

function decodeTree(result) {
  var tree = {};
  result.tree.forEach(function (entry) {
    tree[entry.path] = {
      mode: parseInt(entry.mode, 8),
      hash: entry.sha
    };
  });
  return tree;
}

function decodeBlob(result) {
  if (result.encoding === 'base64') {
    return binary.fromBase64(result.content.replace(/\n/g, ''));
  }
  if (result.encoding === 'utf-8') {
    return binary.fromUtf8(result.content);
  }
  throw new Error("Unknown blob encoding: " + result.encoding);
}

function pickPerson(person) {
  return {
    name: person.name,
    email: person.email,
    date: parseDate(person.date)
  };
}

function parseDate(string) {
  // TODO: test this once GitHub adds timezone information
  var match = string.match(/(-?)([0-9]{2}):([0-9]{2})$/);
  var date = new Date(string);
  var timezoneOffset = 0;
  if (match) {
    timezoneOffset = (match[1] === "-" ? 1 : -1) * (
      parseInt(match[2], 10) * 60 + parseInt(match[3], 10)
    );
  }
  return {
    seconds: date.valueOf() / 1000,
    offset: timezoneOffset
  };
}

function singleCall(callback) {
  var done = false;
  return function () {
    if (done) return console.warn("Discarding extra callback");
    done = true;
    return callback.apply(this, arguments);
  };
}

function hashAs(type, body) {
  var buffer = frame({type: type, body: body});
  return sha1(buffer);
}

},{"../lib/xhr":2,"bodec":4,"git-sha1":5,"js-git/lib/modes":6,"js-git/lib/object-codec":7}],4:[function(require,module,exports){
(function (process){
"use strict";
/*global escape, unescape*/

var isNode = typeof process === 'object' && typeof process.versions === 'object' && process.versions.node;

if (isNode) {
  var nodeRequire = require; // Prevent mine.js from seeing this require
  module.exports = nodeRequire('./bodec-node.js');
}
else {

  // This file must be served with UTF-8 encoding for the utf8 codec to work.
  module.exports = {
    // Utility functions
    isBinary: isBinary,
    create: create,
    join: join,

    // Binary input and output
    copy: copy,
    slice: slice,

    // String input and output
    toRaw: toRaw,
    fromRaw: fromRaw,
    toUnicode: toUnicode,
    fromUnicode: fromUnicode,
    toHex: toHex,
    fromHex: fromHex,
    toBase64: toBase64,
    fromBase64: fromBase64,

    // Array input and output
    toArray: toArray,
    fromArray: fromArray,

    // Raw <-> Hex-encoded codec
    decodeHex: decodeHex,
    encodeHex: encodeHex,

    decodeBase64: decodeBase64,
    encodeBase64: encodeBase64,

    // Unicode <-> Utf8-encoded-raw codec
    encodeUtf8: encodeUtf8,
    decodeUtf8: decodeUtf8,

    // Hex <-> Nibble codec
    nibbleToCode: nibbleToCode,
    codeToNibble: codeToNibble
  };
}

function isBinary(value) {
  return value &&
      typeof value === "object" &&
      value.constructor.name === "Uint8Array";
}

function create(length) {
  return new Uint8Array(length);
}

function join(chunks) {
  var length = chunks.length;
  var total = 0;
  for (var i = 0; i < length; i++) {
    total += chunks[i].length;
  }
  var binary = create(total);
  var offset = 0;
  for (i = 0; i < length; i++) {
    var chunk = chunks[i];
    copy(chunk, binary, offset);
    offset += chunk.length;
  }
  return binary;
}

function slice(binary, start, end) {
  if (end === undefined) {
    end = binary.length;
    if (start === undefined) start = 0;
  }
  return binary.subarray(start, end);
}

function copy(source, binary, offset) {
  var length = source.length;
  if (offset === undefined) {
    offset = 0;
    if (binary === undefined) binary = create(length);
  }
  for (var i = 0; i < length; i++) {
    binary[i + offset] = source[i];
  }
  return binary;
}

// Like slice, but encode as a hex string
function toHex(binary, start, end) {
  var hex = "";
  if (end === undefined) {
    end = binary.length;
    if (start === undefined) start = 0;
  }
  for (var i = start; i < end; i++) {
    var byte = binary[i];
    hex += String.fromCharCode(nibbleToCode(byte >> 4)) +
           String.fromCharCode(nibbleToCode(byte & 0xf));
  }
  return hex;
}

// Like copy, but decode from a hex string
function fromHex(hex, binary, offset) {
  var length = hex.length / 2;
  if (offset === undefined) {
    offset = 0;
    if (binary === undefined) binary = create(length);
  }
  var j = 0;
  for (var i = 0; i < length; i++) {
    binary[offset + i] = (codeToNibble(hex.charCodeAt(j++)) << 4)
                       |  codeToNibble(hex.charCodeAt(j++));
  }
  return binary;
}

function toBase64(binary, start, end) {
  return btoa(toRaw(binary, start, end));
}

function fromBase64(base64, binary, offset) {
  return fromRaw(atob(base64), binary, offset);
}

function nibbleToCode(nibble) {
  nibble |= 0;
  return (nibble + (nibble < 10 ? 0x30 : 0x57))|0;
}

function codeToNibble(code) {
  code |= 0;
  return (code - ((code & 0x40) ? 0x57 : 0x30))|0;
}

function toUnicode(binary, start, end) {
  return decodeUtf8(toRaw(binary, start, end));
}

function fromUnicode(unicode, binary, offset) {
  return fromRaw(encodeUtf8(unicode), binary, offset);
}

function decodeHex(hex) {
  var j = 0, l = hex.length;
  var raw = "";
  while (j < l) {
    raw += String.fromCharCode(
       (codeToNibble(hex.charCodeAt(j++)) << 4)
      | codeToNibble(hex.charCodeAt(j++))
    );
  }
  return raw;
}

function encodeHex(raw) {
  var hex = "";
  var length = raw.length;
  for (var i = 0; i < length; i++) {
    var byte = raw.charCodeAt(i);
    hex += String.fromCharCode(nibbleToCode(byte >> 4)) +
           String.fromCharCode(nibbleToCode(byte & 0xf));
  }
  return hex;
}

function decodeBase64(base64) {
  return atob(base64);
}

function encodeBase64(raw) {
  return btoa(raw);
}

function decodeUtf8(utf8) {
  return decodeURIComponent(escape(utf8));
}

function encodeUtf8(unicode) {
  return unescape(encodeURIComponent(unicode));
}

function toRaw(binary, start, end) {
  var raw = "";
  if (end === undefined) {
    end = binary.length;
    if (start === undefined) start = 0;
  }
  for (var i = start; i < end; i++) {
    raw += String.fromCharCode(binary[i]);
  }
  return raw;
}

function fromRaw(raw, binary, offset) {
  var length = raw.length;
  if (offset === undefined) {
    offset = 0;
    if (binary === undefined) binary = create(length);
  }
  for (var i = 0; i < length; i++) {
    binary[offset + i] = raw.charCodeAt(i);
  }
  return binary;
}

function toArray(binary, start, end) {
  if (end === undefined) {
    end = binary.length;
    if (start === undefined) start = 0;
  }
  var length = end - start;
  var array = new Array(length);
  for (var i = 0; i < length; i++) {
    array[i] = binary[i + start];
  }
  return array;
}

function fromArray(array, binary, offset) {
  var length = array.length;
  if (offset === undefined) {
    offset = 0;
    if (binary === undefined) binary = create(length);
  }
  for (var i = 0; i < length; i++) {
    binary[offset + i] = array[i];
  }
  return binary;
}

}).call(this,require("/usr/local/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/usr/local/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":16}],5:[function(require,module,exports){
(function (process){
"use strict";

var create, crypto;
if (typeof process === 'object' && typeof process.versions === 'object' && process.versions.node) {
  var nodeRequire = require; // Prevent mine.js from seeing this require
  crypto = nodeRequire('crypto');
  create = createNode;
}
else {
  create = createJs;
}

// Input chunks must be either arrays of bytes or "raw" encoded strings
module.exports = function sha1(buffer) {
  if (buffer === undefined) return create();
  var shasum = create();
  shasum.update(buffer);
  return shasum.digest();
};

// Use node's openssl bindings when available
function createNode() {
  var shasum = crypto.createHash('sha1');
  return {
    update: function (buffer) {
      return shasum.update(buffer);
    },
    digest: function () {
      return shasum.digest('hex');
    }
  };
}

// A pure JS implementation of sha1 for non-node environments.
function createJs() {
  var h0 = 0x67452301;
  var h1 = 0xEFCDAB89;
  var h2 = 0x98BADCFE;
  var h3 = 0x10325476;
  var h4 = 0xC3D2E1F0;
  // The first 64 bytes (16 words) is the data chunk
  var block = new Uint32Array(80), offset = 0, shift = 24;
  var totalLength = 0;

  return { update: update, digest: digest };

  // The user gave us more data.  Store it!
  function update(chunk) {
    if (typeof chunk === "string") return updateString(chunk);
    var length = chunk.length;
    totalLength += length * 8;
    for (var i = 0; i < length; i++) {
      write(chunk[i]);
    }
  }

  function updateString(string) {
    var length = string.length;
    totalLength += length * 8;
    for (var i = 0; i < length; i++) {
      write(string.charCodeAt(i));
    }
  }


  function write(byte) {
    block[offset] |= (byte & 0xff) << shift;
    if (shift) {
      shift -= 8;
    }
    else {
      offset++;
      shift = 24;
    }
    if (offset === 16) processBlock();
  }

  // No more data will come, pad the block, process and return the result.
  function digest() {
    // Pad
    write(0x80);
    if (offset > 14 || (offset === 14 && shift < 24)) {
      processBlock();
    }
    offset = 14;
    shift = 24;

    // 64-bit length big-endian
    write(0x00); // numbers this big aren't accurate in javascript anyway
    write(0x00); // ..So just hard-code to zero.
    write(totalLength > 0xffffffffff ? totalLength / 0x10000000000 : 0x00);
    write(totalLength > 0xffffffff ? totalLength / 0x100000000 : 0x00);
    for (var s = 24; s >= 0; s -= 8) {
      write(totalLength >> s);
    }

    // At this point one last processBlock() should trigger and we can pull out the result.
    return toHex(h0) +
           toHex(h1) +
           toHex(h2) +
           toHex(h3) +
           toHex(h4);
  }

  // We have a full block to process.  Let's do it!
  function processBlock() {
    // Extend the sixteen 32-bit words into eighty 32-bit words:
    for (var i = 16; i < 80; i++) {
      var w = block[i - 3] ^ block[i - 8] ^ block[i - 14] ^ block[i - 16];
      block[i] = (w << 1) | (w >>> 31);
    }

    // log(block);

    // Initialize hash value for this chunk:
    var a = h0;
    var b = h1;
    var c = h2;
    var d = h3;
    var e = h4;
    var f, k;

    // Main loop:
    for (i = 0; i < 80; i++) {
      if (i < 20) {
        f = d ^ (b & (c ^ d));
        k = 0x5A827999;
      }
      else if (i < 40) {
        f = b ^ c ^ d;
        k = 0x6ED9EBA1;
      }
      else if (i < 60) {
        f = (b & c) | (d & (b | c));
        k = 0x8F1BBCDC;
      }
      else {
        f = b ^ c ^ d;
        k = 0xCA62C1D6;
      }
      var temp = (a << 5 | a >>> 27) + f + e + k + (block[i]|0);
      e = d;
      d = c;
      c = (b << 30 | b >>> 2);
      b = a;
      a = temp;
    }

    // Add this chunk's hash to result so far:
    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;

    // The block is now reusable.
    offset = 0;
    for (i = 0; i < 16; i++) {
      block[i] = 0;
    }
  }

  function toHex(word) {
    var hex = "";
    for (var i = 28; i >= 0; i -= 4) {
      hex += ((word >> i) & 0xf).toString(16);
    }
    return hex;
  }

}

}).call(this,require("/usr/local/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/usr/local/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":16}],6:[function(require,module,exports){
// Not strict mode because it uses octal literals all over.
module.exports = {
  isBlob: function (mode) {
    return (mode & 0140000) === 0100000;
  },
  isFile: function (mode) {
    return (mode & 0160000) === 0100000;
  },
  toType: function (mode) {
    if (mode === 0160000) return "commit";
    if (mode ===  040000) return "tree";
    if ((mode & 0140000) === 0100000) return "blob";
    return "unknown";
  },
  tree:    040000,
  blob:   0100644,
  file:   0100644,
  exec:   0100755,
  sym:    0120000,
  commit: 0160000
};

},{}],7:[function(require,module,exports){
var bodec = require('bodec');

// (body) -> raw-buffer
var encoders = exports.encoders = {
  blob: encodeBlob,
  tree: encodeTree,
  commit: encodeCommit,
  tag: encodeTag
};

  // ({type:type, body:raw-buffer}) -> buffer
exports.frame = frame;

// (raw-buffer) -> body
var decoders = exports.decoders ={
  blob: decodeBlob,
  tree: decodeTree,
  commit: decodeCommit,
  tag: decodeTag
};

// (buffer) -> {type:type, body:raw-buffer}
exports.deframe = deframe;

function encodeBlob(body) {
  if (!bodec.isBinary(body)) throw new TypeError("Blobs must be binary values");
  return body;
}

function encodeTree(body) {
  var tree = "";
  if (Array.isArray(body)) throw new TypeError("Tree must be in object form");
  var names = Object.keys(body).sort(function (a, b) {
    return a + "/" > b + "/";
  });
  for (var i = 0, l = names.length; i < l; i++) {
    var name = names[i];
    var entry = body[name];
    tree += entry.mode.toString(8) + " " + bodec.encodeUtf8(name) +
            "\0" + bodec.decodeHex(entry.hash);
  }
  return bodec.fromRaw(tree);
}

function encodeTag(body) {
  var str = "object " + body.object +
    "\ntype " + body.type +
    "\ntag " + body.tag +
    "\ntagger " + formatPerson(body.tagger) +
    "\n\n" + body.message;
  return bodec.fromUnicode(str);
}

function encodeCommit(body) {
  var str = "tree " + body.tree;
  for (var i = 0, l = body.parents.length; i < l; ++i) {
    str += "\nparent " + body.parents[i];
  }
  str += "\nauthor " + formatPerson(body.author) +
         "\ncommitter " + formatPerson(body.committer) +
         "\n\n" + body.message;
  return bodec.fromUnicode(str);
}


function formatPerson(person) {
  return safe(person.name) +
    " <" + safe(person.email) + "> " +
    formatDate(person.date);
}

function safe(string) {
  return string.replace(/(?:^[\.,:;<>"']+|[\0\n<>]+|[\.,:;<>"']+$)/gm, "");
}

function two(num) {
  return (num < 10 ? "0" : "") + num;
}

function formatDate(date) {
  var seconds, offset;
  if (date.seconds) {
    seconds = date.seconds;
    offset = date.offset;
  }
  // Also accept Date instances
  else {
    seconds = Math.floor(date.getTime() / 1000);
    offset = date.getTimezoneOffset();
  }
  var neg = "+";
  if (offset <= 0) offset = -offset;
  else neg = "-";
  offset = neg + two(Math.floor(offset / 60)) + two(offset % 60);
  return seconds + " " + offset;
}

function frame(obj) {
  var type = obj.type;
  var body = obj.body;
  if (!bodec.isBinary(body)) body = encoders[type](body);
  return bodec.join([
    bodec.fromRaw(type + " " + body.length + "\0"),
    body
  ]);
}

function decodeBlob(body) {
  return body;
}

function decodeTree(body) {
  var i = 0;
  var length = body.length;
  var start;
  var mode;
  var name;
  var hash;
  var tree = {};
  while (i < length) {
    start = i;
    i = indexOf(body, 0x20, start);
    if (i < 0) throw new SyntaxError("Missing space");
    mode = parseOct(body, start, i++);
    start = i;
    i = indexOf(body, 0x00, start);
    name = bodec.toUnicode(body, start, i++);
    hash = bodec.toHex(body, i, i += 20);
    tree[name] = {
      mode: mode,
      hash: hash
    };
  }
  return tree;
}

function decodeCommit(body) {
  var i = 0;
  var start;
  var key;
  var parents = [];
  var commit = {
    tree: "",
    parents: parents,
    author: "",
    committer: "",
    message: ""
  };
  while (body[i] !== 0x0a) {
    start = i;
    i = indexOf(body, 0x20, start);
    if (i < 0) throw new SyntaxError("Missing space");
    key = bodec.toRaw(body, start, i++);
    start = i;
    i = indexOf(body, 0x0a, start);
    if (i < 0) throw new SyntaxError("Missing linefeed");
    var value = bodec.toUnicode(body, start, i++);
    if (key === "parent") {
      parents.push(value);
    }
    else {
      if (key === "author" || key === "committer") {
        value = decodePerson(value);
      }
      commit[key] = value;
    }
  }
  i++;
  commit.message = bodec.toUnicode(body, i, body.length);
  return commit;
}

function decodeTag(body) {
  var i = 0;
  var start;
  var key;
  var tag = {};
  while (body[i] !== 0x0a) {
    start = i;
    i = indexOf(body, 0x20, start);
    if (i < 0) throw new SyntaxError("Missing space");
    key = bodec.toRaw(body, start, i++);
    start = i;
    i = indexOf(body, 0x0a, start);
    if (i < 0) throw new SyntaxError("Missing linefeed");
    var value = bodec.toUnicode(body, start, i++);
    if (key === "tagger") value = decodePerson(value);
    tag[key] = value;
  }
  i++;
  tag.message = bodec.toUnicode(body, i, body.length);
  return tag;
}

function decodePerson(string) {
  var match = string.match(/^([^<]*) <([^>]*)> ([^ ]*) (.*)$/);
  if (!match) throw new Error("Improperly formatted person string");
  return {
    name: match[1],
    email: match[2],
    date: {
      seconds: parseInt(match[3], 10),
      offset: parseInt(match[4], 10) / 100 * -60
    }
  };
}

function deframe(buffer, decode) {
  var space = indexOf(buffer, 0x20);
  if (space < 0) throw new Error("Invalid git object buffer");
  var nil = indexOf(buffer, 0x00, space);
  if (nil < 0) throw new Error("Invalid git object buffer");
  var body = bodec.slice(buffer, nil + 1);
  var size = parseDec(buffer, space + 1, nil);
  if (size !== body.length) throw new Error("Invalid body length.");
  var type = bodec.toRaw(buffer, 0, space);
  return {
    type: type,
    body: decode ? decoders[type](body) : body
  };
}

function indexOf(buffer, byte, i) {
  i |= 0;
  var length = buffer.length;
  for (;;i++) {
    if (i >= length) return -1;
    if (buffer[i] === byte) return i;
  }
}

function parseOct(buffer, start, end) {
  var val = 0;
  while (start < end) {
    val = (val << 3) + buffer[start++] - 0x30;
  }
  return val;
}

function parseDec(buffer, start, end) {
  var val = 0;
  while (start < end) {
    val = val * 10 + buffer[start++] - 0x30;
  }
  return val;
}

},{"bodec":12}],8:[function(require,module,exports){
"use strict";

var modes = require('../lib/modes.js');

module.exports = function (repo) {
  repo.createTree = createTree;

  function createTree(entries, callback) {
    if (!callback) return createTree.bind(null, entries);
    callback = singleCall(callback);
    if (!Array.isArray(entries)) {
      entries = Object.keys(entries).map(function (path) {
        var entry = entries[path];
        entry.path = path;
        return entry;
      });
    }

    // Tree paths that we need loaded
    var toLoad = {};
    function markTree(path) {
      while(true) {
        if (toLoad[path]) return;
        toLoad[path] = true;
        trees[path] = {
          add: [],
          del: [],
          tree: {}
        };
        if (!path) break;
        path = path.substring(0, path.lastIndexOf("/"));
      }
    }

    // Commands to run organized by tree path
    var trees = {};

    // Counter for parallel I/O operations
    var left = 1; // One extra counter to protect again zalgo cache callbacks.

    // First pass, stubs out the trees structure, sorts adds from deletes,
    // and saves any inline content blobs.
    entries.forEach(function (entry) {
      var index = entry.path.lastIndexOf("/");
      var parentPath = entry.path.substr(0, index);
      var name = entry.path.substr(index + 1);
      markTree(parentPath);
      var tree = trees[parentPath];
      var adds = tree.add;
      var dels = tree.del;

      if (!entry.mode) {
        dels.push(name);
        return;
      }
      var add = {
        name: name,
        mode: entry.mode,
        hash: entry.hash
      };
      adds.push(add);
      if (entry.hash) return;
      left++;
      repo.saveAs("blob", entry.content, function (err, hash) {
        if (err) return callback(err);
        add.hash = hash;
        check();
      });
    });

    // Preload the base trees
    if (entries.base) loadTree("", entries.base);

    // Check just in case there was no IO to perform
    check();

    function loadTree(path, hash) {
      left++;
      delete toLoad[path];
      repo.loadAs("tree", hash, function (err, tree) {
        if (err) return callback(err);
        trees[path].tree = tree;
        Object.keys(tree).forEach(function (name) {
          var childPath = path ? path + "/" + name : name;
          if (toLoad[childPath]) loadTree(childPath, tree[name].hash);
        });
        check();
      });
    }

    function check() {
      if (--left) return;
      findLeaves().forEach(processLeaf);
    }

    function processLeaf(path) {
      var entry = trees[path];
      delete trees[path];
      var tree = entry.tree;
      entry.del.forEach(function (name) {
        delete tree[name];
      });
      entry.add.forEach(function (item) {
        tree[item.name] = {
          mode: item.mode,
          hash: item.hash
        };
      });
      left++;
      repo.saveAs("tree", tree, function (err, hash, tree) {
        if (err) return callback(err);
        if (!path) return callback(null, hash, tree);
        var index = path.lastIndexOf("/");
        var parentPath = path.substring(0, index);
        var name = path.substring(index + 1);
        trees[parentPath].add.push({
          name: name,
          mode: modes.tree,
          hash: hash
        });
        if (--left) return;
        findLeaves().forEach(processLeaf);
      });
    }

    function findLeaves() {
      var paths = Object.keys(trees);
      var parents = {};
      paths.forEach(function (path) {
        if (!path) return;
        var parent = path.substring(0, path.lastIndexOf("/"));
        parents[parent] = true;
      });
      return paths.filter(function (path) {
        return !parents[path];
      });
    }
  }
};

function singleCall(callback) {
  var done = false;
  return function () {
    if (done) return console.warn("Discarding extra callback");
    done = true;
    return callback.apply(this, arguments);
  };
}

},{"../lib/modes.js":6}],9:[function(require,module,exports){
"use strict";

var bodec = require('bodec');

module.exports = function (repo) {
  var loadAs = repo.loadAs;
  repo.loadAs = newLoadAs;
  var saveAs = repo.saveAs;
  repo.saveAs = newSaveAs;

  function newLoadAs(type, hash, callback) {
    var realType = type === "text" ? "blob":
                   type === "array" ? "tree" : type;
    return loadAs.call(repo, realType, hash, onLoad);

    function onLoad(err, body, hash) {
      if (body === undefined) return callback(err);
      if (type === "text") body = bodec.toUnicode(body);
      if (type === "array") body = toArray(body);
      return callback(err, body, hash);
    }
  }

  function newSaveAs(type, body, callback) {
    type = type === "text" ? "blob":
           type === "array" ? "tree" : type;
    if (type === "blob") {
      if (typeof body === "string") {
        body = bodec.fromUnicode(body);
      }
    }
    else if (type === "tree") {
      body = normalizeTree(body);
    }
    else if (type === "commit") {
      body = normalizeCommit(body);
    }
    else if (type === "tag") {
      body = normalizeTag(body);
    }
    return saveAs.call(repo, type, body, callback);
  }

};

function toArray(tree) {
  return Object.keys(tree).map(function (name) {
    var entry = tree[name];
    entry.name = name;
    return entry;
  });
}

function normalizeTree(body) {
  var type = body && typeof body;
  if (type !== "object") {
    throw new TypeError("Tree body must be array or object");
  }
  var tree = {}, i, l, entry;
  // If array form is passed in, convert to object form.
  if (Array.isArray(body)) {
    for (i = 0, l = body.length; i < l; i++) {
      entry = body[i];
      tree[entry.name] = {
        mode: entry.mode,
        hash: entry.hash
      };
    }
  }
  else {
    var names = Object.keys(body);
    for (i = 0, l = names.length; i < l; i++) {
      var name = names[i];
      entry = body[name];
      tree[name] = {
        mode: entry.mode,
        hash: entry.hash
      };
    }
  }
  return tree;
}

function normalizeCommit(body) {
  if (!body || typeof body !== "object") {
    throw new TypeError("Commit body must be an object");
  }
  if (!(body.tree && body.author && body.message)) {
    throw new TypeError("Tree, author, and message are required for commits");
  }
  var parents = body.parents || (body.parent ? [ body.parent ] : []);
  if (!Array.isArray(parents)) {
    throw new TypeError("Parents must be an array");
  }
  var author = normalizePerson(body.author);
  var committer = body.committer ? normalizePerson(body.committer) : author;
  return {
    tree: body.tree,
    parents: parents,
    author: author,
    committer: committer,
    message: body.message
  };
}

function normalizeTag(body) {
  if (!body || typeof body !== "object") {
    throw new TypeError("Tag body must be an object");
  }
  if (!(body.object && body.type && body.tag && body.tagger && body.message)) {
    throw new TypeError("Object, type, tag, tagger, and message required");
  }
  return {
    object: body.object,
    type: body.type,
    tag: body.tag,
    tagger: normalizePerson(body.tagger),
    message: body.message
  };
}

function normalizePerson(person) {
  if (!person || typeof person !== "object") {
    throw new TypeError("Person must be an object");
  }
  if (!person.name || !person.email) {
    throw new TypeError("Name and email are required for person fields");
  }
  return {
    name: person.name,
    email: person.email,
    date: person.date || new Date()
  };
}

},{"bodec":12}],10:[function(require,module,exports){
(function (Buffer){
"use strict";

var encoders = require('../lib/object-codec').encoders;
var decoders = require('../lib/object-codec').decoders;

var cache = memCache.cache = {};
module.exports = memCache;

function memCache(repo) {
  var loadAs = repo.loadAs;
  repo.loadAs = loadAsCached;
  function loadAsCached(type, hash, callback) {
    if (!callback) return loadAsCached.bind(this, type, hash);
    if (hash in cache) return callback(null, dupe(type, cache[hash]), hash);
    loadAs.call(repo, type, hash, function (err, value) {
      if (value === undefined) return callback(err);
      if (type !== "blob" || value.length < 100) {
        cache[hash] = dupe(type, value);
      }
      return callback.apply(this, arguments);
    });
  }

  var saveAs = repo.saveAs;
  repo.saveAs = saveAsCached;
  function saveAsCached(type, value, callback) {
    if (!callback) return saveAsCached.bind(this, type, value);
    value = dupe(type, value);
    saveAs.call(repo, type, value, function (err, hash) {
      if (err) return callback(err);
      if (type !== "blob" || value.length < 100) {
        cache[hash] = value;
      }
      return callback(null, hash, value);
    });
  }
}
var Binary = typeof Buffer === "function" ? Buffer : Uint8Array;
function dupe(type, value) {
  if (type === "blob") {
    if (type.length >= 100) return value;
    return new Binary(value);
  }
  return decoders[type](encoders[type](value));
}

function deepFreeze(obj) {
  Object.freeze(obj);
  Object.keys(obj).forEach(function (key) {
    var value = obj[key];
    if (typeof value === "object") deepFreeze(value);
  });
}

}).call(this,require("buffer").Buffer)
},{"../lib/object-codec":7,"buffer":13}],11:[function(require,module,exports){
"use strict";

// This replaces loadAs with a version that batches concurrent requests for
// the same hash.
module.exports = function (repo) {
  var pendingReqs = {};

  var loadAs = repo.loadAs;
  repo.loadAs = newLoadAs;

  function newLoadAs(type, hash, callback) {
    if (!callback) return newLoadAs.bind(null, type, hash);
    var list = pendingReqs[hash];
    if (list) {
      if (list.type !== type) callback(new Error("Type mismatch"));
      else list.push(callback);
      return;
    }
    list = pendingReqs[hash] = [callback];
    list.type = type;
    loadAs.call(repo, type, hash, function () {
      delete pendingReqs[hash];
      for (var i = 0, l = list.length; i < l; i++) {
        list[i].apply(this, arguments);
      }
    });
  }
};

},{}],12:[function(require,module,exports){
module.exports=require(4)
},{"/usr/local/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":16}],13:[function(require,module,exports){
/**
 * The buffer module from node.js, for the browser.
 *
 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * License:  MIT
 *
 * `npm install buffer`
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
   // Detect if browser supports Typed Arrays. Supported browsers are IE 10+,
   // Firefox 4+, Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+.
  if (typeof Uint8Array === 'undefined' || typeof ArrayBuffer === 'undefined')
    return false

  // Does the browser support adding properties to `Uint8Array` instances? If
  // not, then that's the same as no `Uint8Array` support. We need to be able to
  // add all the node Buffer API methods.
  // Relevant Firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var arr = new Uint8Array(0)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // Assume object is an array
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof Uint8Array === 'function' &&
      subject instanceof Uint8Array) {
    // Speed optimization -- use set if we're copying from a Uint8Array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  // copy!
  for (var i = 0; i < end - start; i++)
    target[i + target_start] = this[i + start]
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array === 'function') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment the Uint8Array *instance* (not the class!) with Buffer methods
 */
function augment (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0,
      'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

},{"base64-js":14,"ieee754":15}],14:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var ZERO   = '0'.charCodeAt(0)
	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	module.exports.toByteArray = b64ToByteArray
	module.exports.fromByteArray = uint8ToBase64
}())

},{}],15:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],16:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}]},{},[1])