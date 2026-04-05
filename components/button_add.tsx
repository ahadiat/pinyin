import { useState } from 'react';
import { Plus, Type, MessageSquare, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: <Type size={20} />, label: 'Word', to: '/add-word', color: 'bg-blue-500' },
    { icon: <MessageSquare size={20} />, label: 'Phrase', to: '/add-phrase', color: 'bg-green-500' },
    { icon: <Layers size={20} />, label: 'New Deck', to: '/add-deck', color: 'bg-purple-500' },
  ];

  return (
    <div className="fixed bottom-8 right-6 flex flex-col items-end gap-3">
      
      {/* Drop-up Menu Items */}
      <div className={`flex flex-col items-end gap-3 transition-all duration-300 transform ${
        isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-50 pointer-events-none'
      }`}>
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.to}
            className="flex items-center gap-3 group"
          >
            <span className="bg-slate-800 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              {item.label}
            </span>
            <div className={`${item.color} text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform`}>
              {item.icon}
            </div>
          </Link>
        ))}
      </div>

      {/* Main Toggle Button */}
      <div className="flex flex-col items-end gap-2">
        {!isOpen && (
           <span className="bg-slate-800 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
            Add New
          </span>
        )}
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`bg-orange-500 hover:bg-orange-600 text-white p-5 rounded-full shadow-xl 
                     transition-all duration-300 active:scale-90 flex items-center justify-center 
                     ${isOpen ? 'rotate-45 bg-red-500' : 'rotate-0'}`}
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      </div>

      {/* Backdrop (Optional: clicks outside to close) */}
      {isOpen && (
        <div 
          className="fixed inset-0 -z-10 bg-black/5" 
          onClick={() => setIsOpen(false)} 
        />
      )}
    </div>
  );
};

export default FloatingActionButton;