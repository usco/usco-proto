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
        /*var treeHash = yield repo.createTree(updates);

        var commitHash = yield repo.saveAs("commit", {
          tree: treeHash,
          author: {
            name: "bla bla",
            email: "kaosat.dev@gmail.com"
          },
          parent: headHash,
          message: "Change README.md to be all uppercase using js-github"
        });*/
        
        
        
        
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
