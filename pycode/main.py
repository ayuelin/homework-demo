from mongodb_connect import get_db
import book_manager
import reader_manager
import borrow_manager
import stat_manager

def main():
    db, cli = get_db()
    print("=" * 50)
    print("✅ 程序启动，数据库连接成功！")
    b_cnt = db["books"].count_documents({})
    r_cnt = db["readers"].count_documents({})
    bo_cnt = db["borrows"].count_documents({})
    print(f"📚 books总数：{b_cnt}")
    print(f"👤 readers总数：{r_cnt}")
    print(f"📖 borrows总数：{bo_cnt}")
    print("=" * 50)

    while True:
        print("\n======= 图书管理系统菜单 =======")
        print("1. 添加图书")
        print("2. 查询图书（条件检索）")
        print("3. 更新图书信息")
        print("4. 删除图书")
        print("5. 添加读者")
        print("6. 借阅登记")
        print("7. 查询逾期记录")
        print("8. 聚合统计报表")
        print("0. 退出系统")
        opt = input("\n请输入功能编号：")
        if opt == "1":
            name = input("图书名称：")
            cat = input("分类：")
            price = float(input("价格："))
            stock = int(input("库存："))
            score = float(input("评分："))
            book_manager.add_book({"name": name, "category": cat, "price": price, "stock": stock, "score": score})
        elif opt == "2":
            res = book_manager.find_all_books()
            for x in res:
                print(x)
        elif opt == "3":
            bname = input("要更新的图书名称：")
            new_price = float(input("新价格："))
            book_manager.update_book({"name": bname}, {"price": new_price})
        elif opt == "4":
            bname = input("删除图书名称：")
            book_manager.del_book({"name": bname})
        elif opt == "5":
            rname = input("读者姓名：")
            col = input("学院：")
            reader_manager.add_reader({"name": rname, "college": col})
        elif opt == "6":
            bid = input("图书book_id：")
            rid = input("读者reader_id：")
            from datetime import datetime, timedelta
            now = datetime.now()
            due = now + timedelta(days=30)
            borrow_manager.borrow_add({
                "book_id": bid,
                "reader_id": rid,
                "borrow_time": now,
                "due_time": due,
                "return_time": None,
                "status": "借阅中"
            })
        elif opt == "7":
            data = borrow_manager.find_overdue()
            for i in data:
                print(i)
        elif opt == "8":
            stat_manager.stat_by_category()
            stat_manager.stat_borrow_year()
            stat_manager.hot_book_top()
        elif opt == "0":
            print("🔌 关闭数据库连接，程序退出...")
            cli.close()
            break
        else:
            print("❌ 输入错误，请重新选择！")

if __name__ == "__main__":
    main()
