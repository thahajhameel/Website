import React, { useState, useEffect } from 'react';
import { User, Upload, LogOut, Shirt, Archive, Footprints, Heart, Plus, Save, X, Trash2 } from 'lucide-react';

// Mock Firebase-like authentication
const mockAuth = {
  currentUser: null,
  signInWithEmailAndPassword: async (email, password) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (email.trim() && password.trim()) {
      mockAuth.currentUser = { email: email.trim(), uid: '123' };
      return { user: mockAuth.currentUser };
    }
    throw new Error('Please enter valid email and password');
  },
  signOut: async () => {
    mockAuth.currentUser = null;
  }
};

const OutfitManager = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('wardrobe');
  const [activeCategory, setActiveCategory] = useState('shirts');
  const [currentOutfit, setCurrentOutfit] = useState({
    shirt: null,
    pants: null,
    shoes: null
  });
  const [outfitHistory, setOutfitHistory] = useState([]);
  const [outfits, setOutfits] = useState({
    shirts: [],
    pants: [],
    shoes: []
  });

  const categories = [
    { key: 'shirts', label: 'Shirts', icon: Shirt },
    { key: 'pants', label: 'Pants', icon: Archive },
    { key: 'shoes', label: 'Shoes', icon: Footprints }
  ];

  useEffect(() => {
    setUser(mockAuth.currentUser);
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    console.log('Sign in clicked', { email, password }); // Debug log
    
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      console.log('Attempting sign in...'); // Debug log
      await mockAuth.signInWithEmailAndPassword(email, password);
      console.log('Sign in successful'); // Debug log
      setUser(mockAuth.currentUser);
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('Sign in error:', err); // Debug log
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    console.log('Logout clicked'); // Debug log
    try {
      await mockAuth.signOut();
      setUser(null);
      console.log('Logout successful'); // Debug log
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newItem = {
          id: Date.now(),
          name: file.name.replace(/\.[^/.]+$/, ""),
          image: event.target.result,
          isFavorite: false
        };
        setOutfits(prev => ({
          ...prev,
          [activeCategory]: [...prev[activeCategory], newItem]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleFavorite = (categoryKey, itemId) => {
    setOutfits(prev => ({
      ...prev,
      [categoryKey]: prev[categoryKey].map(item =>
        item.id === itemId ? { ...item, isFavorite: !item.isFavorite } : item
      )
    }));
  };

  const addToOutfit = (category, item) => {
    const categoryMap = {
      shirts: 'shirt',
      pants: 'pants',
      shoes: 'shoes'
    };
    setCurrentOutfit(prev => ({
      ...prev,
      [categoryMap[category]]: item
    }));
  };

  const removeFromOutfit = (category) => {
    setCurrentOutfit(prev => ({
      ...prev,
      [category]: null
    }));
  };

  const saveOutfit = () => {
    const outfit = {
      id: Date.now(),
      name: `Outfit ${outfitHistory.length + 1}`,
      items: { ...currentOutfit },
      createdDate: new Date().toLocaleDateString()
    };
    setOutfitHistory(prev => [outfit, ...prev]);
    setCurrentOutfit({ shirt: null, pants: null, shoes: null });
  };

  const loadOutfit = (outfit) => {
    setCurrentOutfit(outfit.items);
    setActiveTab('creator');
  };

  const removeItem = (categoryKey, id) => {
    setOutfits(prev => ({
      ...prev,
      [categoryKey]: prev[categoryKey].filter(item => item.id !== id)
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-red-800 flex items-center justify-center p-4">
        <div className="bg-black/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-red-500/30 p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-black rounded-full flex items-center justify-center mx-auto mb-4">
              <Shirt className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-2">
              Outfit Manager
            </h1>
          </div>

          <div className="space-y-6">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                console.log('Email changed:', e.target.value); // Debug log
                setEmail(e.target.value);
              }}
              className="w-full px-4 py-3 bg-gray-900/50 border border-red-500/30 rounded-lg focus:ring-2 focus:ring-red-500 text-white placeholder-gray-400"
              placeholder="Email"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => {
                console.log('Password changed:', e.target.value); // Debug log
                setPassword(e.target.value);
              }}
              className="w-full px-4 py-3 bg-gray-900/50 border border-red-500/30 rounded-lg focus:ring-2 focus:ring-red-500 text-white placeholder-gray-400"
              placeholder="Password"
              required
            />

            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleAuth}
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-3 px-4 rounded-lg font-medium hover:from-red-700 hover:to-red-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-black rounded-lg flex items-center justify-center">
                <Shirt className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Outfit Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('wardrobe')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === 'wardrobe'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Wardrobe
          </button>
          <button
            onClick={() => setActiveTab('creator')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === 'creator'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Creator
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            History
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* Wardrobe Tab */}
        {activeTab === 'wardrobe' && (
          <>
            {/* Categories */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Categories</h2>
                <label className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {categories.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                      activeCategory === key
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-8 h-8 mb-2" />
                    <span className="font-medium">{label}</span>
                    <span className="text-sm opacity-75">{outfits[key].length} items</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Items Grid */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">
                Your {categories.find(c => c.key === activeCategory)?.label}
              </h2>
              
              {outfits[activeCategory].length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No items yet. Upload your first {activeCategory}!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {outfits[activeCategory].map((item) => (
                    <div key={item.id} className="group relative bg-gray-50 rounded-lg overflow-hidden hover:scale-105 transition-transform">
                      <div className="aspect-square">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="absolute top-2 right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleFavorite(activeCategory, item.id)}
                          className={`p-2 rounded-full ${
                            item.isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
                          }`}
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => addToOutfit(activeCategory, item)}
                          className="bg-white/90 text-gray-600 p-2 rounded-full hover:bg-green-500 hover:text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeItem(activeCategory, item.id)}
                          className="bg-white/90 text-gray-600 p-2 rounded-full hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-3">
                        <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Outfit Creator Tab */}
        {activeTab === 'creator' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Create Your Outfit</h2>
              <button
                onClick={saveOutfit}
                disabled={!Object.values(currentOutfit).some(item => item !== null)}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Save Outfit</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {['shirt', 'pants', 'shoes'].map((category) => (
                <div key={category} className="text-center">
                  <h3 className="font-medium text-gray-700 mb-3 capitalize">{category}</h3>
                  <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative">
                    {currentOutfit[category] ? (
                      <>
                        <img
                          src={currentOutfit[category].image}
                          alt={currentOutfit[category].name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeFromOutfit(category)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="text-gray-400">
                        <Plus className="w-8 h-8" />
                        <p className="text-sm mt-2">Add {category}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Saved Outfits</h2>
            
            {outfitHistory.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No saved outfits yet. Create your first outfit!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {outfitHistory.map((outfit) => (
                  <div key={outfit.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-gray-900">{outfit.name}</h3>
                      <span className="text-sm text-gray-500">{outfit.createdDate}</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {Object.entries(outfit.items).map(([key, item]) => (
                        <div key={key} className="aspect-square bg-gray-100 rounded">
                          {item ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Plus className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => loadOutfit(outfit)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                    >
                      Load Outfit
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutfitManager;