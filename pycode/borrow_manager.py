from mongodb_connect import get_db
from datetime import datetime

db, client = get_db()
coll = db["borrows"]

def borrow_add(record: dict):
    res = coll.insert_one(record)
    print(f"✅ 借阅登记成功，影响文档数：{1 if res.acknowledged else 0}")
    return res

def back_book(borrow_id, return_time):
    res = coll.update_many(
        {"_id": borrow_id},
        {"$set": {"return_time": return_time, "status": "已归还"}}
    )
    print(f"✅ 归还处理，匹配：{res.matched_count}，修改：{res.modified_count}")
    return res

def find_overdue():
    now = datetime.now()
    cur = coll.find({
        "due_time": {"$lt": now},
        "return_time": None
    })
    data = list(cur)
    if not data:
        print("✅ 暂无逾期记录")
    return data
