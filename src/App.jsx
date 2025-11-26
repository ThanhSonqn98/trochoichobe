import React, { useState, useEffect, useRef } from 'react';
// Import các icon
import { Star, ArrowLeft, RefreshCw, Check, X, Trophy, Smile, ShieldAlert, Zap, Clock, Palette, Circle, Square, Triangle, Hexagon, Box, Database, Filter, CreditCard, Utensils, Brain, Volume2, VolumeX } from 'lucide-react';

// --- HỆ THỐNG ÂM THANH (Web Audio API - Không cần file ngoài) ---
const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || window.webkitAudioContext)() : null;

const playSound = (type) => {
  if (!audioCtx) return;
  // Resume context nếu bị browser chặn (chỉ chạy lần đầu click)
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  if (type === 'correct') {
    // Tiếng Ting Ting (Cao, vui)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.5);
    
    // Hiệu ứng phụ cho tiếng vang hơn
    setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
        gain2.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc2.start(audioCtx.currentTime);
        osc2.stop(audioCtx.currentTime + 0.3);
    }, 100);

  } else if (type === 'wrong') {
    // Tiếng Bụp (Trầm, báo sai nhẹ nhàng)
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.2);
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);

  } else if (type === 'click') {
    // Tiếng Click (Nhẹ)
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    gainNode.gain.setValueAtTime(0.02, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.05);
  }
};

// --- Cấu hình dữ liệu trò chơi ---

// Dữ liệu Tiếng Việt
const vietnameseData = [
  { id: 1, word: 'C_n Mèo', answer: 'o', options: ['a', 'o', 'e'], image: '🐱', full: 'Con Mèo' },
  { id: 2, word: 'Cái _ế', answer: 'G', options: ['Gh', 'G', 'K'], image: '🪑', full: 'Cái Ghế' },
  { id: 3, word: 'Quả _áo', answer: 'T', options: ['C', 'T', 'D'], image: '🍎', full: 'Quả Táo' },
  { id: 4, word: 'Con _à', answer: 'G', options: ['G', 'C', 'K'], image: '🐔', full: 'Con Gà' },
  { id: 5, word: 'Bông _oa', answer: 'H', options: ['H', 'K', 'M'], image: '🌸', full: 'Bông Hoa' },
  { id: 6, word: 'Ông _ặt Trời', answer: 'M', options: ['N', 'M', 'L'], image: '☀️', full: 'Ông Mặt Trời' },
  { id: 7, word: 'Con _á', answer: 'C', options: ['K', 'C', 'T'], image: '🐟', full: 'Con Cá' },
  { id: 8, word: 'Xe _ạp', answer: 'Đ', options: ['Đ', 'D', 'B'], image: '🚲', full: 'Xe Đạp' },
];

// Dữ liệu Trí nhớ
const memoryIcons = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

// Dữ liệu Tìm bóng
const shadowData = [
  { id: 1, img: '🐘', name: 'Con Voi' },
  { id: 2, img: '🦒', name: 'Hươu Cao Cổ' },
  { id: 3, img: '🚁', name: 'Trực Thăng' },
  { id: 4, img: '🍄', name: 'Cây Nấm' },
  { id: 5, img: '🦋', name: 'Con Bướm' },
  { id: 6, img: '🦕', name: 'Khủng Long' },
];

// Dữ liệu Màu sắc & Hình khối
const shapeConfig = [
  { id: 'circle', name: 'Hình Tròn', icon: Circle },
  { id: 'square', name: 'Hình Vuông', icon: Square },
  { id: 'triangle', name: 'Hình Tam Giác', icon: Triangle },
  { id: 'star', name: 'Hình Ngôi Sao', icon: Star },
  { id: 'hexagon', name: 'Hình Lục Giác', icon: Hexagon },
];

const colorConfig = [
  { id: 'red', name: 'Màu Đỏ', class: 'text-red-500 fill-red-500', hex: '#ef4444' },
  { id: 'blue', name: 'Màu Xanh Dương', class: 'text-blue-500 fill-blue-500', hex: '#3b82f6' },
  { id: 'green', name: 'Màu Xanh Lá', class: 'text-green-500 fill-green-500', hex: '#22c55e' },
  { id: 'yellow', name: 'Màu Vàng', class: 'text-yellow-400 fill-yellow-400', hex: '#facc15' },
  { id: 'purple', name: 'Màu Tím', class: 'text-purple-500 fill-purple-500', hex: '#a855f7' },
  { id: 'orange', name: 'Màu Cam', class: 'text-orange-500 fill-orange-500', hex: '#f97316' },
];

// Dữ liệu Phân loại Màu sắc
const sortingItems = [
  { item: '🍎', colorId: 'red' }, { item: '🍓', colorId: 'red' }, { item: '🌹', colorId: 'red' }, { item: '🚒', colorId: 'red' },
  { item: '🐳', colorId: 'blue' }, { item: '🧢', colorId: 'blue' }, { item: '🚙', colorId: 'blue' }, { item: '💎', colorId: 'blue' },
  { item: '🐸', colorId: 'green' }, { item: '🥦', colorId: 'green' }, { item: '🍀', colorId: 'green' }, { item: '🐢', colorId: 'green' },
  { item: '🌻', colorId: 'yellow' }, { item: '🍌', colorId: 'yellow' }, { item: '🍋', colorId: 'yellow' }, { item: '🐤', colorId: 'yellow' },
];

// Dữ liệu Hình khối 3D
const shapes3D = [
  { id: 'sphere', name: 'Hình Cầu', items: ['⚽', '🏀', '🍊', '🌍', '🎱'], desc: 'Tròn vo như quả bóng' },
  { id: 'cube', name: 'Hình Lập Phương', items: ['📦', '🎁', '🎲', '🧊', '🟫'], desc: 'Vuông vắn như hộp quà' },
  { id: 'cylinder', name: 'Hình Trụ', items: ['🥤', '🛢️', '🔋', '🕯️', '🧴'], desc: 'Dài dài như lon nước' },
  { id: 'cone', name: 'Hình Nón', items: ['🍦', '🎉', '🎄', '🥕'], desc: 'Nhọn nhọn như nón sinh nhật' },
];

// Dữ liệu Hình Cơ Bản
const basicShapesData = [
  { id: 'circle', name: 'Hình Tròn', icon: Circle, color: 'text-red-500' },
  { id: 'square', name: 'Hình Vuông', icon: Square, color: 'text-blue-500' },
  { id: 'triangle', name: 'Hình Tam Giác', icon: Triangle, color: 'text-green-500' },
  { id: 'rectangle', name: 'Hình Chữ Nhật', icon: CreditCard, color: 'text-orange-500' },
  { id: 'cylinder', name: 'Hình Trụ', icon: Database, color: 'text-purple-500' },
];

