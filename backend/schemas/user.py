from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role_id: int

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role_id: Optional[int] = None

class RoleResponse(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: RoleResponse

    model_config = {"from_attributes": True}