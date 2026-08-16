import os
import uuid
from urllib import request
from urllib.error import HTTPError, URLError

from fastapi import HTTPException, UploadFile, status

from .config import settings


def validate_image_upload(file: UploadFile, detail_prefix: str = "File") -> None:
    if not file.content_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{detail_prefix} type not detected"
        )

    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{detail_prefix} must be an image"
        )


def make_image_filename(original_filename: str | None) -> str:
    extension = os.path.splitext(original_filename or "")[1].lower()

    if not extension:
        extension = ".jpg"

    return f"{uuid.uuid4()}{extension}"


def is_remote_url(value: str | None) -> bool:
    return bool(value and (value.startswith("http://") or value.startswith("https://")))


def remove_local_file(directory: str, filename: str | None) -> None:
    if not filename or is_remote_url(filename):
        return

    old_file = os.path.join(directory, filename)

    if os.path.exists(old_file):
        os.remove(old_file)


def storage_is_configured() -> bool:
    return bool(
        settings.supabase_url
        and settings.supabase_service_role_key
        and settings.supabase_storage_bucket
    )


async def save_image_upload(file: UploadFile, folder: str, local_directory: str) -> str:
    validate_image_upload(file)

    filename = make_image_filename(file.filename)
    contents = await file.read()

    if storage_is_configured():
        return upload_to_supabase_storage(
            contents=contents,
            content_type=file.content_type or "image/jpeg",
            folder=folder,
            filename=filename
        )

    os.makedirs(local_directory, exist_ok=True)
    file_path = os.path.join(local_directory, filename)

    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    return filename


def upload_to_supabase_storage(
    contents: bytes,
    content_type: str,
    folder: str,
    filename: str
) -> str:
    supabase_url = settings.supabase_url.rstrip("/")
    bucket = settings.supabase_storage_bucket
    object_path = f"{folder}/{filename}"
    upload_url = f"{supabase_url}/storage/v1/object/{bucket}/{object_path}"

    upload_request = request.Request(
        upload_url,
        data=contents,
        method="POST",
        headers={
            "apikey": settings.supabase_service_role_key,
            "Authorization": f"Bearer {settings.supabase_service_role_key}",
            "Content-Type": content_type,
            "x-upsert": "true"
        }
    )

    try:
        with request.urlopen(upload_request, timeout=30):
            pass
    except HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Supabase Storage upload failed: {exc.code}"
        ) from exc
    except URLError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Supabase Storage upload failed"
        ) from exc

    return f"{supabase_url}/storage/v1/object/public/{bucket}/{object_path}"
