const express = require("express");
const nodegit = require("nodegit");
const app = express();

app.get("/test", (req, res) => {
  res.send("<h1>It's working 🤗</h1>");
});

app.get("/:user/:repo", async (req, res) => {
  try {
    const username = req.params.user;
    const reponame = req.params.repo;

    const repoPath = `../repositories/${username}/${reponame}`;

    const repo = await nodegit.Repository.open(repoPath);
    const commit = await repo.getBranchCommit("refs/heads/main");
    const tree = await commit.getTree();

    const entries = tree.entries();
    var out = [];

    entries.forEach((entry) => {
      const path = entry.path();
      const isDirectory = entry.isDirectory();

      out.push({ path, isDirectory });
    });

    res.send(out);
  } catch (error) {
    console.log(error);
    res.send("invalid path");
  }
});

app.get("/:user/:repo/:entrypath(*)", async (req, res) => {
  try {
    const username = req.params.user;
    const reponame = req.params.repo;
    const entryPath = req.params?.entrypath;

    const repoPath = `../repositories/${username}/${reponame}`;

    const repo = await nodegit.Repository.open(repoPath);
    const commit = await repo.getBranchCommit("refs/heads/main");
    const entry = await commit.getEntry(entryPath);

    if (entry.isTree()) {
      const tree = await entry.getTree();
      const entries = tree.entries();
      var out = [];

      entries.forEach((entry) => {
        const path = entry.path();
        const isDirectory = entry.isDirectory();

        out.push({ path, isDirectory });
      });

      res.send(out);
    } else if (entry.isFile()) {
      const fileBlob = await entry.getBlob();
      var out = fileBlob.toString();

      res.write(out);
      res.end()
    } else {
      var out = "not supported";
    }
  } catch (error) {
    console.log(error);
    res.send("invalid path");
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}`));