// Dữ liệu Cho Thú Ăn
const feedingData = [
  { id: 1, animal: '🐰', food: '🥕', wrong: ['🦴', '🍌', '🐟'], name: 'Bạn Thỏ' },
  { id: 2, animal: '🐵', food: '🍌', wrong: ['🐟', '🧀', '🥕'], name: 'Bạn Khỉ' },
  { id: 3, animal: '🐶', food: '🦴', wrong: ['🌿', '🥕', '🍌'], name: 'Bạn Chó' },
  { id: 4, animal: '🐱', food: '🐟', wrong: ['🍌', '🦴', '🌿'], name: 'Bạn Mèo' },
  { id: 5, animal: '🐮', food: '🌿', wrong: ['🐟', '🧀', '🦴'], name: 'Bạn Bò' },
  { id: 6, animal: '🐭', food: '🧀', wrong: ['🌿', '🥕', '🐟'], name: 'Bạn Chuột' },
];

// Dữ liệu Tìm Quy Luật
const logicData = [
  { id: 1, sequence: ['🔴', '🔵', '🔴', '🔵', '🔴'], answer: '🔵', options: ['🔵', '🔴', '🟢'] },
  { id: 2, sequence: ['🍎', '🍌', '🍎', '🍌', '🍎'], answer: '🍌', options: ['🍇', '🍌', '🍎'] },
  { id: 3, sequence: ['🐶', '🐱', '🐶', '🐱', '🐶'], answer: '🐱', options: ['🐭', '🐱', '🐶'] },
  { id: 4, sequence: ['☀️', '☁️', '☀️', '☁️', '☀️'], answer: '☁️', options: ['🌧️', '☁️', '☀️'] },
  { id: 5, sequence: ['A', 'B', 'A', 'B', 'A'], answer: 'B', options: ['C', 'B', 'A'] },
  { id: 6, sequence: ['🔺', '🔻', '🔺', '🔻', '🔺'], answer: '🔻', options: ['🟦', '🔻', '🔺'] },
];

// --- Components Con ---

const Button = ({ onClick, children, className = "", color = "blue" }) => {
  const baseStyle = "transform active:scale-95 transition-all duration-200 font-bold rounded-2xl shadow-[0_6px_0_rgb(0,0,0,0.2)] active:shadow-[0_2px_0_rgb(0,0,0,0.2)] active:translate-y-[4px] py-4 px-6 text-white text-xl flex items-center justify-center gap-2";
  
  const colors = {
    blue: "bg-blue-500 hover:bg-blue-400",
    green: "bg-green-500 hover:bg-green-400",
    red: "bg-red-500 hover:bg-red-400",
    yellow: "bg-yellow-400 hover:bg-yellow-300 text-yellow-900",
    purple: "bg-purple-500 hover:bg-purple-400",
    orange: "bg-orange-500 hover:bg-orange-400",
    pink: "bg-pink-500 hover:bg-pink-400",
    teal: "bg-teal-500 hover:bg-teal-400",
    indigo: "bg-indigo-600 hover:bg-indigo-500",
    slate: "bg-slate-600 hover:bg-slate-500",
    rose: "bg-rose-500 hover:bg-rose-400",
    cyan: "bg-cyan-500 hover:bg-cyan-400",
    lime: "bg-lime-500 hover:bg-lime-400",
    amber: "bg-amber-500 hover:bg-amber-400",
    fuchsia: "bg-fuchsia-500 hover:bg-fuchsia-400",
  };

  const handleClick = (e) => {
    playSound('click');
    if (onClick) onClick(e);
  };

  return (
    <button onClick={handleClick} className={`${baseStyle} ${colors[color]} ${className}`}>
      {children}
    </button>
  );
};

// --- Màn hình Chính ---

const MainMenu = ({ onSelectGame }) => (
  <div className="flex flex-col items-center justify-center min-h-full space-y-8 animate-fade-in p-4 pb-20">
    <div className="text-center space-y-2 mt-4">
      <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 drop-shadow-md pb-2">
        Bé Vui Học
      </h1>
      <p className="text-xl text-gray-600 font-medium">Hành trang vào lớp 1</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-7xl px-4">
      {[
        { id: 'math', icon: '🔢', title: 'Toán Học Vui', color: 'blue' },
        { id: 'vietnamese', icon: 'abc', title: 'Tiếng Việt', color: 'green' },
        { id: 'memory', icon: '🧩', title: 'Trí Nhớ', color: 'orange' },
        { id: 'comparison', icon: '⚖️', title: 'So Sánh', color: 'pink' },
        { id: 'shadow', icon: '🔦', title: 'Tìm Bóng', color: 'teal' },
        { id: 'colorshape', icon: <Palette size={32}/>, title: 'Họa Sĩ Nhí', color: 'rose' },
        { id: 'colorsort', icon: '🎨', title: 'Phân Loại Màu', color: 'indigo' },
        { id: 'shape3d', icon: <Box size={32}/>, title: 'Hình Khối 3D', color: 'cyan' },
        { id: 'basicshape', icon: <Square size={32}/>, title: 'Thế Giới Hình Học', color: 'lime' },
        { id: 'feeding', icon: <Utensils size={32}/>, title: 'Bữa Ăn Vui Vẻ', color: 'amber' },
        { id: 'logic', icon: <Brain size={32}/>, title: 'Tìm Quy Luật', color: 'fuchsia' },
      ].map(game => (
        <div 
          key={game.id}
          onClick={() => { playSound('click'); onSelectGame(game.id); }}
          className={`cursor-pointer group bg-white border-4 border-${game.color}-200 hover:border-${game.color}-400 rounded-3xl p-6 flex flex-col items-center gap-4 shadow-xl transition-all hover:-translate-y-2`}
        >
          <div className={`w-16 h-16 bg-${game.color}-100 rounded-full flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform text-${game.color}-600`}>
            {game.icon}
          </div>
          <h2 className={`text-lg font-bold text-${game.color}-600 text-center`}>{game.title}</h2>
        </div>
      ))}

      <div onClick={() => { playSound('click'); onSelectGame('thief'); }} className="cursor-pointer group bg-slate-800 border-4 border-yellow-400 hover:border-yellow-300 rounded-3xl p-6 flex flex-col items-center gap-4 shadow-xl transition-all hover:-translate-y-2 ring-4 ring-offset-2 ring-slate-800/20">
        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform animate-pulse-slow">🦝</div>
        <h2 className="text-lg font-bold text-yellow-400">Cảnh Sát Tí Hon</h2>
      </div>
    </div>
  </div>
);

