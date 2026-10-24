# MongoDB 图书馆管理实验
仓库：mongodb-library-experiment

## 实验内容
任务1：MongoDB服务部署、环境变量
任务2：建库、普通集合、固定集合、时序集合、视图、数据导入
任务3：查询、更新、删除（Q1-Q16、U1-U4、D1-D3）
任务4：聚合管道、索引、用户权限
任务5：PyMongo Python应用开发
任务6：Compass图形化验证、数据导出

## 文件说明
- scripts/init.js：mongosh执行脚本
- pycode/：Python pymongo源代码
- screenshots：所有执行截图
- dataset：原始导入数据

启动步骤：
1. mongod --dbpath /data/mongodb/library --port 27017
2. mongosh
3. use library
4. 执行脚本

