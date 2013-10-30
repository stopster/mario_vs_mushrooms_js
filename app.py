from flask import Flask
from flask import render_template
import os

app = Flask(__name__)

@app.route('/')
def index(name=None):
	return render_template('index.html', name=name)

if(__name__ == '__main__'):
	app.debug = True
	host = os.environ.get('IP') if os.environ.get('IP') != None else "127.0.0.1"
	port = os.environ.get('PORT') if os.environ.get('PORT') != None else 5000
	app.run(host, int(port))