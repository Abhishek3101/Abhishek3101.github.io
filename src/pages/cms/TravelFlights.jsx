import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { Trash2, Edit2, Plane } from 'lucide-react';

export default function TravelFlights() {
  const [flights, setFlights] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: '',
    airline: '',
    flightNumber: ''
  });

  const [airlineForm, setAirlineForm] = useState({
    name: '',
    color: '#3b82f6',
    textColor: '#ffffff'
  });

  const fetchFlights = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'travel_flights'));
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
      setFlights(list);

      const airSnap = await getDocs(collection(db, 'travel_airlines'));
      setAirlines(airSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'travel_flights', editingId), formData);
      } else {
        await addDoc(collection(db, 'travel_flights'), formData);
      }
      setEditingId(null);
      setFormData({ from: '', to: '', date: '', airline: '', flightNumber: '' });
      fetchFlights();
    } catch (error) {
      console.error("Error saving flight: ", error);
    }
  };

  const handleEdit = (flight) => {
    setEditingId(flight.id);
    setFormData({
      from: flight.from || '',
      to: flight.to || '',
      date: flight.date || '',
      airline: flight.airline || '',
      flightNumber: flight.flightNumber || ''
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this flight?')) {
      await deleteDoc(doc(db, 'travel_flights', id));
      fetchFlights();
    }
  };

  const handleSaveAirline = async (e) => {
    e.preventDefault();
    try {
      // Use the airline name as the document ID for easy lookup, convert to lowercase for consistency
      const docId = airlineForm.name.trim().toLowerCase();
      await updateDoc(doc(db, 'travel_airlines', docId), airlineForm).catch(async () => {
         await setDoc(doc(db, 'travel_airlines', docId), airlineForm);
      });
      setAirlineForm({ name: '', color: '#3b82f6', textColor: '#ffffff' });
      fetchFlights();
    } catch (error) {
      console.error("Error saving airline: ", error);
    }
  };

  const handleDeleteAirline = async (id) => {
    if (window.confirm('Delete this airline brand?')) {
      await deleteDoc(doc(db, 'travel_airlines', id));
      fetchFlights();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Plane className="text-indigo-600" size={20} />
          <h3 className="text-lg font-medium">{editingId ? 'Edit Flight' : 'Add New Flight'}</h3>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">From (Origin)</label>
              <input required name="from" value={formData.from} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. DEL" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To (Destination)</label>
              <input required name="to" value={formData.to} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. BOM" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
              <input required type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Airline</label>
              <input required name="airline" value={formData.airline} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Indigo" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Flight Number</label>
              <input required name="flightNumber" value={formData.flightNumber} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 6E-201" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              {editingId ? 'Update Flight' : 'Save Flight'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setFormData({from: '', to: '', date: '', airline: '', flightNumber: ''}) }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Route</th>
              <th className="px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="px-4 py-3 font-medium text-gray-600">Airline</th>
              <th className="px-4 py-3 font-medium text-gray-600">Flight #</th>
              <th className="px-4 py-3 font-medium text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">Loading flights...</td></tr>
            ) : flights.length === 0 ? (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">No flights logged yet.</td></tr>
            ) : flights.map(flight => (
              <tr key={flight.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{flight.from} → {flight.to}</td>
                <td className="px-4 py-3 text-gray-600">{flight.date}</td>
                <td className="px-4 py-3 text-gray-600">{flight.airline}</td>
                <td className="px-4 py-3 text-gray-600 font-mono text-xs">{flight.flightNumber}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(flight)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded mr-2">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(flight.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-8">
        <h3 className="text-lg font-medium mb-4">Manage Airline Brands</h3>
        <p className="text-xs text-gray-500 mb-4">Define brand colors for airlines to display beautifully on the boarding passes.</p>
        
        <form onSubmit={handleSaveAirline} className="flex gap-4 items-end mb-6">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Airline Name (e.g. IndiGo)</label>
            <input required value={airlineForm.name} onChange={e => setAirlineForm(prev => ({...prev, name: e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Bg Color</label>
            <input required type="color" value={airlineForm.color} onChange={e => setAirlineForm(prev => ({...prev, color: e.target.value}))} className="h-9 w-16 cursor-pointer" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Text Color</label>
            <input required type="color" value={airlineForm.textColor} onChange={e => setAirlineForm(prev => ({...prev, textColor: e.target.value}))} className="h-9 w-16 cursor-pointer" />
          </div>
          <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors h-9">
            Save Brand
          </button>
        </form>

        <div className="flex flex-wrap gap-3">
          {airlines.map(air => (
            <div key={air.id} className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 shadow-sm text-sm" style={{ backgroundColor: air.color, color: air.textColor }}>
              <span className="font-bold">{air.name}</span>
              <button type="button" onClick={() => handleDeleteAirline(air.id)} className="ml-2 hover:opacity-70">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
