import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Trash2, Edit2, Star } from 'lucide-react';

export default function TravelWishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    text: ''
  });

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'travel_wishlist'));
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWishlist(list);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'travel_wishlist', editingId), formData);
      } else {
        await addDoc(collection(db, 'travel_wishlist'), { ...formData, createdAt: new Date().toISOString() });
      }
      setEditingId(null);
      setFormData({ text: '' });
      fetchWishlist();
    } catch (error) {
      console.error("Error saving wishlist: ", error);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      text: item.text || ''
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this wishlist entry?')) {
      await deleteDoc(doc(db, 'travel_wishlist', id));
      fetchWishlist();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Star className="text-yellow-500" size={20} />
          <h3 className="text-lg font-medium">{editingId ? 'Edit Wishlist Item' : 'Add to Wishlist'}</h3>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <input 
              required 
              name="text" 
              value={formData.text} 
              onChange={handleInputChange} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 outline-none" 
              placeholder="Where do you want to go next?" 
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors">
              {editingId ? 'Update Wishlist' : 'Save to Wishlist'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setFormData({text: ''}) }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center text-gray-500 py-8">Loading wishlist...</div>
        ) : wishlist.length === 0 ? (
          <div className="text-center text-gray-500 py-8 bg-white rounded-xl border border-gray-200">Wishlist is empty.</div>
        ) : wishlist.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center gap-4 group hover:border-yellow-200 transition-colors">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <p className="text-gray-800 font-medium">{item.text}</p>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(item)} className="p-1.5 h-fit text-blue-600 hover:bg-blue-50 rounded">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 h-fit text-red-600 hover:bg-red-50 rounded">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
