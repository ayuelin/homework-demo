// ===================== 任务一：环境部署 ST-1 =====================
// 启动命令示例（终端执行，不是mongosh）
// mongod --dbpath /data/mongodb/library --port 27017
// 环境变量配置：把 mongod 所在bin目录加入PATH，新开终端验证
// mongod --version

// mongosh 内：
use library

// ===================== 任务二：建模 ST-2 =====================
// ST-2.1 创建普通集合
db.createCollection("books")
db.createCollection("readers")
db.createCollection("borrow_logs")
db.createCollection("category_stats")

// ST-2.2 三种特殊集合
// 1. 固定集合 book_logs：上限1MB(1048576)，最多1000条
db.createCollection("book_logs", {
  capped: true,
  size: 1048576,
  max: 1000
})

// 2. 时间序列集合 borrow_ts（时间字段 borrow_date，粒度 hours，过期2年 63072000秒）
db.createCollection("borrow_ts", {
  timeseries: {
    timeField: "borrow_date",
    granularity: "hours"
  },
  expireAfterSeconds: 63072000
})

// 3. 视图 book_in_stock：books 中 stock > 0
db.createView("book_in_stock", "books", [
  { $match: { stock: { $gt: 0 } } }
])

// 查看集合配置
db.getCollectionInfos()

// ST-2.3 导入数据后，插入示例
// insertOne 单条
db.books.insertOne({
  isbn: "9780000000001",
  title: "MongoDB入门",
  category: "计算机",
  price: 59,
  stock: 20,
  score: 4..5,
  publisher: "技术出版社",
  tags: ["数据库", "NoSQL"]
})
// insertMany批量示例
db.readers.insertMany([
  { reader_id: "R001", name: "张三", email: "zs@xxx.com" },
  { reader_id: "R002", name: "李四", email: null }
])
// 统计数量核对
db.books.countDocuments()
db.readers.countDocuments()
db.borrow_logs.countDocuments()

// ===================== 任务三：检索 ST-3  Q1~Q16 =====================
// Q1 $gt 定价80以上
db.books.find({ price: { $gt: 80 } })
db.books.countDocuments({ price: { $gt: 80 } })

// Q2 $lt 库存不足10
db.books.find({ stock: { $lt: 10 } })
db.books.countDocuments({ stock: { $lt: 10 } })

// Q3 $eq ISBN精确查找
db.books.find({ isbn: { $eq: "9780000000001" } })

// Q4 $eq null email为空
db.readers.find({ email: { $eq: null } })

// Q5 $ne 排除某个出版社
db.books.find({ publisher: { $ne: "某某出版社" } })
// 或者 $nin
db.books.find({ publisher: { $nin: ["某某出版社"] } })

// Q6 $in 计算机 或 经济管理
db.books.find({ category: { $in: ["计算机", "经济管理"] } })

// Q7 $and 评分4.0以上 && 计算机类
db.books.find({
  $and: [
    { score: { $gt: 4.0 } },
    { category: "计算机" }
  ]
})

// Q8 $or 评分低于3.5 或 库存0
db.books.find({
  $or: [
    { score: { $lt: 3.5 } },
    { stock: 0 }
  ]
})

// Q9 $regex 书名包含 Python
db.books.find({ title: { $regex: "Python" } })

// Q10 $all 同时带 "编程"、"入门"标签
db.books.find({ tags: { $all: ["编程", "入门"] } })

// Q11 $size 恰好3个标签
db.books.find({ tags: { $size: 3 } })

// Q12 $exists 存在 tags 字段
db.books.find({ tags: { $exists: true } })

// Q13 $type _id为字符串类型
db.books.find({ _id: { $type: "string" } })

// Q14 sort + limit 评分降序，前5
db.books.find().sort({ score: -1 }).limit(5)

// Q15 投影：书名、价格、评分，排除 _id
db.books.find({}, { _id: 0, title: 1, price: 1, score: 1 })

// Q16 distinct 获取所有类别清单
db.books.distinct("category")

// ========= 更新删除 U1-U4 D1-D3 =========
// U1 updateOne + $inc 库存减5
db.books.updateOne(
  { isbn: "9780000000001" },
  { $inc: { stock: -5 } }
)

// U2 updateMany + $mul 某类别全部9折
db.books.updateMany(
  { category: "经济管理" },
  { $mul: { price: 0.9 } }
)

// U3 $currentDate 新增字段记录更新时间
db.books.updateOne(
  { isbn: "9780000000001" },
  { $currentDate: { update_time: true } }
)

// U4 $unset 删除tags字段
db.books.updateOne(
  { isbn: "9780000000001" },
  { $unset: { tags: "" } }
)

// D1 deleteOne 删除一条归还记录
db.borrow_logs.deleteOne({ borrow_id: "B001" })

// D2 deleteMany 清理逾期记录（先预览）
db.borrow_logs.find({ overdue: true })
db.borrow_logs.deleteMany({ overdue: true })

// D3 replaceOne 替换文档，保留_id
db.readers.replaceOne(
  { reader_id: "R001" },
  { reader_id: "R001", name: "张三改", email: "new@xxx.com", college: "计算机学院" }
)

// ===================== 任务四 聚合A1-A9，索引I1-I15，权限S1-S3 =====================
// A1 $group + $sum + $avg 按类别统计数量、平均评分
db.books.aggregate([
  {
    $group: {
      _id: "$category",
      count: { $sum: 1 },
      avg_score: { $avg: "$score" }
    }
  }
])

