import re

def analyze_intent(query: str):
    query = query.lower()
    intent = {
        "is_budget_constrained": False,
        "is_urgent": False,
        "is_exploratory": True,
        "price_limit": None,
        "extracted_keywords": []
    }
    
    # Check for budget constraints
    if any(word in query for word in ["cheap", "budget", "under", "less than", "affordable", "deal"]):
        intent["is_budget_constrained"] = True
        
    # Extract numeric price limits
    match = re.search(r'(under|less than|max|budget of)\s*\$?(\d+)', query)
    if match:
        intent["price_limit"] = float(match.group(2))
        intent["is_budget_constrained"] = True
        
    # Check urgency
    if any(word in query for word in ["urgent", "fast", "quick", "soon", "today", "tomorrow"]):
        intent["is_urgent"] = True
        intent["is_exploratory"] = False
        
    # Extract keywords
    words = query.split()
    stopwords = {"a", "an", "the", "i", "want", "need", "looking", "for", "some", "cheap", "under", "less", "than", "max"}
    intent["extracted_keywords"] = [w for w in words if w not in stopwords and not w.isdigit()]
    
    return intent

def calculate_trust_score(comment: str, rating: int, is_verified: bool):
    score = 0.5
    if is_verified:
        score += 0.2
    
    length = len(comment)
    if length > 20 and length < 500:
        score += 0.1
        
    spam_words = ["buy now", "click here", "fake", "scam", "free"]
    if any(sw in comment.lower() for sw in spam_words):
        score -= 0.4
        
    return max(0.0, min(1.0, score))

def analyze_purchase_risk(price: float, budget: float, recent_purchases_count: int):
    # Basic Regret Minimization heuristic
    if price > budget * 0.5:
        return True, "This item consumes more than 50% of your remaining budget. Are you sure?"
    if recent_purchases_count > 3:
        return True, "You've made several purchases recently. Consider waiting to avoid impulse buying."
    return False, None
