from flask import Flask, request
import psycopg2

app = Flask(__name__)


@app.route('/flask', methods=['POST'])
def index():
    conn = psycopg2.connect(database="chatbot", user="postgres",
                            password="srushti6", host="127.0.0.1", port="5432")
    print("Opened database successfully")
    db_cursor = conn.cursor()
    s = 'SELECT * FROM "Admin_query_table"'
    try:
        # Execute the SQL
        db_cursor.execute(s)
        # Retrieve records from Postgres into a Python List
        list_users = db_cursor.fetchall()
    except psycopg2.Error as e:
        t_message = "Database error: " + e + "/n SQL: " + s
        return "Error"

    # Loop through the resulting list and print each user name, along with a line break:
    for i in range(len(list_users)):
        print(list_users[i])

    # Close the database cursor and connection
    db_cursor.close()
    conn.close()

    user = request.form['key']
    print(user)
    # print("hey", request.args)
    # user = request.args.get('key')
    # print(user)
    return "Me"


if __name__ == "__main__":
    app.run(port=5000, debug=True)
