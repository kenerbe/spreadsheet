var redis = require('redis')
var redisClient = redis.createClient({host : 'localhost', port : 6379})

var XLSX = require('xlsx')
var wb = XLSX.readFile('./TIN.xlsx')
var ws = wb.Sheets[wb.Props.SheetNames[0]]
var range = ws['!ref']
var cellArray = XLSX.utils.sheet_to_json(ws, {header:1})
var rowCount = cellArray.length
var colCount = cellArray[0].length

console.log('ref: ' + range)
console.log('Rows:' + rowCount + ', ' + 'Cols:' + colCount)

redisClient.on('ready',function() {
  console.log("Redis is ready - running locally")
})

redisClient.on('error',function() {
  console.log("Error with Redis - running locally")
  process.exit(1)
})

for (i = 0; i < rowCount; i++) {
  transRow = cellArray[i]
  inVal = transRow[0]
  outVal = transRow[1]
  redisClient.hmset('reqTrans', inVal, outVal, function(err, reply) {
    if (err) {
      console.log(err)
      process.exit(1)
    }
  })
  redisClient.hmset('resTrans', outVal, inVal, function(err, reply) {
    if (err) {
      console.log(err)
      process.exit(1)
    }
  })
  console.log(i + ':' + inVal + ":" + outVal)
}
process.exit(0)
