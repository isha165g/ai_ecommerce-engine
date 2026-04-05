"use client";
import { useState, useEffect, use } from "react";
import { fetchWithAuth } from "@/lib/api";

type Product = { id: number; name: string; description: string; price: number; category: string; };
type Review = { id: number; user_id: number; rating: number; comment: string; trust_score: number; is_verified_purchase: boolean; created_at: string; };

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [loading, setLoading] = useState(true);
  const [purchaseWarning, setPurchaseWarning] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");

  const handleSetAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPrice) return;
    const res = await fetchWithAuth("/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: product?.id, target_price: parseFloat(targetPrice) })
    });
    if(res.ok) {
      alert("Price Alert Set Successfully!");
      setTargetPrice("");
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const pRes = await fetchWithAuth(`/products/${id}`);
        if(pRes.ok) setProduct(await pRes.json());
        
        const rRes = await fetchWithAuth(`/products/${id}/reviews`);
        if(rRes.ok) setReviews(await rRes.json());
      } catch (e) {}
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  const handlePurchase = async () => {
    setIsEvaluating(true);
    setPurchaseWarning(null);
    try {
      const res = await fetchWithAuth("/purchase/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product?.id, price: product?.price })
      });
      if(res.ok) {
        const data = await res.json();
        if(data.is_risky) {
           setPurchaseWarning(data.risk_reason);
        } else {
           await confirmPurchase(false);
        }
      }
    } catch(e) {}
    setIsEvaluating(false);
  };

  const confirmPurchase = async (is_risky: boolean) => {
     setPurchaseWarning(null);
     await fetchWithAuth("/purchase/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product?.id, price: product?.price })
     });
     alert("Purchase Confirmed!");
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.comment) return;
    const res = await fetchWithAuth(`/products/${id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newReview, is_verified_purchase: true })
    });
    if (res.ok) {
      const savedReview = await res.json();
      setReviews([savedReview, ...reviews]);
      setNewReview({ rating: 5, comment: "" });
    }
  };

  if(loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  if(!product) return <div className="min-h-screen bg-black text-white flex items-center justify-center text-red-500">Product not found.</div>;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-900 text-white p-4 md:p-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-[-10%] w-[500px] h-[500px] bg-pink-900/20 rounded-full filter blur-[150px] pointer-events-none"></div>
      
      {purchaseWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-red-500/50 p-8 rounded-3xl max-w-lg w-full shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <h3 className="text-3xl font-black text-red-400 mb-4 flex items-center gap-3">
              <span>⚠️</span> AI Purchase Warning
            </h3>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              {purchaseWarning}
            </p>
            <div className="flex gap-4 justify-end">
              <button onClick={() => setPurchaseWarning(null)} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors">
                Cancel Purchase
              </button>
              <button onClick={() => confirmPurchase(true)} className="px-6 py-3 bg-red-600/80 hover:bg-red-500 rounded-xl font-bold transition-colors shadow-lg">
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-12 relative z-10 pt-10">
        
        {/* Product Info */}
        <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col md:flex-row gap-8 justify-between items-start">
            <div className="space-y-4">
              <span className="text-pink-400 font-bold tracking-widest uppercase text-sm border border-pink-500/30 bg-pink-500/10 px-3 py-1 rounded-full">{product.category}</span>
              <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">{product.name}</h1>
              <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">{product.description}</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black text-green-400">₹{product.price.toFixed(2)}</div>
              <button onClick={handlePurchase} disabled={isEvaluating} className="mt-6 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-transform hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(79,70,229,0.7)]">
                {isEvaluating ? "Evaluating..." : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>

        {/* Price Alert Section */}
        <div className="bg-gradient-to-br from-indigo-900/20 to-blue-900/10 border border-indigo-500/20 p-8 rounded-3xl backdrop-blur-md">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <span className="text-3xl">📉</span> Set Price Alert
          </h2>
          <p className="text-gray-400 mb-6">Get instantly notified when the price drops below your target.</p>
          <form onSubmit={handleSetAlert} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
              <input type="number" value={targetPrice} onChange={e => setTargetPrice(e.target.value)} placeholder="Target Price" required className="w-full bg-black/40 border border-indigo-500/30 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg transition-all placeholder-gray-600" />
            </div>
            <button type="submit" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:shadow-[0_0_25px_rgba(79,70,229,0.7)] transition-all whitespace-nowrap">Set Alert</button>
          </form>
        </div>

        {/* Reviews Section */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold border-b border-white/10 pb-4">Trust-Weighted Reviews</h2>
          
          <form onSubmit={handleSubmitReview} className="bg-black/30 p-6 rounded-2xl border border-white/10 space-y-4 shadow-inner">
            <h3 className="font-bold text-xl text-indigo-300">Write a Review</h3>
            <div className="flex gap-4 items-center">
              <label className="text-gray-300">Rating:</label>
              <input type="number" min="1" max="5" value={newReview.rating} onChange={e => setNewReview({ ...newReview, rating: parseInt(e.target.value) })} className="bg-white/10 border border-white/20 rounded-md px-3 py-1 w-20 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <textarea
              value={newReview.comment} onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
              className="w-full bg-white/5 border border-white/20 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] placeholder-gray-500"
              placeholder="Share your honest experience..." required
            />
            <button type="submit" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/50">Submit Review</button>
          </form>

          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className={`p-6 rounded-3xl border transition-all ${r.trust_score > 0.7 ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-400/40 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-white/5 border-white/10'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-1">
                    <span className="font-bold text-yellow-400 text-lg">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                    {r.is_verified_purchase && <span className="ml-3 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30 whitespace-nowrap">Verified Purchase</span>}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-sm font-bold px-4 py-1.5 rounded-full backdrop-blur-md ${r.trust_score > 0.7 ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50' : r.trust_score > 0.4 ? 'bg-gray-500/30 text-gray-300 border border-gray-500/50' : 'bg-red-500/30 text-red-300 border border-red-500/50'}`}>
                      AI Trust Score: {(r.trust_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <p className="text-gray-200 mt-4 leading-relaxed text-lg">{r.comment}</p>
                <div className="mt-4 pt-4 border-t border-white/5 text-xs text-gray-500 flex justify-between">
                   <span>User ID: {r.user_id}</span>
                   <span>{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="py-12 bg-white/5 rounded-3xl border border-white/10 border-dashed text-center">
                <p className="text-gray-400 text-lg">No reviews yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
