const express = require("express");
const nodegit = require("nodegit");
const fs = require("fs");
const app = express();

app.get("/test", (req, res) => {
  res.send("<h1>It's working 🤗</h1>");
});

app.get("/:user/:repo/:branch", async (req, res) => {
  try {
    const username = req.params.user;
    const reponame = req.params.repo;
    const branch = req.params.branch;

    const repoPath = `/home/git/repositories/${username}/${reponame}`;

    const repo = await nodegit.Repository.open(repoPath);
    const commit = await repo.getBranchCommit(`refs/heads/${branch}`);
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

app.get("/:user/:repo/:branch/:entrypath(*)", async (req, res) => {
  try {
    const username = req.params.user;
    const reponame = req.params.repo;
    const entryPath = req.params?.entrypath;
    const branch = req.params.branch;

    const repoPath = `/home/git/repositories/${username}/${reponame}`;

    const repo = await nodegit.Repository.open(repoPath);
    const commit = await repo.getBranchCommit(`refs/heads/${branch}`);
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
      res.end();
    } else {
      var out = "not supported";
    }
  } catch (error) {
    console.log(error);
    res.send("invalid path");
  }
});

app.post("/:user/:sshKey", async (req, res) => {
  try {
    const username = req.params.user;
    const sshKey = req.params.sshKey;
    const writeStream = fs.createWriteStream(`/home/git/.gitolite/keydir/${username}.pub`);

    console.log("Username:", username);
    console.log("SSH Key:", sshKey);

    writeStream.write(sshKey.toString());
    writeStream.end();

    res.send("success");
  } catch (error) {
    console.log(error);
    res.send("error");
  }
});

app.post("/:user/repo", async (req, res) => {});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}`));