// --- Game Logic Components ---

const MathGame = ({ onBack, addScore }) => {
  const [question, setQuestion] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [streak, setStreak] = useState(0);

  const generateQuestion = () => {
    const isAddition = Math.random() > 0.4;
    let a, b, result, operator;
    if (isAddition) {
      a = Math.floor(Math.random() * 6); b = Math.floor(Math.random() * 5) + 1; result = a + b; operator = '+';
    } else {
      a = Math.floor(Math.random() * 6) + 4; b = Math.floor(Math.random() * a); result = a - b; operator = '-';
    }
    let options = new Set([result]);
    while (options.size < 3) {
      let fake = result + Math.floor(Math.random() * 5) - 2;
      if (fake >= 0 && fake !== result) options.add(fake);
    }
    setQuestion({ a, b, result, operator, options: Array.from(options).sort(() => Math.random() - 0.5) });
    setFeedback(null);
  };
  useEffect(() => { generateQuestion(); }, []);
  const handleAnswer = (ans) => {
    if (feedback) return;
    if (ans === question.result) {
      playSound('correct');
      setFeedback('correct'); addScore(10); setStreak(s => s + 1); setTimeout(generateQuestion, 1500);
    } else {
      playSound('wrong');
      setFeedback('wrong'); setStreak(0); setTimeout(() => setFeedback(null), 1000);
    }
  };
  if (!question) return <div>Loading...</div>;
  return (
    <div className="flex flex-col items-center h-full max-w-2xl mx-auto pt-4 px-4">
      <div className="flex justify-between w-full items-center mb-6">
        <Button onClick={onBack} color="purple" className="!py-2 !px-4 text-sm"><ArrowLeft size={20} /> Menu</Button>
        <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2"><Star className="fill-yellow-500 text-yellow-500" /> Chuỗi: {streak}</div>
      </div>
      <div className="bg-white rounded-3xl shadow-xl p-6 w-full border-b-8 border-blue-200 relative overflow-hidden">
        {feedback === 'correct' && <div className="absolute inset-0 bg-green-100/95 flex items-center justify-center z-20 flex-col animate-bounce-in"><Check size={80} className="text-green-500 mb-2" /><span className="text-3xl font-bold text-green-600">Đúng rồi!</span></div>}
        {feedback === 'wrong' && <div className="absolute inset-0 bg-red-100/95 flex items-center justify-center z-20 flex-col animate-shake"><X size={80} className="text-red-500 mb-2" /><span className="text-3xl font-bold text-red-600">Sai rồi!</span></div>}
        <div className="flex items-center justify-center gap-2 sm:gap-4 text-6xl sm:text-7xl font-bold text-slate-700 mb-8">
            <div className="flex flex-col items-center"><span className="text-blue-500">{question.a}</span><div className="flex mt-2 gap-1 flex-wrap justify-center w-20 h-12 content-start">{[...Array(question.a)].map((_, i) => <div key={i} className="w-3 h-3 bg-blue-400 rounded-full"></div>)}</div></div>
            <span className="text-gray-400 mb-12">{question.operator}</span>
            <div className="flex flex-col items-center"><span className="text-purple-500">{question.b}</span><div className="flex mt-2 gap-1 flex-wrap justify-center w-20 h-12 content-start">{[...Array(question.b)].map((_, i) => <div key={i} className="w-3 h-3 bg-purple-400 rounded-full"></div>)}</div></div>
            <span className="text-gray-400 mb-12">=</span>
            <span className="w-20 h-24 border-4 border-dashed border-gray-300 rounded-2xl flex items-center justify-center text-gray-300 mb-12">?</span>
        </div>
        <div className="grid grid-cols-3 gap-4">{question.options.map((opt, idx) => (<Button key={idx} onClick={() => handleAnswer(opt)} color="blue" className="text-4xl !py-6">{opt}</Button>))}</div>
      </div>
    </div>
  );
};

const VietnameseGame = ({ onBack, addScore }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const currentQ = vietnameseData[currentIdx];
  const handleAnswer = (opt) => {
    if (feedback) return;
    if (opt === currentQ.answer) {
      playSound('correct');
      setFeedback('correct'); addScore(10); setTimeout(() => { setFeedback(null); setCurrentIdx((prev) => (prev + 1) % vietnameseData.length); }, 1500);
    } else { 
      playSound('wrong');
      setFeedback('wrong'); setTimeout(() => setFeedback(null), 1000); 
    }
  };
  return (
    <div className="flex flex-col items-center h-full max-w-2xl mx-auto pt-4 px-4">
      <div className="flex justify-between w-full items-center mb-6">
        <Button onClick={onBack} color="green" className="!py-2 !px-4 text-sm"><ArrowLeft size={20} /> Menu</Button>
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold">{currentIdx + 1}/{vietnameseData.length}</div>
      </div>
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full border-b-8 border-green-200 flex flex-col items-center relative overflow-hidden">
         {feedback === 'correct' && <div className="absolute inset-0 bg-green-100/95 flex items-center justify-center z-20 flex-col animate-bounce-in"><span className="text-6xl mb-4">{currentQ.image}</span><span className="text-3xl font-bold text-green-600">{currentQ.full}</span></div>}
        {feedback === 'wrong' && <div className="absolute inset-0 bg-red-100/95 flex items-center justify-center z-20 flex-col animate-shake"><span className="text-3xl font-bold text-red-600">Sai rồi!</span></div>}
        <div className="text-9xl mb-6 animate-pulse-slow">{currentQ.image}</div>
        <div className="text-5xl font-bold text-slate-700 mb-8 bg-gray-100 px-8 py-4 rounded-2xl border-2 border-gray-200">{currentQ.word}</div>
        <div className="grid grid-cols-3 gap-4 w-full">{currentQ.options.map((opt, idx) => (<Button key={idx} onClick={() => handleAnswer(opt)} color="green" className="text-3xl !py-4">{opt}</Button>))}</div>
      </div>
    </div>
  );
};

