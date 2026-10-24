from mongodb_connect import get_db

db, client = get_db()
coll = db["readers"]

def add_reader(reader: dict):
    res = coll.insert_one(reader)
    print(f"✅ 添加读者，影响文档数：{1 if res.acknowledged else 0}")
    return res

def find_readers(filter_dict=None):
    filter_dict = filter_dict or {}
    cur = coll.find(filter_dict)
    data = list(cur)
    if not data:
        print("⚠️ 查询无结果")
    return data

def count_reader(filter_dict=None):
    filter_dict = filter_dict or {}
    cnt = coll.count_documents(filter_dict)
    print(f"✅ 读者数量：{cnt}")
    return cnt

def distinct_college():
    colleges = coll.distinct("college")
    print("✅ 学院列表：", colleges)
    return colleges
