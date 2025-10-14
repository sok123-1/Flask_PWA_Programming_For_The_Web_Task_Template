# Flask Habits App

## Overview
The Flask Habits App is a web application designed to help users track their habits and monitor their progress through streaks. It utilizes Flask as the web framework and SQLAlchemy for database management.

## Features
- User authentication with login and sign-in functionality.
- Habit tracking with the ability to add and manage habits.
- Streak tracking to visualize progress over time.
- Responsive design with a user-friendly interface.

## Project Structure
```
flask-habits-app
├── app
│   ├── __init__.py          # Initializes the Flask application and sets up the database connection.
│   ├── main.py              # Contains the main application logic and route definitions.
│   ├── models.py            # Defines the database models for habits and streaks.
│   ├── db.py                # Handles database setup and configuration.
│   ├── routes.py            # Contains route handlers for various endpoints.
│   ├── templates            # Directory for HTML templates.
│   │   ├── index.html       # Main template for the index page.
│   │   ├── login.html       # Template for the login page.
│   │   ├── habits.html      # Template for displaying and managing habits.
│   │   ├── streaks.html     # Template for displaying streaks associated with habits.
│   │   └── sign-in.html     # Template for the sign-in page.
│   └── static               # Directory for static files (CSS, JS).
│       ├── css
│       │   └── styles.css    # CSS styles for the application.
│       └── js
│           └── app.js        # JavaScript code for client-side functionality.
├── migrations                # Directory for migration scripts.
├── requirements.txt          # Lists the dependencies required for the project.
├── config.py                # Configuration settings for the Flask application.
└── README.md                # Documentation for the project.
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd flask-habits-app
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

4. Set up the database:
   - Configure your database settings in `config.py`.
   - Run migrations to set up the database schema.

## Usage
1. Start the Flask application:
   ```
   python app/main.py
   ```

2. Open your web browser and navigate to `http://localhost:5000`.

3. Use the application to log in, track your habits, and monitor your streaks.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.