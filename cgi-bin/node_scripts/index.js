#!node.exe

try {
  console.log('Status: 200 Ok')
  console.log('')


  var querystring = require('querystring');
  var fileSys = require('node:fs');
  var path = require('path');

  // console.log('querystr: ', process.env.QUERY_STRING)
  // console.log('\n')

  var dirRequestName = querystring.parse(process.env.QUERY_STRING).dir
 // console.log("\n", "dir: ", dirRequestName)

  var fileNameRequest = querystring.parse(process.env.QUERY_STRING).filename
//  console.log("\n","fileName: ", fileNameRequest)

  var docRoot = process.env.DOCUMENT_ROOT;

  // console.log('docRoot: ', docRoot)
  // console.log('\n')

  var localDir = docRoot + '/' + dirRequestName

  // console.log('localDir: ', localDir)
  // console.log('\n')

  var currentDir = "";

  var bodyBefore = "<head> \
  <title>Nathan Crews Node.js Portfolio</title> \
  <meta charset='UTF-8' /> \
  <link rel='stylesheet' href='../styles/styles.css' />   \
</head> \
    <button class=' btn btn-primary' type='submit' hx-get='cgi-bin/node_scripts/index.js?dir=uploads/las' hx-trigger='click' \
    hx-target='#file_results'>Refresh Now</button>  \
  <div style='width:50px; height:50px; align-items: center; vertical-align: center; margin: 0px; padding:0px;'> \
    <img id='loading' src='../images/loading.gif' class='htmx-indicator' width='48' height='48' alt='Loading...' /> \
  </div> \
  <table> \
    <tr> \
      <td width='50%'> \
        <div id='file_results' class='ImageResultPanel' title='file_results'> "

  var bodyAfter = "</div> \
      </td> \
      <td width='50%'> \
        <div id='results' title='selection_results'> \
        </div> \
      </td> \
    </tr> \
  </table>"

  var head = "<head> <link rel='stylesheet' href='../styles/styles.css'/></head>"
  
  console.log(head)
  
  fileSys.readdirSync(localDir).map(entryName => {
    if (fileSys.lstatSync(path.join(localDir, entryName)).isDirectory()) {
      innerDir = path.join(localDir, entryName)
      console.log("<label class='directory-name'>", dirRequestName + "/" + entryName)
      console.log("</label><ul class='nolabel'>")

      currentDir = dirRequestName + "/" + entryName
      //console.log("currentDir = ", currentDir)

      fileSys.readdirSync(innerDir).map(fileName => {
        if (fileSys.lstatSync(path.join(innerDir, fileName)).isFile()) {
          var localNamePath = path.join(currentDir, fileName)
          //console.log("localNamePath=", localNamePath)  
          if (path.extname(fileName) === ".las" || path.extname(fileName) === ".laz" ||
            path.extname(fileName) === ".LAS" || path.extname(fileName) === ".LAZ" ||
            path.extname(fileName) === ".gltf" || path.extname(fileName) === ".glb") {

            console.log("<li><a hx-trigger='mouseover' hx-get='cgi-bin/ncimagegen_cgi.exe?file=")
            console.log(fileName)
            console.log("' hx-target='#results' hx-indicator='#loading' ")
            console.log("href='", localNamePath, "'>", fileName, "</a></li>")
          }
          if (path.extname(fileName) === ".xml") {
            console.log("<li><a hx-trigger='mouseover' hx-get='cgi-bin/lxml2gltf_cgi.exe?file=")
            console.log(fileName)
            console.log("' hx-target='#results' hx-indicator='#loading' ")
            console.log("href='")
            console.log(localNamePath)
            console.log("'>")
            console.log(fileName)
            console.log("</a></li>")
          }
        }
      })

      console.log("</ul>")
    }
  });

  //   console.log(bodyAfter)

}
catch (err) {
  console.log("Error: ", err)
}


