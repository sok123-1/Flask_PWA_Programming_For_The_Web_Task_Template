from flask import Flask, render_template, request, redirect, url_for, flash, session, g
import sqlite3
import os
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET", "change-this-in-prod")

DATABASE = os.path.join(os.path.dirname(__file__), "database.db")

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(exception):
    db = g.pop("db", None)
    if db is not None:
        db.close()

def init_db():
    db = get_db()
    db.execute("""
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    """)
    db.commit()

# Replace the @app.before_first_request usage with an explicit init at startup:
# (some Flask builds/environments may not expose before_first_request)
with app.app_context():
    init_db()

@app.route("/")
def index():
    # adjust to your app; this redirects to login page
    return redirect(url_for("login_page"))

@app.route("/signup", methods=["POST"])
def signup():
    name = request.form.get("name", "").strip()
    email = request.form.get("email", "").strip().lower()
    password = request.form.get("password", "")
    confirm = request.form.get("confirm_password", "")

    if not name or not email or not password:
        flash(("error", "Please fill all required fields."))
        return redirect(url_for("login_page"))

    if password != confirm:
        flash(("error", "Passwords do not match."))
        return redirect(url_for("login_page"))

    db = get_db()
    try:
        hashed = generate_password_hash(password)
        db.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
                   (name, email, hashed))
        db.commit()
    except sqlite3.IntegrityError:
        flash(("error", "An account with that email already exists."))
        return redirect(url_for("login_page"))

    flash(("success", "Account created. You can now sign in."))
    return redirect(url_for("login_page"))

@app.route("/login", methods=["GET", "POST"])
def login_page():
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")

        db = get_db()
        user = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        if user and check_password_hash(user["password"], password):
            session.clear()
            session["user_id"] = user["id"]
            session["user_name"] = user["name"]
            flash(("success", f"Welcome back, {user['name']}"))
            return redirect(url_for("dashboard"))
        else:
            flash(("error", "Invalid email or password."))
            return redirect(url_for("login_page"))

    # GET -> render the login / signup template
    return render_template("login.html")

@app.route("/logout")
def logout():
    session.clear()
    flash(("success", "You have been logged out."))
    return redirect(url_for("login_page"))

@app.route("/dashboard")
def dashboard():
    if "user_id" not in session:
        flash(("error", "Please sign in to access the dashboard."))
        return redirect(url_for("login_page"))
    # pass user info to template if needed
    return render_template("dashboard.html", user_name=session.get("user_name"))

@app.route("/stats")
def stats():
    if "user_id" not in session:
        flash(("error", "Please sign in to access stats."))
        return redirect(url_for("login_page"))
    return render_template("stats.html", user_name=session.get("user_name"))

@app.route("/diary")
def diary():
    if "user_id" not in session:
        flash(("error", "Please sign in to access the diary."))
        return redirect(url_for("login_page"))
    return render_template("diary.html", user_name=session.get("user_name"))

@app.route('/habits', methods=['GET', 'POST'])
def habits():
    if "user_id" not in session:
        flash(("error", "Please sign in to access habits."))
        return redirect(url_for("login_page"))
    habits = []
    if request.method == 'POST':
        habit_name = request.form.get('habit_name')
        if habit_name:
            habits.append(habit_name)
    return render_template('habits.html', habits=habits)

@app.route('/sign-in', methods=['GET', 'POST'])
def sign_in():
    return render_template('sign-in.html')

@app.route('/streaks', methods=['GET', 'POST'])
def streaks():
    return render_template(
        'streaks.html',
        image_url="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80"
    )

@app.context_processor
def inject_logo():
    return dict(logo_url='/static/icons/logo.png')

if __name__ == "__main__":
    app.run(debug=True)