const MemoryGame = ({ onBack, addScore }) => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [disabled, setDisabled] = useState(false);
  useEffect(() => { shuffleCards(); }, []);
  const shuffleCards = () => {
    const selectedIcons = [...memoryIcons].sort(() => 0.5 - Math.random()).slice(0, 6);
    const deck = [...selectedIcons, ...selectedIcons].sort(() => 0.5 - Math.random()).map((icon, id) => ({ id, icon }));
    setCards(deck); setFlipped([]); setMatched([]); setDisabled(false);
  };
  const handleClick = (id) => {
    if (disabled || flipped.includes(id) || matched.includes(id)) return;
    playSound('click');
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setDisabled(true);
      const [firstId, secondId] = newFlipped;
      if (cards.find(c => c.id === firstId).icon === cards.find(c => c.id === secondId).icon) {
        playSound('correct');
        setMatched(prev => [...prev, firstId, secondId]); setFlipped([]); setDisabled(false); addScore(20);
      } else { 
        // Không đúng thì không kêu hoặc kêu nhẹ
        setTimeout(() => { setFlipped([]); setDisabled(false); }, 1000); 
      }
    }
  };
  const isWin = matched.length === cards.length && cards.length > 0;
  return (
    <div className="flex flex-col items-center h-full pt-4 px-4 w-full max-w-3xl mx-auto">
      <div className="flex justify-between w-full items-center mb-6">
        <Button onClick={onBack} color="orange" className="!py-2 !px-4 text-sm"><ArrowLeft size={20} /> Menu</Button>
        <Button onClick={shuffleCards} color="orange" className="!py-2 !px-4 text-sm bg-orange-400"><RefreshCw size={20} /> Chơi lại</Button>
      </div>
      {isWin ? <div className="flex flex-col items-center justify-center bg-white p-8 rounded-3xl shadow-xl animate-bounce-in border-4 border-orange-300"><Trophy size={80} className="text-yellow-500 mb-4" /><h2 className="text-3xl font-bold text-orange-600 mb-2">Chiến thắng!</h2><Button onClick={shuffleCards} color="orange">Chơi ván mới</Button></div> : <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full aspect-[3/4] sm:aspect-auto">{cards.map((card) => { const isFlipped = flipped.includes(card.id) || matched.includes(card.id); const isMatched = matched.includes(card.id); return (<div key={card.id} onClick={() => handleClick(card.id)} className={`aspect-square rounded-2xl cursor-pointer flex items-center justify-center text-4xl transition-all duration-500 transform ${isFlipped ? 'rotate-y-180 bg-white border-4 border-orange-400' : 'bg-orange-500 border-4 border-orange-600'} ${isMatched ? 'opacity-50 scale-95 border-green-400 bg-green-50' : ''} shadow-lg`} style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}>{isFlipped ? <span className="animate-fade-in">{card.icon}</span> : <span className="text-white/50 font-bold">?</span>}</div>); })}</div>}
    </div>
  );
};

const ComparisonGame = ({ onBack, addScore }) => {
  const [data, setData] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const generateLevel = () => {
    const a = Math.floor(Math.random() * 10) + 1; let b = Math.floor(Math.random() * 10) + 1;
    if (Math.random() > 0.8) b = a; 
    setData({ a, b }); setFeedback(null);
  };
  useEffect(() => { generateLevel(); }, []);
  const checkAnswer = (operator) => {
    if (feedback) return;
    const { a, b } = data; let correct = false;
    if (operator === '>' && a > b) correct = true; if (operator === '<' && a < b) correct = true; if (operator === '=' && a === b) correct = true;
    if (correct) { 
      playSound('correct');
      setFeedback('correct'); addScore(10); setTimeout(generateLevel, 1500); 
    } else { 
      playSound('wrong');
      setFeedback('wrong'); setTimeout(() => setFeedback(null), 1000); 
    }
  };
  if (!data) return <div>Loading...</div>;
  return (
    <div className="flex flex-col items-center h-full max-w-2xl mx-auto pt-4 px-4">
      <div className="flex justify-between w-full items-center mb-6">
        <Button onClick={onBack} color="pink" className="!py-2 !px-4 text-sm"><ArrowLeft size={20} /> Menu</Button>
      </div>
      <div className="bg-white rounded-3xl shadow-xl p-6 w-full border-b-8 border-pink-200 relative overflow-hidden">
        {feedback === 'correct' && <div className="absolute inset-0 bg-green-100/95 flex items-center justify-center z-20 flex-col animate-bounce-in"><Check size={80} className="text-green-500 mb-2" /><span className="text-3xl font-bold text-green-600">Đúng rồi!</span></div>}
        {feedback === 'wrong' && <div className="absolute inset-0 bg-red-100/95 flex items-center justify-center z-20 flex-col animate-shake"><span className="text-3xl font-bold text-red-600">Thử lại nhé!</span></div>}
        <div className="flex justify-around items-end mb-8 h-48">
          <div className="flex flex-col items-center gap-2 w-1/3"><div className="flex flex-wrap justify-center content-end gap-1 h-32">{[...Array(data.a)].map((_, i) => <div key={i} className="text-3xl">🍎</div>)}</div><span className="text-4xl font-bold text-pink-600 border-2 border-pink-200 w-12 h-12 flex items-center justify-center rounded-full bg-pink-50">{data.a}</span></div>
          <div className="w-1/3 flex justify-center pb-2"><div className="bg-gray-100 w-16 h-16 rounded-xl flex items-center justify-center text-4xl font-bold text-gray-400">?</div></div>
          <div className="flex flex-col items-center gap-2 w-1/3"><div className="flex flex-wrap justify-center content-end gap-1 h-32">{[...Array(data.b)].map((_, i) => <div key={i} className="text-3xl">🍏</div>)}</div><span className="text-4xl font-bold text-green-600 border-2 border-green-200 w-12 h-12 flex items-center justify-center rounded-full bg-green-50">{data.b}</span></div>
        </div>
        <div className="flex justify-center gap-4"><Button onClick={() => checkAnswer('>')} color="pink" className="text-4xl w-20 h-20 !p-0">&gt;</Button><Button onClick={() => checkAnswer('=')} color="pink" className="text-4xl w-20 h-20 !p-0">=</Button><Button onClick={() => checkAnswer('<')} color="pink" className="text-4xl w-20 h-20 !p-0">&lt;</Button></div>
      </div>
    </div>
  );
};

