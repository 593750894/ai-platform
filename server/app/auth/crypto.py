"""Per-tenant Ark API key envelope: Fernet symmetric encryption.

Phase 1 stores ciphertext in `tenants.ark_api_key_ciphertext`. Future versions
can swap in a KMS-backed `EncryptionProvider` without touching call sites.
"""
from __future__ import annotations

from functools import lru_cache

from cryptography.fernet import Fernet, InvalidToken

from app.config import get_settings


class CryptoError(Exception):
    pass


@lru_cache
def _fernet() -> Fernet:
    s = get_settings()
    if not s.ark_key_fernet_secret:
        raise CryptoError("ARK_KEY_FERNET_SECRET not configured")
    return Fernet(s.ark_key_fernet_secret.encode("utf-8"))


def encrypt_ark_key(plain_key: str) -> str:
    return _fernet().encrypt(plain_key.encode("utf-8")).decode("utf-8")


def decrypt_ark_key(ciphertext: str) -> str:
    try:
        return _fernet().decrypt(ciphertext.encode("utf-8")).decode("utf-8")
    except InvalidToken as e:
        raise CryptoError("Ark key ciphertext invalid or key rotated") from e
