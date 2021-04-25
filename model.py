from flask import Flask, request
import psycopg2

app = Flask(__name__)


@app.route('/flask', methods=['POST'])
def index():
    conn = psycopg2.connect(database="chatbot", user="postgres",
                            password="srushti6", host="127.0.0.1", port="5432")
    print("Opened database successfully")
    user = request.form['key']
    print(user)
    # print("hey", request.args)
    # user = request.args.get('key')
    # print(user)
    return "Flask server"


if __name__ == "__main__":
    app.run(port=5000, debug=True)
