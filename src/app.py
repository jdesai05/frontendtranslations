import mysql.connector

try:
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="quotation",
        port=3309  # Correct port
    )
    cursor = db.cursor()
    cursor.execute("SELECT DATABASE();")
    result = cursor.fetchone()
    
    print(f"✅ Connected to Database: {result[0]}")
    
    cursor.close()
    db.close()
except mysql.connector.Error as e:
    print(f"❌ Connection failed: {e}")
