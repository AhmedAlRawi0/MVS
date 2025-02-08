from flask import Flask, request, jsonify, send_file
from flask_pymongo import PyMongo
from flask_cors import CORS
from models import Volunteer, ALLOWED_VOLUNTEERING_ROLES
from bson import ObjectId
import gridfs
import io
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

app.config["MONGO_URI"] = "mongodb://localhost:27017/volunteerDB"
mongo = PyMongo(app)

# Initialize GridFS
fs = gridfs.GridFS(mongo.db)

# Volunteer Sign-Up Endpoint with File Upload Support
@app.route("/signup", methods=["POST"])
def signup():
    # Expecting multipart/form-data
    # Regular text fields can be obtained from request.form
    name = request.form.get("name")
    desc_paragraph = request.form.get("desc_paragraph")
    phone_number = request.form.get("phone_number")
    gender = request.form.get("gender")
    email = request.form.get("email")
    volunteering_role = request.form.get("volunteering_role")
    availabilities = request.form.get("availabilities")  # Expect a JSON string, or process as needed.

    # Process the CV file upload
    cv_file = request.files.get("cv")
    cv_file_id = None
    if cv_file:
        # Store file in GridFS; you can also pass additional metadata.
        cv_file_id = fs.put(cv_file, filename=cv_file.filename)

    # Create a Volunteer instance.
    try:
        volunteer = Volunteer(
            name=name,
            phone_number=phone_number,
            desc_paragraph=desc_paragraph,
            gender=gender,
            email=email,
            cv=cv_file_id,  # Save the GridFS file id (or None if no file)
            volunteering_role=volunteering_role,
            availabilities=availabilities  # You may convert JSON string to a Python object if needed.
        )
    except ValueError as ve:
        return jsonify({"success": False, "message": str(ve)}), 400

    # Insert into MongoDB.
    result = mongo.db.volunteers.insert_one(volunteer.to_dict())
    volunteer_dict = volunteer.to_dict()
    volunteer_dict["_id"] = str(result.inserted_id)

    return jsonify({
        "success": True,
        "message": "Volunteer signed up!",
        "volunteer": volunteer_dict
    }), 201

# Endpoint to download/retrieve a stored CV by volunteer ID.
@app.route("/cv/<volunteer_id>", methods=["GET"])
def get_cv(volunteer_id):
    # Look up volunteer document by matching the _id as a string.
    volunteer = mongo.db.volunteers.find_one({"_id": volunteer_id})
    if not volunteer or not volunteer.get("cv"):
        return jsonify({"success": False, "message": "CV not found."}), 404
    try:
        # Convert the stored cv (string) back to an ObjectId
        file_id = ObjectId(volunteer.get("cv"))
        file_obj = fs.get(file_id)
        # Send the file back, setting the appropriate mimetype.
        return send_file(
            io.BytesIO(file_obj.read()),
            download_name=file_obj.filename,
            mimetype=file_obj.content_type
        )
    except Exception as e:
        return jsonify({"success": False, "message": "Error retrieving file.", "error": str(e)}), 500

@app.route("/applications", methods=["GET"])
def get_applications():
    # Find all volunteer documents where is_screened is False.
    applications_cursor = mongo.db.volunteers.find({"is_screened": False})
    applications = list(applications_cursor)

    # Convert ObjectId fields to strings.
    for application in applications:
        application["_id"] = str(application["_id"])
        # If cv exists, keep it as a string; otherwise, it's already None.
        if application.get("cv"):
            application["cv"] = str(application["cv"])

    return jsonify({
        "success": True,
        "applications": applications
    })

@app.route("/application/<application_id>/approve", methods=["GET"])
def approve_application(application_id):
    # Update the volunteer document with the given _id, setting is_screened to True.
    result = mongo.db.volunteers.update_one(
        {"_id": application_id},
        {"$set": {"is_screened": True}}
    )
    if result.matched_count == 0:
        return jsonify({
            "success": False,
            "message": f"No application found with id {application_id}"
        }), 404
    return jsonify({
        "success": True,
        "message": f"Application {application_id} approved."
    })

@app.route("/application/<application_id>/reject", methods=["GET"])
def reject_application(application_id):
    # Attempt to delete the document with the given _id. This assumes the id is stored as a string.
    result = mongo.db.volunteers.delete_one({"_id": application_id})
    
    # Check if any document was actually deleted.
    if result.deleted_count == 0:
        return jsonify({
            "success": False,
            "message": f"No application found with id {application_id}"
        }), 404

    return jsonify({
        "success": True,
        "message": f"Application {application_id} rejected and deleted."
    })

@app.route("/volunteers", methods=["GET"])
def get_volunteers():
    # Find all volunteer documents where is_screened is False.
    volunteers_cursor = mongo.db.volunteers.find({"is_screened": True})
    volunteers = list(volunteers_cursor)

    # Convert ObjectId fields to strings.
    for volunteer in volunteers:
        volunteer["_id"] = str(volunteer["_id"])
        # If cv exists, keep it as a string; otherwise, it's already None.
        if volunteer.get("cv"):
            volunteer["cv"] = str(volunteer["cv"])

    return jsonify({
        "success": True,
        "volunteers": volunteers
    })


@app.route("/send-email", methods=["POST"])
def send_email_to_volunteers():
    data = request.get_json()
    volunteer_ids = data.get("volunteerIds", [])
    subject = data.get("subject", "")
    message_body = data.get("message", "")

    if not volunteer_ids or not subject or not message_body:
        return jsonify({"success": False, "message": "volunteerIds, subject, and message are required."}), 400

    # Gather email addresses for given volunteer IDs
    recipients = []
    for vid in volunteer_ids:
        # Using the fact that _id is stored as a string
        volunteer = mongo.db.volunteers.find_one({"_id": vid})
        if volunteer and volunteer.get("email"):
            recipients.append(volunteer["email"])

    if not recipients:
        return jsonify({"success": False, "message": "No valid email recipients found."}), 400

    # SMTP configuration 
    SMTP_SERVER = 'smtp.gmail.com'
    SMTP_PORT = 587
    EMAIL_ADDRESS = os.environ.get('EMAIL_ADDRESS', 'noreply.mydailyreminder@gmail.com')
    EMAIL_PASSWORD = os.environ.get('EMAIL_PASSWORD')
    SENDER_NAME = os.environ.get('SENDER_NAME', 'Sister Sabria Foundation')

    try:
        for to_email in recipients:
            # Prepare the email message (HTML format)
            message = MIMEMultipart()
            message["From"] = f"{SENDER_NAME} <{EMAIL_ADDRESS}>"
            message["To"] = to_email
            message["Subject"] = subject
            message.attach(MIMEText(message_body, "html"))
            
            # Connect to the SMTP server and send the email.
            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.starttls()
                server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
                server.sendmail(EMAIL_ADDRESS, to_email, message.as_string())
        
        return jsonify({
            "success": True,
            "message": "Emails sent successfully."
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error sending emails.",
            "error": str(e)
        }), 500

if __name__ == "__main__":
    app.run(debug=True)
