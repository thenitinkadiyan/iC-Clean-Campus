from database import SessionLocal
from models import User
from pwdlib import PasswordHash


password_hash = PasswordHash.recommended()


def is_already_hashed(password: str) -> bool:
    return password.startswith("$argon2")


def migrate_passwords():
    db = SessionLocal()

    try:
        users = db.query(User).all()

        migrated = 0
        skipped = 0

        for user in users:
            if not user.password:
                continue

            if is_already_hashed(user.password):
                skipped += 1
                continue

            user.password = password_hash.hash(user.password)
            migrated += 1

        db.commit()

        print("Password migration completed.")
        print(f"Passwords migrated: {migrated}")
        print(f"Already secure: {skipped}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    migrate_passwords()