const ShadowGame = ({ onBack, addScore }) => {
  const [currentLevel, setCurrentLevel] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const generateLevel = () => {
    const target = shadowData[Math.floor(Math.random() * shadowData.length)];
    let options = [target];
    while (options.length < 3) {
      const randomItem = shadowData[Math.floor(Math.random() * shadowData.length)];
      if (!options.find(o => o.id === randomItem.id)) options.push(randomItem);
    }
    options = options.sort(() => Math.random() - 0.5);
    setCurrentLevel({ target, options }); setFeedback(null);
  };
  useEffect(() => { generateLevel(); }, []);
  const handleAnswer = (item) => {
    if (feedback) return;
    if (item.id === currentLevel.target.id) {
      playSound('correct');
      setFeedback('correct'); addScore(10); setTimeout(generateLevel, 1500);
    } else { 
      playSound('wrong');
      setFeedback('wrong'); setTimeout(() => setFeedback(null), 1000); 
    }
  };
  if (!currentLevel) return <div>Loading...</div>;
  return (
    <div className="flex flex-col items-center h-full max-w-2xl mx-auto pt-4 px-4">
      <div className="flex justify-between w-full items-center mb-6">
        <Button onClick={onBack} color="teal" className="!py-2 !px-4 text-sm"><ArrowLeft size={20} /> Menu</Button>
      </div>
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full border-b-8 border-teal-200 flex flex-col items-center relative overflow-hidden">
        {feedback === 'correct' && <div className="absolute inset-0 bg-green-100/95 flex items-center justify-center z-20 flex-col animate-bounce-in"><span className="text-6xl mb-4">{currentLevel.target.img}</span><span className="text-3xl font-bold text-green-600">Chính xác!</span></div>}
        {feedback === 'wrong' && <div className="absolute inset-0 bg-red-100/95 flex items-center justify-center z-20 flex-col animate-shake"><span className="text-3xl font-bold text-red-600">Tìm lại nhé!</span></div>}
        <div className="mb-8 p-6 bg-teal-50 rounded-full w-40 h-40 flex items-center justify-center border-4 border-teal-100"><span className="text-8xl drop-shadow-md">{currentLevel.target.img}</span></div>
        <p className="text-teal-800 font-bold mb-6 text-xl">Đâu là bóng của bạn ấy?</p>
        <div className="grid grid-cols-3 gap-6 w-full">{currentLevel.options.map((opt, idx) => (<button key={idx} onClick={() => handleAnswer(opt)} className="bg-gray-200 hover:bg-gray-300 rounded-2xl p-4 flex items-center justify-center h-32 w-full transition-transform active:scale-95 shadow-md"><span className="text-6xl filter brightness-0 opacity-80">{opt.img}</span></button>))}</div>
      </div>
    </div>
  );
};

