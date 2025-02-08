from bson.objectid import ObjectId

ALLOWED_VOLUNTEERING_ROLES = ["Cooking", "packaging", "cleaning", "distributing"]

class Volunteer:
    def __init__(self, name, desc_paragraph, phone_number, email, cv=None, volunteering_role=None, availabilities=None, _id=None):
        self._id = _id if _id else ObjectId()
        self.name = name
        self.phone_number = phone_number
        self.desc_paragraph = desc_paragraph
        self.email = email

        # cv stores the GridFS file ID. It can be None if the user did not upload a file.
        self.cv = cv
        
        # Validate volunteering_role exists in ALLOWED_VOLUNTEERING_ROLES.
        if volunteering_role not in ALLOWED_VOLUNTEERING_ROLES:
            raise ValueError(f"volunteering_role must be one of {ALLOWED_VOLUNTEERING_ROLES}")
        self.volunteering_role = volunteering_role
        
        # availabilities can be stored in various formats; ensure it's JSON-serializable.
        self.availabilities = availabilities if availabilities is not None else []

    def to_dict(self):
        """
        Convert the Volunteer instance into a dictionary.
        Convert the ObjectId fields to strings for JSON serialization.
        """
        return {
            "_id": str(self._id),
            "name": self.name,
            "desc_paragraph": self.desc_paragraph,
            "email": self.email,
            "phone_number": self.phone_number,
            "cv": str(self.cv) if self.cv else None,
            "volunteering_role": self.volunteering_role,
            "availabilities": self.availabilities
        }

    @classmethod
    def from_dict(cls, data):
        _id = data.get("_id")
        if _id and not isinstance(_id, ObjectId):
            _id = ObjectId(_id)
        # cv is stored as a string representation of the ObjectID in MongoDB.
        cv = data.get("cv")
        if cv:
            cv = ObjectId(cv)
        return cls(
            name=data.get("name"),
            desc_paragraph=data.get("desc_paragraph"),
            phone_number=data.get("phone_number"),
            email=data.get("email"),
            cv=cv,
            volunteering_role=data.get("volunteering_role"),
            availabilities=data.get("availabilities"),
            _id=_id
        )