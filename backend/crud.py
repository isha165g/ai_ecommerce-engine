from sqlalchemy.orm import Session
import models, schemas, auth

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user: models.User, user_update: schemas.UserUpdate):
    if user_update.full_name is not None:
        user.full_name = user_update.full_name
    if user_update.budget is not None:
        user.budget = user_update.budget
    db.commit()
    db.refresh(user)
    return user

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def search_products(db: Session, intent: dict):
    query = db.query(models.Product)
    if intent["is_budget_constrained"] and intent["price_limit"]:
        query = query.filter(models.Product.price <= intent["price_limit"])
        
    results = query.all()
    if intent["extracted_keywords"]:
        refined = []
        for p in results:
            match_score = sum(1 for kw in intent["extracted_keywords"] if kw in p.name.lower() or kw in p.description.lower() or (p.tags and kw in p.tags.lower()))
            if match_score > 0:
                refined.append((match_score, p))
        refined.sort(key=lambda x: x[0], reverse=True)
        return [p[1] for p in refined]
    return results

def create_price_history(db: Session, product_id: int, price: float):
    db_history = models.PriceHistory(product_id=product_id, price=price)
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    return db_history

def get_price_history(db: Session, product_id: int):
    return db.query(models.PriceHistory).filter(models.PriceHistory.product_id == product_id).order_by(models.PriceHistory.recorded_at.desc()).all()

def create_price_alert(db: Session, alert: schemas.PriceAlertCreate, user_id: int):
    db_alert = models.PriceAlert(**alert.model_dump(), user_id=user_id)
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

def get_user_price_alerts(db: Session, user_id: int):
    return db.query(models.PriceAlert).filter(models.PriceAlert.user_id == user_id).all()

def create_review(db: Session, review: schemas.ReviewCreate, user_id: int, trust_score: float):
    db_review = models.Review(**review.model_dump(), user_id=user_id, trust_score=trust_score)
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def get_product_reviews(db: Session, product_id: int):
    return db.query(models.Review).filter(models.Review.product_id == product_id).order_by(models.Review.trust_score.desc()).all()

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def record_purchase(db: Session, purchase: schemas.PurchaseCreate, user_id: int, is_flagged: bool):
    db_purchase = models.Purchase(user_id=user_id, product_id=purchase.product_id, price_at_purchase=purchase.price, is_flagged_risk=is_flagged)
    db.add(db_purchase)
    
    # Deduct budget
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user and user.budget >= purchase.price:
        user.budget -= purchase.price
        
    db.commit()
    return db_purchase

def get_recent_purchases_count(db: Session, user_id: int):
    return db.query(models.Purchase).filter(models.Purchase.user_id == user_id).count()