const ThiefGame = ({ onBack, addScore }) => {
  const [grid, setGrid] = useState(Array(9).fill(null)); 
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef(null);
  const gameLoopRef = useRef(null);

  const startGame = () => {
    playSound('click');
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(30);
    setGrid(Array(9).fill(null));

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    gameLoopRef.current = setInterval(() => {
      spawnCharacter();
    }, 700); 
  };

  const endGame = () => {
    clearInterval(timerRef.current);
    clearInterval(gameLoopRef.current);
    setIsPlaying(false);
    addScore(score); 
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(gameLoopRef.current);
    };
  }, []);

  const spawnCharacter = () => {
    setGrid(prev => {
      const newGrid = Array(9).fill(null);
      const thiefIndex = Math.floor(Math.random() * 9);
      newGrid[thiefIndex] = 'thief';
      if (Math.random() > 0.6) {
        let otherIndex;
        do { otherIndex = Math.floor(Math.random() * 9); } while (otherIndex === thiefIndex);
        newGrid[otherIndex] = Math.random() > 0.5 ? 'police' : 'civilian';
      }
      return newGrid;
    });
  };

  const handleTap = (index, type) => {
    if (!isPlaying || !type) return;
    if (type === 'thief') {
      playSound('correct');
      setScore(s => s + 10);
      setGrid(prev => { const next = [...prev]; next[index] = 'caught'; return next; });
    } else if (type === 'police' || type === 'civilian') {
      playSound('wrong');
      setScore(s => Math.max(0, s - 5)); 
      setGrid(prev => { const next = [...prev]; next[index] = 'wrong'; return next; });
    }
  };

  const renderContent = (type) => {
    if (type === 'thief') return <span className="text-5xl animate-bounce-in">🦝</span>;
    if (type === 'police') return <span className="text-5xl animate-fade-in">👮</span>;
    if (type === 'civilian') return <span className="text-5xl animate-fade-in">🐶</span>;
    if (type === 'caught') return <span className="text-5xl animate-ping">💥</span>;
    if (type === 'wrong') return <span className="text-5xl">🚫</span>;
    return null;
  };

  return (
    <div className="flex flex-col items-center h-full max-w-2xl mx-auto pt-4 px-4 bg-slate-900 rounded-xl min-h-[500px] shadow-2xl border-4 border-slate-700">
      <div className="flex justify-between w-full items-center mb-6 mt-4">
        <Button onClick={onBack} color="slate" className="!py-2 !px-4 text-sm border border-slate-500"><ArrowLeft size={20} /> Thoát</Button>
        <div className="flex gap-4">
           <div className="bg-yellow-500 text-slate-900 px-4 py-2 rounded-xl font-bold flex items-center gap-2"><Zap size={20} /> {score}</div>
          <div className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 ${timeLeft < 10 ? 'bg-red-500 animate-pulse text-white' : 'bg-slate-700 text-white'}`}><Clock size={20} /> {timeLeft}s</div>
        </div>
      </div>
      {!isPlaying && timeLeft === 0 ? (
        <div className="flex flex-col items-center justify-center h-full animate-bounce-in bg-slate-800 p-8 rounded-3xl border-4 border-yellow-400">
          <Trophy size={80} className="text-yellow-400 mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Hết giờ!</h2>
          <p className="text-slate-300 mb-6 text-xl">Bé bắt được: {score / 10} tên trộm</p>
          <Button onClick={startGame} color="yellow" className="text-slate-900">Chơi lại ngay</Button>
        </div>
      ) : !isPlaying ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <ShieldAlert size={80} className="text-yellow-400 mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Nhiệm Vụ Cảnh Sát</h2>
          <Button onClick={startGame} color="yellow" className="text-slate-900 animate-pulse">Bắt đầu ngay!</Button>
        </div>
      ) : (
        <div className="w-full max-w-sm">
           <div className="grid grid-cols-3 gap-3 md:gap-4">
            {grid.map((cellType, idx) => (
              <div key={idx} onMouseDown={() => handleTap(idx, cellType)} onTouchStart={(e) => { e.preventDefault(); handleTap(idx, cellType); }} className={`aspect-square bg-slate-800 rounded-2xl border-b-8 border-slate-950 shadow-inner flex items-center justify-center relative overflow-hidden cursor-pointer active:border-b-0 active:translate-y-2 transition-all ${cellType === 'caught' ? 'bg-yellow-200' : ''} ${cellType === 'wrong' ? 'bg-red-200' : ''}`}>
                 <div className="absolute bottom-0 w-full h-2 bg-slate-700/50 rounded-full blur-sm mb-2"></div>
                 {renderContent(cellType)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ColorShapeGame = ({ onBack, addScore }) => {
  const [level, setLevel] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const generateLevel = () => {
    const targetShape = shapeConfig[Math.floor(Math.random() * shapeConfig.length)];
    const targetColor = colorConfig[Math.floor(Math.random() * colorConfig.length)];
    let options = [];
    const correctOption = { id: 'correct', shape: targetShape, color: targetColor };
    options.push(correctOption);

    while (options.length < 4) {
      const randShape = shapeConfig[Math.floor(Math.random() * shapeConfig.length)];
      const randColor = colorConfig[Math.floor(Math.random() * colorConfig.length)];
      if (randShape.id !== targetShape.id || randColor.id !== targetColor.id) {
         const isDuplicate = options.some(o => o.shape.id === randShape.id && o.color.id === randColor.id);
         if (!isDuplicate) options.push({ id: `wrong-${options.length}`, shape: randShape, color: randColor });
      }
    }
    setLevel({ target: { shape: targetShape, color: targetColor }, options: options.sort(() => Math.random() - 0.5) });
    setFeedback(null);
  };
  useEffect(() => { generateLevel(); }, []);
  const handleAnswer = (option) => {
    if (feedback) return;
    if (option.id === 'correct') {
      playSound('correct');
      setFeedback('correct'); addScore(10); setTimeout(generateLevel, 1500);
    } else { 
      playSound('wrong');
      setFeedback('wrong'); setTimeout(() => setFeedback(null), 1000); 
    }
  };
  if (!level) return <div>Loading...</div>;
  return (
    <div className="flex flex-col items-center h-full max-w-2xl mx-auto pt-4 px-4">
      <div className="flex justify-between w-full items-center mb-6">
        <Button onClick={onBack} color="rose" className="!py-2 !px-4 text-sm"><ArrowLeft size={20} /> Menu</Button>
      </div>
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full border-b-8 border-rose-200 flex flex-col items-center relative overflow-hidden">
        {feedback === 'correct' && <div className="absolute inset-0 bg-green-100/95 flex items-center justify-center z-20 flex-col animate-bounce-in"><Check size={80} className="text-green-500 mb-2" /><span className="text-3xl font-bold text-green-600">Tuyệt vời!</span></div>}
        {feedback === 'wrong' && <div className="absolute inset-0 bg-red-100/95 flex items-center justify-center z-20 flex-col animate-shake"><span className="text-3xl font-bold text-red-600">Thử lại nhé!</span></div>}
        <h2 className="text-2xl font-bold text-slate-700 text-center mb-8 leading-relaxed">Bé hãy tìm: <br/><span className={`${level.target.color.class.split(' ')[0]} text-3xl`}>{level.target.shape.name} {level.target.color.name.replace('Màu ', 'màu ')}</span></h2>
        <div className="grid grid-cols-2 gap-6 w-full max-w-xs">{level.options.map((opt, idx) => { const Icon = opt.shape.icon; return (<button key={idx} onClick={() => handleAnswer(opt)} className="bg-slate-50 border-4 border-slate-100 hover:border-rose-300 rounded-3xl p-6 flex items-center justify-center aspect-square shadow-md transition-all active:scale-95"><Icon size={80} className={opt.color.class} strokeWidth={2.5} /></button>)})}</div>
      </div>
    </div>
  );
};

const ColorSortGame = ({ onBack, addScore }) => {
  const [currentItem, setCurrentItem] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const generateLevel = () => {
    const item = sortingItems[Math.floor(Math.random() * sortingItems.length)];
    setCurrentItem(item);
    setFeedback(null);
  };

  useEffect(() => { generateLevel(); }, []);

  const handleBucketClick = (colorId) => {
    if (feedback) return;
    if (colorId === currentItem.colorId) {
      playSound('correct');
      setFeedback('correct');
      addScore(10);
      setTimeout(generateLevel, 1500);
    } else {
      playSound('wrong');
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  if (!currentItem) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center h-full max-w-2xl mx-auto pt-4 px-4">
      <div className="flex justify-between w-full items-center mb-6">
        <Button onClick={onBack} color="indigo" className="!py-2 !px-4 text-sm"><ArrowLeft size={20} /> Menu</Button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-6 w-full border-b-8 border-indigo-200 flex flex-col items-center relative overflow-hidden">
        {feedback === 'correct' && <div className="absolute inset-0 bg-green-100/95 flex items-center justify-center z-20 flex-col animate-bounce-in"><Check size={80} className="text-green-500 mb-2" /><span className="text-3xl font-bold text-green-600">Đúng màu rồi!</span></div>}
        {feedback === 'wrong' && <div className="absolute inset-0 bg-red-100/95 flex items-center justify-center z-20 flex-col animate-shake"><span className="text-3xl font-bold text-red-600">Sai màu rồi!</span></div>}

        <h2 className="text-xl font-bold text-indigo-700 mb-4 text-center">Cho đồ vật vào đúng xô màu nhé!</h2>
        
        <div className="mb-12 animate-bounce-in">
           <span className="text-9xl drop-shadow-xl">{currentItem.item}</span>
        </div>

        <div className="flex gap-4 justify-center w-full flex-wrap">
          {['red', 'green', 'blue', 'yellow'].map((cId) => {
            const colorInfo = colorConfig.find(c => c.id === cId);
            return (
              <button 
                key={cId}
                onClick={() => handleBucketClick(cId)}
                className="flex flex-col items-center gap-2 transform active:scale-95 transition-transform"
              >
                <div 
                  className="w-20 h-24 rounded-b-2xl rounded-t-md flex items-end justify-center pb-2 border-4 border-black/10 shadow-lg relative"
                  style={{ backgroundColor: colorInfo.hex }}
                >
                   <div className="absolute -top-6 w-16 h-8 border-4 border-black/10 rounded-t-full border-b-0" style={{ borderColor: colorInfo.hex }}></div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  );
};

const Shape3DGame = ({ onBack, addScore }) => {
  const [currentLevel, setCurrentLevel] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const generateLevel = () => {
    const targetShape = shapes3D[Math.floor(Math.random() * shapes3D.length)];
    const targetItem = targetShape.items[Math.floor(Math.random() * targetShape.items.length)];
    
    let options = [targetShape];
    while (options.length < 3) {
      const randomShape = shapes3D[Math.floor(Math.random() * shapes3D.length)];
      if (!options.find(o => o.id === randomShape.id)) options.push(randomShape);
    }
    
    setCurrentLevel({
      item: targetItem,
      correctShape: targetShape,
      options: options.sort(() => Math.random() - 0.5)
    });
    setFeedback(null);
  };

  useEffect(() => { generateLevel(); }, []);

  const handleAnswer = (shapeId) => {
    if (feedback) return;
    if (shapeId === currentLevel.correctShape.id) {
      playSound('correct');
      setFeedback('correct');
      addScore(10);
      setTimeout(generateLevel, 1500);
    } else {
      playSound('wrong');
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const getShapeIcon = (id) => {
    switch(id) {
      case 'sphere': return <Circle size={40} className="text-orange-500 fill-orange-200" />;
      case 'cube': return <Box size={40} className="text-blue-500 fill-blue-200" />;
      case 'cylinder': return <Database size={40} className="text-green-500 fill-green-200" />;
      case 'cone': return <Filter size={40} className="text-purple-500 fill-purple-200" />;
      default: return <Box />;
    }
  };

  if (!currentLevel) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center h-full max-w-2xl mx-auto pt-4 px-4">
      <div className="flex justify-between w-full items-center mb-6">
        <Button onClick={onBack} color="cyan" className="!py-2 !px-4 text-sm"><ArrowLeft size={20} /> Menu</Button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 w-full border-b-8 border-cyan-200 flex flex-col items-center relative overflow-hidden">
        {feedback === 'correct' && (
          <div className="absolute inset-0 bg-green-100/95 flex items-center justify-center z-20 flex-col animate-bounce-in text-center p-4">
             <span className="text-6xl mb-4">{currentLevel.item}</span>
             <h3 className="text-3xl font-bold text-green-600 mb-2">{currentLevel.correctShape.name}</h3>
             <p className="text-green-800 text-lg">{currentLevel.correctShape.desc}</p>
          </div>
        )}
        {feedback === 'wrong' && <div className="absolute inset-0 bg-red-100/95 flex items-center justify-center z-20 flex-col animate-shake"><span className="text-3xl font-bold text-red-600">Sai rồi!</span></div>}

        <div className="mb-6">
           <span className="text-9xl drop-shadow-2xl animate-pulse-slow block transform hover:scale-110 transition-transform cursor-pointer">{currentLevel.item}</span>
        </div>
        
        <h2 className="text-xl font-bold text-cyan-800 mb-8 text-center">Đồ vật này có dạng hình gì?</h2>

        <div className="grid grid-cols-1 gap-4 w-full">
          {currentLevel.options.map((shape) => (
            <button 
              key={shape.id}
              onClick={() => handleAnswer(shape.id)}
              className="bg-cyan-50 hover:bg-cyan-100 border-2 border-cyan-200 rounded-2xl p-4 flex items-center gap-4 transition-all active:scale-95 shadow-sm"
            >
              <div className="bg-white p-2 rounded-xl border border-cyan-100">
                {getShapeIcon(shape.id)}
              </div>
              <span className="text-xl font-bold text-cyan-700">{shape.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const BasicShapeGame = ({ onBack, addScore }) => {
  const [level, setLevel] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const generateLevel = () => {
    const target = basicShapesData[Math.floor(Math.random() * basicShapesData.length)];
    let options = [target];
    while (options.length < 4) {
      const randomItem = basicShapesData[Math.floor(Math.random() * basicShapesData.length)];
      if (!options.find(o => o.id === randomItem.id)) {
        options.push(randomItem);
      }
    }
    options = options.sort(() => Math.random() - 0.5);
    setLevel({ target, options });
    setFeedback(null);
  };

  useEffect(() => { generateLevel(); }, []);

  const handleAnswer = (item) => {
    if (feedback) return;
    if (item.id === level.target.id) {
      playSound('correct');
      setFeedback('correct');
      addScore(10);
      setTimeout(generateLevel, 1500);
    } else {
      playSound('wrong');
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  if (!level) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center h-full max-w-2xl mx-auto pt-4 px-4">
      <div className="flex justify-between w-full items-center mb-6">
        <Button onClick={onBack} color="lime" className="!py-2 !px-4 text-sm">
          <ArrowLeft size={20} /> Menu
        </Button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 w-full border-b-8 border-lime-200 flex flex-col items-center relative overflow-hidden">
        {feedback === 'correct' && (
           <div className="absolute inset-0 bg-green-100/95 flex items-center justify-center z-20 flex-col animate-bounce-in">
             <Check size={80} className="text-green-500 mb-2" />
             <span className="text-3xl font-bold text-green-600">Đúng rồi!</span>
           </div>
        )}
        {feedback === 'wrong' && (
           <div className="absolute inset-0 bg-red-100/95 flex items-center justify-center z-20 flex-col animate-shake">
             <span className="text-3xl font-bold text-red-600">Thử lại nhé!</span>
           </div>
        )}

        <h2 className="text-2xl font-bold text-slate-700 mb-8 text-center">
          Bé hãy tìm: <br/>
          <span className="text-4xl text-lime-600 block mt-2">{level.target.name}</span>
        </h2>

        <div className="grid grid-cols-2 gap-6 w-full max-w-xs">
          {level.options.map((opt, idx) => {
            const Icon = opt.icon;
            return (
              <button 
                key={idx} 
                onClick={() => handleAnswer(opt)} 
                className="bg-slate-50 border-4 border-slate-100 hover:border-lime-300 rounded-3xl p-6 flex items-center justify-center aspect-square shadow-md transition-all active:scale-95 group"
              >
                <Icon size={70} className={`${opt.color} group-hover:scale-110 transition-transform`} strokeWidth={2.5} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  );
};

const FeedingGame = ({ onBack, addScore }) => {
  const [level, setLevel] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const generateLevel = () => {
    const current = feedingData[Math.floor(Math.random() * feedingData.length)];
    let options = [current.food];
    const wrongOptions = [...current.wrong].sort(() => 0.5 - Math.random()).slice(0, 2);
    options = [...options, ...wrongOptions];
    options = options.sort(() => Math.random() - 0.5);
    setLevel({ current, options });
    setFeedback(null);
  };

  useEffect(() => { generateLevel(); }, []);

  const handleAnswer = (food) => {
    if (feedback) return;
    if (food === level.current.food) {
      playSound('correct');
      setFeedback('correct');
      addScore(10);
      setTimeout(generateLevel, 1500);
    } else {
      playSound('wrong');
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  if (!level) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center h-full max-w-2xl mx-auto pt-4 px-4">
      <div className="flex justify-between w-full items-center mb-6">
        <Button onClick={onBack} color="amber" className="!py-2 !px-4 text-sm">
          <ArrowLeft size={20} /> Menu
        </Button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 w-full border-b-8 border-amber-200 flex flex-col items-center relative overflow-hidden">
        {feedback === 'correct' && (
           <div className="absolute inset-0 bg-green-100/95 flex items-center justify-center z-20 flex-col animate-bounce-in text-center">
             <span className="text-6xl mb-2">😋</span>
             <span className="text-3xl font-bold text-green-600">Ngon quá!</span>
           </div>
        )}
        {feedback === 'wrong' && (
           <div className="absolute inset-0 bg-red-100/95 flex items-center justify-center z-20 flex-col animate-shake text-center">
             <span className="text-6xl mb-2">🤢</span>
             <span className="text-3xl font-bold text-red-600">Không chịu đâu!</span>
           </div>
        )}

        <div className="text-center mb-8">
          <div className="text-9xl mb-4 animate-bounce">{level.current.animal}</div>
          <h2 className="text-2xl font-bold text-amber-800">
            {level.current.name} đói bụng quá!
          </h2>
          <p className="text-gray-500">Bé hãy chọn món ăn cho bạn ấy nhé</p>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full">
          {level.options.map((food, idx) => (
            <button 
              key={idx} 
              onClick={() => handleAnswer(food)} 
              className="bg-amber-50 border-b-4 border-amber-200 hover:border-amber-300 rounded-2xl p-4 flex items-center justify-center aspect-square shadow-sm transition-all active:scale-95 active:border-b-0 active:translate-y-1"
            >
              <span className="text-5xl">{food}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const LogicGame = ({ onBack, addScore }) => {
  const [level, setLevel] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const generateLevel = () => {
    const current = logicData[Math.floor(Math.random() * logicData.length)];
    setLevel(current);
    setFeedback(null);
  };

  useEffect(() => { generateLevel(); }, []);

  const handleAnswer = (ans) => {
    if (feedback) return;
    if (ans === level.answer) {
      playSound('correct');
      setFeedback('correct');
      addScore(10);
      setTimeout(generateLevel, 1500);
    } else {
      playSound('wrong');
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  if (!level) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center h-full max-w-2xl mx-auto pt-4 px-4">
      <div className="flex justify-between w-full items-center mb-6">
        <Button onClick={onBack} color="fuchsia" className="!py-2 !px-4 text-sm">
          <ArrowLeft size={20} /> Menu
        </Button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 w-full border-b-8 border-fuchsia-200 flex flex-col items-center relative overflow-hidden">
        {feedback === 'correct' && (
           <div className="absolute inset-0 bg-green-100/95 flex items-center justify-center z-20 flex-col animate-bounce-in text-center">
             <Check size={80} className="text-green-500 mb-4" />
             <span className="text-3xl font-bold text-green-600">Thông minh quá!</span>
           </div>
        )}
        {feedback === 'wrong' && (
           <div className="absolute inset-0 bg-red-100/95 flex items-center justify-center z-20 flex-col animate-shake text-center">
             <X size={80} className="text-red-500 mb-4" />
             <span className="text-3xl font-bold text-red-600">Thử lại nào!</span>
           </div>
        )}

        <h2 className="text-xl font-bold text-fuchsia-800 mb-6 text-center">Hình tiếp theo là gì nhỉ?</h2>

        <div className="flex justify-center gap-2 mb-8 bg-fuchsia-50 p-4 rounded-2xl w-full overflow-x-auto">
          {level.sequence.map((item, idx) => (
            <div key={idx} className="text-4xl w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm border border-fuchsia-100">
              {item}
            </div>
          ))}
          <div className="text-4xl w-12 h-12 flex items-center justify-center bg-fuchsia-200 rounded-lg shadow-inner text-fuchsia-500 font-bold">?</div>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full">
          {level.options.map((opt, idx) => (
            <button 
              key={idx} 
              onClick={() => handleAnswer(opt)} 
              className="bg-fuchsia-50 border-b-4 border-fuchsia-200 hover:border-fuchsia-300 rounded-2xl p-4 flex items-center justify-center aspect-square shadow-sm transition-all active:scale-95 active:border-b-0 active:translate-y-1"
            >
              <span className="text-4xl">{opt}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- App Tổng Thể ---

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [totalScore, setTotalScore] = useState(0);

  const addScore = (points) => {
    setTotalScore(prev => prev + points);
  };

  return (
    <div className="min-h-screen bg-[#FDF6E3] font-sans selection:bg-purple-200">
      <div className="bg-white p-3 md:p-4 shadow-sm border-b-4 border-purple-100 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
           <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
             <Smile size={24} />
           </div>
           <span className="font-bold text-purple-700 hidden sm:inline">Xin chào bé yêu!</span>
        </div>
        
        <div className="flex items-center gap-3 bg-yellow-50 px-3 py-1.5 md:py-2 md:px-4 rounded-full border border-yellow-200">
          <Trophy className="text-yellow-500 fill-yellow-500 w-5 h-5 md:w-6 md:h-6" />
          <span className="text-xl md:text-2xl font-bold text-yellow-600">{totalScore}</span>
        </div>
      </div>

      <main className="container mx-auto pb-8 h-[calc(100vh-70px)] overflow-y-auto">
        {currentScreen === 'menu' && <MainMenu onSelectGame={setCurrentScreen} />}
        {currentScreen === 'math' && <MathGame onBack={() => setCurrentScreen('menu')} addScore={addScore} />}
        {currentScreen === 'vietnamese' && <VietnameseGame onBack={() => setCurrentScreen('menu')} addScore={addScore} />}
        {currentScreen === 'memory' && <MemoryGame onBack={() => setCurrentScreen('menu')} addScore={addScore} />}
        {currentScreen === 'comparison' && <ComparisonGame onBack={() => setCurrentScreen('menu')} addScore={addScore} />}
        {currentScreen === 'shadow' && <ShadowGame onBack={() => setCurrentScreen('menu')} addScore={addScore} />}
        {currentScreen === 'thief' && <ThiefGame onBack={() => setCurrentScreen('menu')} addScore={addScore} />}
        {currentScreen === 'colorshape' && <ColorShapeGame onBack={() => setCurrentScreen('menu')} addScore={addScore} />}
        {currentScreen === 'colorsort' && <ColorSortGame onBack={() => setCurrentScreen('menu')} addScore={addScore} />}
        {currentScreen === 'shape3d' && <Shape3DGame onBack={() => setCurrentScreen('menu')} addScore={addScore} />}
        {currentScreen === 'basicshape' && <BasicShapeGame onBack={() => setCurrentScreen('menu')} addScore={addScore} />}
        {currentScreen === 'feeding' && <FeedingGame onBack={() => setCurrentScreen('menu')} addScore={addScore} />}
        {currentScreen === 'logic' && <LogicGame onBack={() => setCurrentScreen('menu')} addScore={addScore} />}
      </main>

      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .animate-bounce-in { animation: bounce-in 0.5s ease-out forwards; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        .animate-pulse-slow { animation: pulse-slow 2s infinite ease-in-out; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default App;