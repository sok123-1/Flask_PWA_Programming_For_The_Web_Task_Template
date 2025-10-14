from flask import Flask, render_template, request, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Needed for session
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///habits.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Habit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    streaks = db.relationship('Streak', backref='habit', lazy=True)

class Streak(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    habit_id = db.Column(db.Integer, db.ForeignKey('habit.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        if email and password:
            session['logged_in'] = True
            return redirect(url_for('index'))
        else:
            return render_template('login.html', error="Please enter email and password.")
    return render_template('login.html')

@app.route('/', methods=['GET'])
def index():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('index.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/habits', methods=['GET', 'POST'])
def habits():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    if request.method == 'POST':
        habit_name = request.form.get('habit_name')
        if habit_name:
            new_habit = Habit(name=habit_name)
            db.session.add(new_habit)
            db.session.commit()
    habits = Habit.query.all()
    return render_template('habits.html', habits=habits)

@app.route('/streaks', methods=['GET', 'POST'])
def streaks():
    if request.method == 'POST':
        habit_id = request.form.get('habit_id')
        new_streak = Streak(habit_id=habit_id, date=datetime.utcnow())
        db.session.add(new_streak)
        db.session.commit()
    all_streaks = Streak.query.all()
    return render_template(
        'streaks.html',
        streaks=all_streaks,
        image_url="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80"
    )

@app.context_processor
def inject_logo():
    return dict(logo_url='/static/icons/logo.png')

if __name__ == '__main__':
    db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)