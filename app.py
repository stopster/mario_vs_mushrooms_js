from flask import Flask
from flask import render_template
import os

app = Flask(__name__)

@app.route('/')
def index(name=None):
	return render_template('index.html', name=name)

if(__name__ == '__main__'):
	app.debug = True
	print os.environ.get('IP')
	app.run(os.environ.get('IP'), int(os.environ.get('PORT')))
