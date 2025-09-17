from flask_sqlalchemy import SQLAlchemy
from datetime import date
from flask import Flask, request, redirect, url_for, session, render_template
from models import db, Streak

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///habitly.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/streaks', methods=['GET', 'POST'])
def streaks():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    if request.method == 'POST':
        habit_name = request.form.get('habit_name')
        if habit_name:
            streak = Streak.query.filter_by(habit_name=habit_name).first()
            if streak:
                streak.streak_count += 1
                streak.last_completed = date.today()
            else:
                streak = Streak(habit_name=habit_name, streak_count=1, last_completed=date.today())
                db.session.add(streak)
            db.session.commit()
    streaks = Streak.query.all()
    return render_template('streaks.html', streaks=streaks)

db = SQLAlchemy()

class Streak(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    habit_name = db.Column(db.String(100), nullable=False)
    streak_count = db.Column(db.Integer, default=0)
    last_completed = db.Column(db.Date)

<!-- ...existing code... -->
<div class="card">
  <h2>🔥 Your Habit Streaks</h2>
  <img src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80"
       alt="Streaks motivation"
       style="width:100%;max-width:400px;border-radius:1rem;box-shadow:0 2px 16px rgba(251,191,36,0.08);margin:2rem auto;display:block;">
  <ul>
    {% for streak in streaks %}
      <li>{{ streak.habit_name }}: {{ streak.streak_count }} days (Last: {{ streak.last_completed }})</li>
    {% endfor %}
  </ul>
</div>
<!-- ...existing code... -->