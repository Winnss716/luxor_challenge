# Luxor_challenege
Shane Winn Luxor Challenge Submission

Welcome to my **Luxor Challenge** repository! This project is split into multiple branches, each containing a specific component of the application:

- **luxor_mobile_app**: Mobile application frontend.
- **luxor_webapp**: Web application frontend.
- **luxor_server**: Backend server logic.
- **luxor_database**: Database schema and setup.

Each branch includes basic documentation in its respective README file, detailing how to set up and run that component.

## Cloning and Switching Branches

To get started, clone the repository and navigate between branches using the following Git commands:
** You may need to clone the server seperately to be able to run the server and the Mobile and Web Application Simulataneously **

``bash
# Clone the repository
git clone https://github.com/<your-username>/luxor_challenge.git
cd luxor_challenge

# List all available branches
git branch -r

# Switch to a specific branch (e.g., luxor_mobile_app)
git checkout luxor_mobile_app

Repeat the git checkout <branch-name> command to switch to other branches like luxor_webapp, luxor_server, or luxor_database.

Database Setup
The database component (luxor_database) requires a PostgreSQL database. You will need to:

Download the database file provided in the luxor_database branch.
Restore it to a PostgreSQL instance. Instructions for restoration are included in the luxor_database README.
This setup ensures the simplest integration with the other components.

How would you monitor the application to ensure it is running smoothly?
Monitoring the Application
The application collects console logs, warnings, and errors to monitor its health. These are reported to:

Sysadmin Team: Receives immediate notifications for critical errors or warnings to ensure uptime and performance.
Development Team: Continuously reviews logs for QA/QC, addressing bugs and optimizing code based on reported issues.
Scalability and Performance
To ensure the application scales effectively, the following strategies are proposed:

How would you address scalability and performance?
Database Scalability:
The current PostgreSQL database handles initial data transfer needs. If the volume of bids per hour or data transfer grows significantly, alternative backend solutions (e.g., NoSQL databases or distributed systems) will be explored for migration to support higher throughput and reliability.
Frontend Scalability:
The frontend (mobile and web apps) is designed to be easily updated with dynamic components. Buttons and functions avoid hardcoding to allow flexibility.
Code is structured to be simple, readable, and reproducible, making it easier to troubleshoot errors and maintain over time.
Trade-offs and Future Improvements
Due to time constraints, some features were not implemented but would be prioritized with additional resources:

Trade-offs you had to choose when doing this challenge (the things you would do different with more time and resources)
Enhanced Database Functionality:
Track the listing price at the time of each bid submission to analyze price differentials as the market evolves and collections are updated.
Responsive Graphing System:
Implement a dynamic graphing system for users and owners to visualize price trends, scalable by hour, day, month, year, or lifetime.
These additions would provide deeper insights into market dynamics and improve user experience.

Running the Code
Refer to the README files in each branch (luxor_mobile_app, luxor_webapp, luxor_server, luxor_database) for detailed instructions on setting up and running each component.

Thank you for exploring my Luxor Challenge project!
