import React, { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plus, Trash2, Edit2, MapPin, Upload, Eye, Navigation } from 'lucide-react';
import TravelMapPreview from '@/pages/Travel';
import TravelFlights from './TravelFlights';
import TravelLearnings from './TravelLearnings';
import TravelWishlist from './TravelWishlist';

export default function TravelEngine() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [viewMode, setViewMode] = useState('manage'); // 'manage' | 'preview'
  const [manageTab, setManageTab] = useState('Logs'); // 'Logs' | 'Flights' | 'Learnings' | 'Wishlist'
  const [file, setFile] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    lng: '',
    lat: '',
    description: '',
    country: 'India',
    state: '',
    pinType: 'city',
    dateVisited: '',
    journalText: ''
  });
  
  const [uploading, setUploading] = useState(false);

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'travel_logs'));
      const placesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlaces(placesList);
    } catch (error) {
      console.error("Error fetching places:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let photoUrl = null;
      
      // Handle file upload if present
      if (file) {
        const storageRef = ref(storage, `travel_photos/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        photoUrl = await getDownloadURL(snapshot.ref);
      }

      const placeData = {
        name: formData.name,
        coordinates: [parseFloat(formData.lng), parseFloat(formData.lat)],
        description: formData.description,
        country: formData.country,
        state: formData.state,
        pinType: formData.pinType,
        dateVisited: formData.dateVisited,
        journalText: formData.journalText,
      };

      if (editingId) {
        // If editing and uploaded a new photo, append or set it
        if (photoUrl) {
           placeData.photos = [photoUrl]; // For simplicity, overwriting previous or adding new. You can also arrayUnion.
        }
        await updateDoc(doc(db, 'travel_logs', editingId), placeData);
      } else {
        placeData.photos = photoUrl ? [photoUrl] : [];
        await addDoc(collection(db, 'travel_logs'), placeData);
      }
      
      setEditingId(null);
      setFile(null);
      setFormData({
        name: '', lng: '', lat: '', description: '', country: 'India', state: '', pinType: 'city', dateVisited: '', journalText: ''
      });
      fetchPlaces();
    } catch (error) {
      console.error("Error saving document: ", error);
      alert("Error saving document. Make sure your Storage/Firestore rules are configured.");
    }
    setUploading(false);
  };

  const handleEdit = (place) => {
    setEditingId(place.id);
    setFormData({
      name: place.name || '',
      lng: place.coordinates?.[0] || '',
      lat: place.coordinates?.[1] || '',
      description: place.description || '',
      country: place.country || 'India',
      state: place.state || '',
      pinType: place.pinType || 'city',
      dateVisited: place.dateVisited || '',
      journalText: place.journalText || ''
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      await deleteDoc(doc(db, 'travel_logs', id));
      fetchPlaces();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-serif text-gray-900">Travel Engine</h2>
          <p className="text-sm text-gray-500">Manage all your travel data, coordinates, and journals.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 p-1 rounded-lg flex text-sm">
            <button 
              onClick={() => setViewMode('manage')}
              className={`px-4 py-1.5 rounded-md font-medium transition-colors ${viewMode === 'manage' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Manage Data
            </button>
            <button 
              onClick={() => setViewMode('preview')}
              className={`px-4 py-1.5 rounded-md font-medium flex items-center gap-2 transition-colors ${viewMode === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Eye size={14} /> Live Map
            </button>
          </div>
          <div className="text-sm font-medium bg-indigo-50 px-3 py-1.5 rounded-lg text-indigo-700">
            Total: {places.length} Places
          </div>
        </div>
      </div>

      {viewMode === 'preview' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[70vh] overflow-hidden">
           <TravelMapPreview isPreview={true} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sub-Navigation for Manage Mode */}
          <div className="flex gap-2 border-b border-gray-200 pb-2">
            {['Logs', 'Flights', 'Learnings', 'Wishlist'].map(tab => (
              <button
                key={tab}
                onClick={() => setManageTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${manageTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Conditional Rendering of Manage Tabs */}
          {manageTab === 'Logs' && (
            <>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-medium mb-4">{editingId ? 'Edit Location' : 'Add New Location'}</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Location Name</label>
              <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Description (Short)</label>
              <input required name="description" value={formData.description} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Longitude (X)</label>
              <input required type="number" step="any" name="lng" value={formData.lng} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Latitude (Y)</label>
              <input required type="number" step="any" name="lat" value={formData.lat} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Country</label>
              <input required name="country" value={formData.country} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">State (Optional)</label>
              <input name="state" value={formData.state} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Pin Type</label>
              <select name="pinType" value={formData.pinType} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="city">City</option>
                <option value="mountain">Mountain/Valley</option>
                <option value="beach">Beach/Coastal</option>
                <option value="temple">Temple/Spiritual</option>
                <option value="forest">Forest/Wildlife</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date Visited</label>
              <input type="date" name="dateVisited" value={formData.dateVisited} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Upload Photo (Replaces existing if any)</label>
              <div className="flex items-center gap-3">
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Journal Entry</label>
            <textarea name="journalText" value={formData.journalText} onChange={handleInputChange} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={uploading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 flex items-center gap-2">
              {uploading ? 'Saving...' : (editingId ? 'Update Location' : 'Save New Location')}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setFile(null); setFormData({name:'', lng:'', lat:'', description:'', country:'India', state:'', pinType:'city', dateVisited:'', journalText:''}) }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Location</th>
              <th className="px-4 py-3 font-medium text-gray-600">Country</th>
              <th className="px-4 py-3 font-medium text-gray-600">Type</th>
              <th className="px-4 py-3 font-medium text-gray-600">Coords</th>
              <th className="px-4 py-3 font-medium text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">Loading data...</td></tr>
            ) : places.map(place => (
              <tr key={place.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{place.name}</div>
                  <div className="text-xs text-gray-500">{place.description}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{place.country}</td>
                <td className="px-4 py-3 text-gray-600 capitalize">{place.pinType}</td>
                <td className="px-4 py-3 text-gray-600 text-xs font-mono">
                  {place.coordinates?.[0]?.toFixed(2)}, {place.coordinates?.[1]?.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(place)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded mr-2">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(place.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </>
      )}

      {manageTab === 'Flights' && <TravelFlights />}
      {manageTab === 'Learnings' && <TravelLearnings />}
      {manageTab === 'Wishlist' && <TravelWishlist />}

      </div>
      )}
    </div>
  );
}
