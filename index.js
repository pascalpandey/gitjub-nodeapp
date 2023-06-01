const express = require("express");
const nodegit = require("nodegit");
const app = express();

app.get("/test", (req, res) => {
  res.send("<h1>It's working 🤗</h1>");
});

app.get("/:user/:repo", async (req, res) => {
  const username = req.params.user;
  const reponame = req.params.repo;

  const repoPath = `C:/${username}/${reponame}`;

  const repo = await nodegit.Repository.open(repoPath);
  const commit = await repo.getBranchCommit("refs/heads/main");
  const tree = await commit.getTree()

  const walker = tree.walk();
  const files = [];

  walker.on("entry", (entry) => {
    console.log(entry.path())
    files.push(entry.path());
  });

  walker.start()

  res.send(files)
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}`));
