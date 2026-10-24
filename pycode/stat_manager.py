from mongodb_connect import get_db

db, client = get_db()
book_coll = db["books"]
borrow_coll = db["borrows"]

def stat_by_category():
    pipe = [
        {
            "$group": {
                "_id": "$category",
                "total_stock": {"$sum": "$stock"},
                "avg_price": {"$avg": "$price"},
                "book_count": {"$sum": 1}
            }
        },
        {"$sort": {"total_stock": -1}}
    ]
    res = list(book_coll.aggregate(pipe))
    print("\n==== 图书分类统计 ====")
    for item in res:
        print(item)
    return res

def stat_borrow_year():
    pipe = [
        {
            "$group": {
                "_id": {"$year": "$borrow_time"},
                "borrow_cnt": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    res = list(borrow_coll.aggregate(pipe))
    print("\n==== 借阅趋势（按年份） ====")
    for d in res:
        print(f"{d['_id']}年：借阅 {d['borrow_cnt']} 次")
    return res

def hot_book_top():
    pipe = [
        {
            "$group": {
                "_id": "$book_id",
                "borrow_times": {"$sum": 1}
            }
        },
        {"$sort": {"borrow_times": -1}},
        {"$limit": 1}
    ]
    res = list(borrow_coll.aggregate(pipe))
    print("\n==== 畅销榜 ====")
    if res:
        print(res[0])
    else:
        print("暂无借阅数据")
    return res