// A2 group + $topN 出版社数量，取最多5家
db.books.aggregate([
  { $group: { _id: "$publisher", cnt: { $sum: 1 } } },
  { $sort: { cnt: -1 } },
  { $limit: 5 }
])

// A3 $sortByCount 找出文档最多类别
db.books.aggregate([
  { $sortByCount: "$category" }
])

// A4 sort + limit + project 评分最高3本，书名、借阅次数
db.books.aggregate([
  { $sort: { score: -1 } },
  { $limit: 3 },
  { $project: { _id: 0, title: 1, borrow_times: 1 } }
])

// A5 $multiply + $round 销售额=单价*借阅次数，保留2位
db.books.aggregate([
  {
    $project: {
      title: 1,
      sale: {
        $round: [ { $multiply: ["$price", "$borrow_times"] }, 2 ]
      }
    }
  }
])

// A6 $year + $dateToString 按年份统计借阅量
db.borrow_logs.aggregate([
  {
    $group: {
      _id: { $year: "$borrow_date" },
      total: { $sum: 1 }
    }
  },
  {
    $project: {
      year: { $dateToString: { format: "%Y", date: "$_id" } },
      count: "$total",
      _id: 0
    }
  }
])

// A7 group sort limit 读者借阅次数前5
db.borrow_logs.aggregate([
  { $group: { _id: "$reader_id", borrow_cnt: { $sum: 1 } } },
  { $sort: { borrow_cnt: -1 } },
  { $limit: 5 }
])

// A8 $lookup 关联读者与借阅流水
db.readers.aggregate([
  {
    $lookup: {
      from: "borrow_logs",
      localField: "reader_id",
      foreignField: "reader_id",
      as: "borrow_records"
    }
  }
])

// A9 $merge 将A1结果写入 category_stats
db.books.aggregate([
  {
    $group: {
      _id: "$category",
      count: { $sum: 1 },
      avg_score: { $avg: "$score" }
    }
  },
  { $merge: { into: "category_stats" } }
])

// ========= 索引 I1-I15 =========
// I1 isbn 唯一索引
db.books.createIndex({ isbn: 1 }, { unique: true })
// I2 title 单键索引
db.books.createIndex({ title: 1 })
// I3 category
db.books.createIndex({ category: 1 })
// I4 tags 多键索引（数组自动多键）
db.books.createIndex({ tags: 1 })
// I5 category + price 复合索引
db.books.createIndex({ category: 1, price: 1 })

// 查看索引
db.books.getIndexes()
// explain对比耗时
db.books.find({ category: "计算机" }).explain("executionStats")

// ========= 用户权限 S1-S3 =========
// S1 只读账号 libReader, role: read
db.createUser({
  user: "libReader",
  pwd: "123456",
  roles: [{ role: "read", db: "library" }]
})
// S2 读写账号 libWriter， readWrite + dbAdmin
db.createUser({
  user: "libWriter",
  pwd: "123456",
  roles: [
    { role: "readWrite", db: "library" },
    { role: "dbAdmin", db: "library" }
  ]
})
// S3 验证：重启 mongod，启动加 --auth
// mongod --dbpath /data/mongodb/library --port 27017 --auth
// mongosh -u libReader -p 123456 --authenticationDatabase library
// 只读账号：可find，不能 insert/update/delete

// ===================== 任务五 PyMongo Python代码 6个文件 =====================
// 文件1： mongodb_connect.py
/*
from pymongo import MongoClient

def get_db():
    client = MongoClient("mongodb://127.0.0.1:27017")
    return client["library"]
*/

// 文件2： book_manager.py
/*
from mongodb_connect import get_db
db = get_db()
coll = db["books"]

def insert_book(doc):
    return coll.insert_one(doc)
def insert_many_book(docs):
    return coll.insert_many(docs)
def find_book(query):
    return list(coll.find(query))
def find_one_book(q):
    return coll.find_one(q)
def update__book(q, upd):
    return coll.update_one(q, upd)
def del_one(q):
    return coll.delete_one(q)
def del_many(q):
    return coll.delete_many(q)
*/

// 文件3： reader_manager.py
/*
from mongodb_connect import get_db
db = get_db()
coll = db["readers"]

def find_reader(q):
    return list(coll.find(q))
def count_reader(q):
    return coll.count_documents(q)
def distinct_reader(field):
    return coll.distinct(field)
*/

// 文件4： borrow_manager.py
/*
from mongodb_connect import get_db
db = get_db()
coll = db["borrow_logs"]

def borrow_add(doc):
    return coll.insert_one(doc)
def borrow_update(q, upd):
    return coll.update_many(q, upd)
def find_borrow(q):
    return list(coll.find(q))
*/

// 文件5： stat_manager.py
/*
from mongodb_connect import get_db
db = get_db()
coll = db["books"]

def stat_category():
    pipe = [
        {"$group":{"_id":"$category","total":{"$sum":1}, "avg_score":{"$avg":"$score"}}}
    ]
    return list(coll.aggregate(pipe))
*/

// 文件6： main.py（菜单主程序）
/*
from book_manager import *
from reader_manager import *
from borrow_manager import *
from stat_manager import stat_category

def main():
    while True:
        print("\n=====图书管理系统=====")
        print("1 查询图书  2 添加图书  3 更新库存  4 删除图书")
        print("5 读者查询  6 借阅登记  7 分类统计  8 退出")
        opt = input("输入选项：")
        if opt == "8":
            print("退出程序")
            break
        elif opt == "7":
            res = stat_category()
            for r in res:
                print(r)
        # 其余功能自行补齐
if __name__ == "__main__":
    main()
*/

