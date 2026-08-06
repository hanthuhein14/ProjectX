
import os
import uuid

from app import models, schemes, utils

from sqlalchemy.orm import Session

from fastapi import (
    status,
    HTTPException,
    Depends,
    APIRouter,
    UploadFile,
    File,
    Form
)

from ..database import get_db
from ..oauth2 import get_current_user


router = APIRouter(
    prefix="/userinfo",
    tags=["User"]
)


# =========================
# UPLOAD DIRECTORY
# =========================

UPLOAD_DIR = "uploads/profile"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


# =========================
# CREATE USER
# =========================

@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=schemes.UserOut
)
def create_user(
    user: schemes.UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(
        models.User
    ).filter(
        models.User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    hashed_password = utils.hash(
        user.password
    )

    user.password = hashed_password

    new_user = models.User(
        **user.dict()
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# =========================
# GET CURRENT USER
# =========================

@router.get(
    "/me",
    response_model=schemes.UserOut
)
def get_current_user_info(
    current_user: models.User = Depends(
        get_current_user
    )
):

    return current_user


# =========================
# UPDATE USER
# =========================


@router.put("/update")
async def update_user(
    username: str | None = Form(default=None),
    profile_photo: UploadFile | None = File(default=None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    print("================================")
    print("UPDATE USER CALLED")
    print("Username:", username)
    print("Photo:", profile_photo)
    print("================================")


    # =========================
    # UPDATE USERNAME
    # =========================

    if username is not None:

        username = username.strip()

        if not username:
            raise HTTPException(
                status_code=400,
                detail="Username cannot be empty"
            )

        existing_user = db.query(
            models.User
        ).filter(
            models.User.username == username,
            models.User.id != current_user.id
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=409,
                detail="Username already exists"
            )

        current_user.username = username


    # =========================
    # UPDATE PROFILE PHOTO
    # =========================

    if profile_photo is not None:

        print("PHOTO RECEIVED")
        print("Original filename:", profile_photo.filename)
        print("Content type:", profile_photo.content_type)


        # Check image type

        if not profile_photo.content_type:
            raise HTTPException(
                status_code=400,
                detail="File type not detected"
            )

        if not profile_photo.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="Only image files are allowed"
            )


        # Get extension

        extension = os.path.splitext(
            profile_photo.filename
        )[1].lower()

        if not extension:
            extension = ".jpg"


        # Generate unique filename

        filename = f"{uuid.uuid4()}{extension}"

        print("New filename:", filename)


        # File path

        file_path = os.path.join(
            UPLOAD_DIR,
            filename
        )

        print("File path:", file_path)


        # Save image

        contents = await profile_photo.read()

        with open(file_path, "wb") as buffer:
            buffer.write(contents)

        print("Image saved successfully")


        # Delete old image

        if current_user.profile_photo:

            old_file = os.path.join(
                UPLOAD_DIR,
                current_user.profile_photo
            )

            if os.path.exists(old_file):
                os.remove(old_file)


        # =========================
        # SAVE FILENAME TO DATABASE
        # =========================

        current_user.profile_photo = filename

        print(
            "Database profile_photo:",
            current_user.profile_photo
        )


    # =========================
    # SAVE DATABASE
    # =========================

    db.commit()

    db.refresh(current_user)


    print("AFTER COMMIT:")
    print(
        "Database profile_photo:",
        current_user.profile_photo
    )


    return {
        "message": "Profile updated successfully",
        "username": current_user.username,
        "profile_photo": current_user.profile_photo
    }



# =========================
# GET USER BY ID
# =========================

@router.get(
    "/{id}",
    response_model=schemes.UserOut
)
def get_user(
    id: int,
    db: Session = Depends(get_db)
):

    user = db.query(
        models.User
    ).filter(
        models.User.id == id
    ).first()

    if not user:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id: {id} does not exist"
        )

    return user

