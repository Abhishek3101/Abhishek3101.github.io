import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Trash2, Edit2, BookOpen } from 'lucide-react';

export default function TravelLearnings() {
  const [learnings, setLearnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    text: ''
  });

  const fetchLearnings = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'travel_learnings'));
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLearnings(list);
    } catch (error) {
      console.error("Error fetching learnings:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLearnings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'travel_learnings', editingId), formData);
      } else {
        await addDoc(collection(db, 'travel_learnings'), { ...formData, createdAt: new Date().toISOString() });
      }
      setEditingId(null);
      setFormData({ text: '' });
      fetchLearnings();
    } catch (error) {
      console.error("Error saving learning: ", error);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      text: item.text || ''
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this learning entry?')) {
      await deleteDoc(doc(db, 'travel_learnings', id));
      fetchLearnings();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="text-emerald-600" size={20} />
          <h3 className="text-lg font-medium">{editingId ? 'Edit Learning' : 'Add New Learning'}</h3>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <textarea 
              required 
              name="text" 
              value={formData.text} 
              onChange={handleInputChange} 
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
              placeholder="What cultural insight or lesson did you learn from your travels?" 
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
              {editingId ? 'Update Learning' : 'Save Learning'}
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
          <div className="text-center text-gray-500 py-8">Loading learnings...</div>
        ) : learnings.length === 0 ? (
          <div className="text-center text-gray-500 py-8 bg-white rounded-xl border border-gray-200">No learnings logged yet.</div>
        ) : learnings.map(item => (
          <div key={item.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between gap-4 group hover:border-emerald-200 transition-colors">
            <p className="text-gray-700 text-sm whitespace-pre-wrap flex-1">{item.text}</p>
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
