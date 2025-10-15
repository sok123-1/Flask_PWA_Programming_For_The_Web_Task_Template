from flask import Flask, render_template

app = Flask(__name__)

# dashboard route (ensure this exists)
@app.route('/')
def dashboard():
    return render_template('dashboard.html')

# stats route
@app.route('/stats')
def stats():
    return render_template('stats.html')

# diary route (optional, used by templates)
@app.route('/diary')
def diary():
    return render_template('diary.html')

if __name__ == '__main__':
    app.run(debug=True)