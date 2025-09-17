from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from models import db, Habit

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///habits.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

@app.route('/')
def index():
    habits = Habit.query.all()
    return render_template('index.html', habits=habits)

@app.route('/add_habit', methods=['POST'])
def add_habit():
    habit_name = request.form.get('habit_name')
    if habit_name:
        new_habit = Habit(name=habit_name)
        db.session.add(new_habit)
        db.session.commit()
    return redirect(url_for('index'))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)