from flask import Flask, request, jsonify, send_file
from flask_pymongo import PyMongo
from flask_cors import CORS
from models import Volunteer, ALLOWED_VOLUNTEERING_ROLES
from bson import ObjectId
import gridfs
import io

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

if __name__ == "__main__":
    app.run(debug=True)