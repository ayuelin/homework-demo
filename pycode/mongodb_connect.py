from pymongo import MongoClient

HOST = "123.45.67.89"
PORT = 27017
DB_NAME = "library"
USER = "libWriter"
PWD = "123"

def get_db():
    client = MongoClient(HOST, PORT, username=USER, password=PWD, authSource="admin")
    db = client[DB_NAME]
    return db, client

if __name__ == "__main__":
    db, cli = get_db()
    print("✅ 数据库连接成功")
    cli.close()
