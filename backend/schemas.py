from pydantic import BaseModel, EmailStr
from typing import Optional
import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    budget: Optional[float] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    role: str
    is_active: bool
    budget: float

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    image_url: Optional[str] = None
    category: str
    tags: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True

class SearchQuery(BaseModel):
    query: str

class PriceHistoryResponse(BaseModel):
    price: float
    recorded_at: datetime.datetime
    class Config:
        from_attributes = True

class PriceAlertCreate(BaseModel):
    product_id: int
    target_price: float

class PriceAlertResponse(PriceAlertCreate):
    id: int
    user_id: int
    is_active: bool
    class Config:
        from_attributes = True

class ReviewCreate(BaseModel):
    product_id: int
    rating: int
    comment: str
    is_verified_purchase: bool = False

class ReviewResponse(ReviewCreate):
    id: int
    user_id: int
    trust_score: float
    created_at: datetime.datetime
    class Config:
        from_attributes = True

class PurchaseCreate(BaseModel):
    product_id: int
    price: float

class PurchaseRiskResponse(BaseModel):
    is_risky: bool
    risk_reason: Optional[str] = None
    budget_remaining: float
