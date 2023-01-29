function query_paper(title, query) {
    search_url = "https://api.semanticscholar.org/graph/v1/paper/search?query=" + title + "&fields=title,authors";
    data = UrlFetchApp.fetch(search_url).getContentText()
    var json = JSON.parse(data);
    var id = json["data"][0]["paperId"];

    if(query=="affiliation") {
      author_url = "https://api.semanticscholar.org/graph/v1/paper/" + id + "/authors?fields=affiliations";
      // var xmlHttp = new XMLHttpRequest();
      data = UrlFetchApp.fetch(author_url).getContentText()
      // console.log(author_url)
      var json = JSON.parse(data);
      var authors = json["data"];
      // console.log(authors)
      var affiliations = [];
      for (var i = 0; i < authors.length; i++) {
          var author = authors[i];
          var aff = author["affiliations"];
          for (var j = 0; j < aff.length; j++) {
              var affiliation = aff[j];
              if (affiliations.indexOf(affiliation) == -1) {
                  affiliations.push(affiliation);
              }
          }
      }
      // get the most frequent affiliation
      var mostFrequent = 0;
      var count = 0;
      var item = "N/A";
      for (var i = 0; i < affiliations.length; i++) {
          for (var j = i; j < affiliations.length; j++) {
              if (affiliations[i] == affiliations[j])
                  count++;
              if (mostFrequent < count) {
                  mostFrequent = count;
                  item = affiliations[i];
              }
          }
          count = 0;
      }
      return item;
    }
    else {
      paper_url = "https://api.semanticscholar.org/graph/v1/paper/" + id + "?fields=" + query;
      data = UrlFetchApp.fetch(paper_url).getContentText()
      var json = JSON.parse(data);
      res = json[query];
      if(query=="tldr"){
        res = res["text"];
      }
      return res
    }
}
function get_paper_data(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  const range = e.range;
  row = range.getRow()
  column = range.getColumn()
  if(column != 1){
    return
  }
  var sheet = ss.getSheets()[0];
  keys = ["publicationDate", "venue", "affiliation", "url", "tldr"]
  title = range.getValue()
  for (var i = 0; i < 5; i ++) {
    var cell = sheet.getRange(row, column + i + 1);
    try{
      result = query_paper(title, keys[i])
      cell.setValue(result)
    }
    catch{
      cell.setValue("error");
    }
  }
}
