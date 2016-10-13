var Crawler = require("crawler")
var url = require('url')
var fs = require('fs')

// 通过设置forceUTF8和incomingEncoding处理中文编码页面的问题
var c = new Crawler({
    maxConnections: 10,
    forceUTF8: true,
    incomingEncoding: 'gb2312'
})

// 引入common模块
const common = require('./common');
const bookTypes = common.bookTypes;

// 根据common模块中的配置文件 去当当网抓取数据
bookTypes.forEach(function(item){
  loadData(item.base_url,item.id,item.page_count);
})

/**
 * 获取数据 使用了递归和闭包
 * @param  {[type]} baseUrl   [用于拼接分页的基础地址]
 * @param  {[type]} type      [分类的id]
 * @param  {[type]} pageCount [取数据的总页数]
 * @return {[type]}           [返回结果]
 */
function loadData(baseUrl,type,pageCount){
  var arrBook = []
  // var page = 1
  // getData('http://bang.dangdang.com/books/newhotsales/01.41.00.00.00.00-24hours-0-0-1-', 1)
  getData(baseUrl,1);
  function getData(url, page) {
      c.queue([{
          uri: url + page,
          callback: (err, result, $) => {
              console.log(result.uri)
                  //console.log($('title').text())
              $('.bang_list li').each((index, li) => {
                  var obj = decodeBookData($(li));
                  arrBook.push(obj)
              })
              if (page >= pageCount) {
                  fs.writeFileSync(`./data/book_${type}.json`, JSON.stringify(arrBook))
                  console.log('获取数据成功')
              } else {
                  getData(url, page + 1)
              }
          }
      }])
  }
}



function decodeBookData($item) {
    var obj = {}
    obj.title = $item.find('.name').text()
    obj.img = $item.find('.pic img').attr('src')
    obj.author = $item.find('.publisher_info').eq(0).text()
    obj.publister = $item.find('.publisher_info').eq(1).find('a').text()
    obj.publist_time = $item.find('.publisher_info').eq(1).find('span').text()
    obj.link = $item.find('.pic a').attr('href')
    obj.price = $item.find('.price .price_n').text()
    return obj
}
