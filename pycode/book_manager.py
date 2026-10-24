from mongodb_connect import get_db

db, client = get_db()
coll = db["books"]

def add_book(book: dict):
    res = coll.insert_one(book)
    print(f"✅ 新增图书，影响文档数：{1 if res.acknowledged else 0}")
    return res

def add_books(book_list: list):
    res = coll.insert_many(book_list)
    print(f"✅ 批量新增图书，影响文档数：{len(res.inserted_ids)}")
    return res

def find_all_books(filter_dict=None):
    filter_dict = filter_dict or {}
    cur = coll.find(filter_dict)
    res = list(cur)
    if not res:
        print("⚠️ 查询无结果")
    return res

def find_one_book(filter_dict):
    doc = coll.find_one(filter_dict)
    if not doc:
        print("⚠️ 查询无结果")
    return doc

def update_book(filter_dict, new_data: dict):
    res = coll.update_one(filter_dict, {"$set": new_data})
    print(f"✅ 更新图书，匹配：{res.matched_count}，修改：{res.modified_count}")
    return res

def del_book(filter_dict):
    res = coll.delete_one(filter_dict)
    print(f"✅ 删除图书，删除数量：{res.deleted_count}")
    return res

def del_books(filter_dict):
    res = coll.delete_many(filter_dict)
    print(f"✅ 批量删除图书，删除数量：{res.deleted_count}")
    return res

def sort_by_score():
    cur = coll.find().sort("score", -1)
    return list(cur)
