import React, { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Trash2, Edit2, Layers } from 'lucide-react';

export default function GenericEngine({ collectionName, title, description, schema }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  const [formData, setFormData] = useState({});

  useEffect(() => {
    // Initialize form data based on schema
    const initial = {};
    schema.forEach(field => {
      initial[field.name] = field.defaultValue || '';
    });
    setFormData(initial);
  }, [schema]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Attempt to sort by date if date field exists, otherwise createdAt
      list.sort((a, b) => {
        const dateA = a.date || a.createdAt || '';
        const dateB = b.date || b.createdAt || '';
        return new Date(dateB) - new Date(dateA);
      });
      setItems(list);
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [collectionName]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let photoUrl = formData.image || null; // Preserve existing if not uploading new
      
      // Handle file upload if present
      if (file) {
        const storageRef = ref(storage, `${collectionName}_images/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        photoUrl = await getDownloadURL(snapshot.ref);
      }

      const itemData = { ...formData, image: photoUrl, updatedAt: new Date().toISOString() };

      if (editingId) {
        await updateDoc(doc(db, collectionName, editingId), itemData);
      } else {
        itemData.createdAt = new Date().toISOString();
        await addDoc(collection(db, collectionName), itemData);
      }
      
      setEditingId(null);
      setFile(null);
      
      const reset = {};
      schema.forEach(field => reset[field.name] = field.defaultValue || '');
      setFormData(reset);
      
      fetchItems();
    } catch (error) {
      console.error("Error saving document: ", error);
      alert("Error saving document.");
    }
    setUploading(false);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    const populated = {};
    schema.forEach(field => {
      populated[field.name] = item[field.name] !== undefined ? item[field.name] : (field.defaultValue || '');
    });
    setFormData(populated);
    setFile(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deleteDoc(doc(db, collectionName, id));
      fetchItems();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-serif text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className="text-sm font-medium bg-indigo-50 px-3 py-1.5 rounded-lg text-indigo-700">
          Total: {items.length} Items
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium mb-4">{editingId ? 'Edit Item' : 'Add New Item'}</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schema.map(field => {
              if (field.type === 'textarea') {
                return (
                  <div key={field.name} className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                    <textarea 
                      required={field.required !== false} 
                      name={field.name} 
                      value={formData[field.name] || ''} 
                      onChange={handleInputChange} 
                      rows={3} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                    />
                  </div>
                );
              }
              if (field.type === 'image') {
                return (
                  <div key={field.name} className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">{field.label} {editingId && '(Replaces existing if selected)'}</label>
                    {formData.image && editingId && !file && (
                      <div className="mb-2">
                        <img src={formData.image} alt="Current" className="h-16 w-16 object-cover rounded shadow-sm border border-gray-200" />
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => setFile(e.target.files[0])} 
                      className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
                    />
                  </div>
                );
              }
              if (field.type === 'select') {
                return (
                  <div key={field.name}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                    <select 
                      required={field.required !== false} 
                      name={field.name} 
                      value={formData[field.name] || ''} 
                      onChange={handleInputChange} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="" disabled>Select {field.label}</option>
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                );
              }
              return (
                <div key={field.name}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                  <input 
                    type={field.type || 'text'} 
                    required={field.required !== false} 
                    name={field.name} 
                    value={formData[field.name] || ''} 
                    onChange={handleInputChange} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                </div>
              );
            })}
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={uploading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
              {uploading ? 'Saving...' : (editingId ? 'Update Item' : 'Save Item')}
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={() => { 
                  setEditingId(null); 
                  setFile(null); 
                  const reset = {};
                  schema.forEach(field => reset[field.name] = field.defaultValue || '');
                  setFormData(reset);
                }} 
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {schema.filter(f => f.type !== 'textarea' && f.type !== 'image').slice(0, 4).map(field => (
                  <th key={field.name} className="px-4 py-3 font-medium text-gray-600">{field.label}</th>
                ))}
                <th className="px-4 py-3 font-medium text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">Loading data...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">No items found.</td></tr>
              ) : items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {schema.filter(f => f.type !== 'textarea' && f.type !== 'image').slice(0, 4).map(field => (
                    <td key={field.name} className="px-4 py-3 text-gray-700">
                      {item[field.name]}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded mr-2">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
