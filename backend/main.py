from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from database import engine, Base, get_db
import models, schemas, crud, auth, deps

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI E-Commerce API", version="1.0.0")

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to AI E-Commerce API"}

@app.post("/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(deps.get_current_active_user)):
    return current_user

@app.put("/users/me", response_model=schemas.UserResponse)
def update_user_me(user_update: schemas.UserUpdate, current_user: models.User = Depends(deps.get_current_active_user), db: Session = Depends(get_db)):
    return crud.update_user(db=db, user=current_user, user_update=user_update)

@app.get("/products", response_model=list[schemas.ProductResponse])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_products(db, skip=skip, limit=limit)

@app.post("/products", response_model=schemas.ProductResponse)
def create_product_endpoint(product: schemas.ProductCreate, current_user: models.User = Depends(deps.get_current_admin_user), db: Session = Depends(get_db)):
    return crud.create_product(db=db, product=product)

@app.post("/search")
def search_and_recommend(search_query: schemas.SearchQuery, db: Session = Depends(get_db)):
    import ai_engine
    intent = ai_engine.analyze_intent(search_query.query)
    results = crud.search_products(db, intent)
    return {
        "intent_detected": intent,
        "recommendations": results
    }

@app.get("/products/{product_id}/history", response_model=list[schemas.PriceHistoryResponse])
def read_price_history(product_id: int, db: Session = Depends(get_db)):
    return crud.get_price_history(db, product_id=product_id)

@app.post("/alerts", response_model=schemas.PriceAlertResponse)
def create_price_alert_endpoint(alert: schemas.PriceAlertCreate, current_user: models.User = Depends(deps.get_current_active_user), db: Session = Depends(get_db)):
    return crud.create_price_alert(db=db, alert=alert, user_id=current_user.id)

@app.get("/alerts", response_model=list[schemas.PriceAlertResponse])
def read_price_alerts(current_user: models.User = Depends(deps.get_current_active_user), db: Session = Depends(get_db)):
    return crud.get_user_price_alerts(db=db, user_id=current_user.id)

@app.get("/products/{product_id}", response_model=schemas.ProductResponse)
def read_product(product_id: int, db: Session = Depends(get_db)):
    db_product = crud.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@app.post("/products/{product_id}/reviews", response_model=schemas.ReviewResponse)
def add_review(product_id: int, review: schemas.ReviewCreate, current_user: models.User = Depends(deps.get_current_active_user), db: Session = Depends(get_db)):
    import ai_engine
    review.product_id = product_id
    trust_score = ai_engine.calculate_trust_score(review.comment, review.rating, review.is_verified_purchase)
    return crud.create_review(db=db, review=review, user_id=current_user.id, trust_score=trust_score)

@app.get("/products/{product_id}/reviews", response_model=list[schemas.ReviewResponse])
def read_reviews(product_id: int, db: Session = Depends(get_db)):
    return crud.get_product_reviews(db, product_id=product_id)

@app.post("/purchase/evaluate", response_model=schemas.PurchaseRiskResponse)
def evaluate_purchase(purchase: schemas.PurchaseCreate, current_user: models.User = Depends(deps.get_current_active_user), db: Session = Depends(get_db)):
    import ai_engine
    recent_count = crud.get_recent_purchases_count(db, current_user.id)
    is_risky, reason = ai_engine.analyze_purchase_risk(purchase.price, current_user.budget, recent_count)
    return {
        "is_risky": is_risky,
        "risk_reason": reason,
        "budget_remaining": current_user.budget
    }

@app.post("/purchase/confirm")
def confirm_purchase(purchase: schemas.PurchaseCreate, is_risky: bool = False, current_user: models.User = Depends(deps.get_current_active_user), db: Session = Depends(get_db)):
    crud.record_purchase(db, purchase, current_user.id, is_risky)
    return {"message": "Purchase successful"}
