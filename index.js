const express = require('express')
const app = express()

app.get("/test", (req, res) => {
  res.send("<h1>It's working 🤗</h1>")
})

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Listening on port ${port}`))