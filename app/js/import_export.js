const { remote, BrowserWindow }= require('electron')
const dialog = remote.dialog
const fs = require('fs')
const request = require('./request')
const setFavorite = require('./favorite').setFavorite

module.exports = {
  import: () => {
    var filePath = dialog.showOpenDialogSync(BrowserWindow, {
      properties: ["openFile"],
      filters: [{ name: "OPML", extensions: ["opml"] }],
    })[0];

    if (filePath === undefined) {
      return;
    }

    var data = fs.readFileSync(filePath, { encoding: "utf-8", flag: "r" });

    parser = new DOMParser()
    xmlDoc = parser.parseFromString(data, "text/xml")

    var promises = []
    Array.from(xmlDoc.getElementsByTagName("outline")).forEach((element) => {
      var feedUrl = element.getAttribute("xmlUrl")
      
      if (feedUrl) {
        promises.push(request.makeFeedRssRequest(feedUrl))        
      }
    });

    Promise.allSettled(promises).then(results => {
      artist = ""
      collection = ""
      artwork = ""
      url = ""
      results.forEach(result => {
        if (result.status === "fulfilled") {
          podcast = result.value
          artist = podcast?.items?.[0]?.itunes_author ?? podcast.title
          collection = podcast.title
          artwork = podcast.image
          url = podcast.link
          if (url) {
            setFavorite(null, artist, collection, artwork, artwork, artwork, url)
          }
        } else if (result.status === "rejected") {
          console.error(`Failed to add ${result.reason.config.link} due to response ${result.reason.response.status}: ${result.reason.response.statusText}`)
        }
      })

      
    })
  },

  export: () => {
    var filePath = dialog.showSaveDialogSync(BrowserWindow, {
      filters: [{ name: "OPML", extensions: ["opml"] }]
    });

    if (filePath === undefined) {
      return;
    }

    //var podcasts = fs.readFileSync(filePath, { encoding: "utf-8", flag: "r" });
    JsonContent = JSON.parse(fs.readFileSync(saveFilePath, "utf-8"))

    var rootString = `<opml version="1.0"></opml>`
    var parser = new DOMParser()
    var xmlDoc = parser.parseFromString(rootString, "text/xml")
    var root = xmlDoc.getElementsByTagName("opml")[0]
    var head = xmlDoc.createElement("head")
    root.appendChild(head)
    var title = xmlDoc.createElement("title")
    title.innerHTML = "Poddycast Export"
    var dateCreated = xmlDoc.createElement("dateCreated")
    dateCreated.innerHTML = new Date(Date.now())
    var dateModified = xmlDoc.createElement("dateModified")
    dateModified.innerHTML = new Date(Date.now())
    head.appendChild(title)
    head.appendChild(dateCreated)
    head.appendChild(dateModified)
    var body = xmlDoc.createElement("body")
    root.appendChild(body)

    

    JsonContent.forEach(element => {
      var type = xmlDoc.createAttribute("type")
      type.nodeValue = "rss"
      var text = xmlDoc.createAttribute("text")
      var title = xmlDoc.createAttribute("title")
      var xmlUrl = xmlDoc.createAttribute("xmlUrl")
      var outline = xmlDoc.createElement("outline")
      text.nodeValue = element.collectionName
      title.nodeValue = element.collectionName
      xmlUrl.nodeValue = element.feedUrl
      outline.setAttributeNode(type)
      outline.setAttributeNode(text)
      outline.setAttributeNode(title)
      outline.setAttributeNode(xmlUrl)
      body.appendChild(outline)
    });

    var serializer = new XMLSerializer()
    var xmlString = serializer.serializeToString(xmlDoc)
    fs.writeFileSync(filePath, xmlString)
    fs.close()
  },
};