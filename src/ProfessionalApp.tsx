import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ChevronDown,
  MapPin, 
  Play, 
  RotateCcw, 
  Trophy, 
  Star, 
  Volume2, 
  VolumeX,
  Share2,
  Target,
  Clock,
  Github,
  HelpCircle,
  BarChart3,
  Recycle,
  Award,
  Download,
  Wifi,
  WifiOff,
  Globe
} from 'lucide-react';
import citiesData from './data/cities.json';

// Enhanced interfaces
interface Bin {
  id: string;
  color: string;
  name: string;
  icon: string;
  keywords: string[];
}

interface CityData {
  name: string;
  authority: string;
  bins: Bin[];
  recyclingRate?: number;
  population?: number;
  flag?: string;
}

interface TrashItem {
  name: string;
  emoji: string;
  correctBin: string;
  description: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface Feedback {
  type: 'success' | 'error';
  message: string;
  emoji: string;
  points?: string;
  fine?: string;
  streak?: number;
}

interface Celebration {
  points: number;
  isStreak: boolean;
  soundEffect: string;
  id: number;
}

interface ThrownItem extends TrashItem {
  targetBin: string;
  isCorrect: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  speed: number;
}

const ProfessionalWasteGame = () => {
  const { t, i18n } = useTranslation();
  
  // Core game state
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [currentTrashItem, setCurrentTrashItem] = useState<TrashItem | null>(null);
  const [score, setScore] = useState<number>(0);
  const [fines, setFines] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [gameStats, setGameStats] = useState({ correct: 0, wrong: 0 });
  const [isThrowingAnimation, setIsThrowingAnimation] = useState<boolean>(false);
  const [thrownItem, setThrownItem] = useState<ThrownItem | null>(null);
  const [characterState, setCharacterState] = useState<string>('idle');
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [confetti, setConfetti] = useState<Particle[]>([]);
  
  // Professional features
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [totalGamesPlayed, setTotalGamesPlayed] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(0);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Language switcher function
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // Use imported city data
  const cityData: Record<string, CityData> = citiesData;

  // Load statistics from localStorage on component mount
  useEffect(() => {
    const savedStats = localStorage.getItem('ecoSortGermanyStats');
    if (savedStats) {
      try {
        const stats = JSON.parse(savedStats);
        setTotalGamesPlayed(stats.totalGamesPlayed || 0);
        setBestScore(stats.bestScore || 0);
      } catch (error) {
        console.error('Error loading saved stats:', error);
      }
    }
  }, []);

  // Save statistics to localStorage whenever they change
  useEffect(() => {
    const stats = {
      totalGamesPlayed,
      bestScore,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('ecoSortGermanyStats', JSON.stringify(stats));
  }, [totalGamesPlayed, bestScore]);

  // PWA: Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // PWA: Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showInstructions || showLeaderboard) {
        if (e.key === 'Escape') {
          setShowInstructions(false);
          setShowLeaderboard(false);
        }
        return;
      }

      if (!gameStarted) {
        if (e.key === 'Enter' && selectedCity) {
          startGame();
        }
        return;
      }

      // Game keyboard shortcuts
      if (currentTrashItem && !isThrowingAnimation) {
        switch (e.key) {
          case '1':
          case 'y':
          case 'Y':
            if (cityData[selectedCity]?.bins[0]) {
              handleBinSelection(cityData[selectedCity].bins[0].id);
            }
            break;
          case '2':
          case 'b':
          case 'B':
            if (cityData[selectedCity]?.bins[1]) {
              handleBinSelection(cityData[selectedCity].bins[1].id);
            }
            break;
          case '3':
          case 'o':
          case 'O':
            if (cityData[selectedCity]?.bins[2]) {
              handleBinSelection(cityData[selectedCity].bins[2].id);
            }
            break;
          case '4':
          case 'g':
          case 'G':
            if (cityData[selectedCity]?.bins[3]) {
              handleBinSelection(cityData[selectedCity].bins[3].id);
            }
            break;
          case 'r':
          case 'R':
            resetGame();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, selectedCity, currentTrashItem, isThrowingAnimation, showInstructions, showLeaderboard]);

  // Sound effects using Web Audio API
  const playSound = (type: 'success' | 'error' | 'streak' | 'throw' | 'celebration') => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const createTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };

    switch (type) {
      case 'success':
        // Happy ascending notes
        createTone(523.25, 0.15); // C5
        setTimeout(() => createTone(659.25, 0.15), 100); // E5
        setTimeout(() => createTone(783.99, 0.2), 200); // G5
        break;
      
      case 'error':
        // Descending error sound
        createTone(369.99, 0.2, 'sawtooth'); // F#4
        setTimeout(() => createTone(293.66, 0.3, 'sawtooth'), 150); // D4
        break;
      
      case 'streak':
        // Exciting streak sound
        for (let i = 0; i < 5; i++) {
          setTimeout(() => createTone(523.25 + (i * 100), 0.1), i * 50);
        }
        break;
      
      case 'throw':
        // Whoosh sound
        createTone(200, 0.1, 'sawtooth');
        setTimeout(() => createTone(150, 0.1, 'sawtooth'), 50);
        break;
      
      case 'celebration':
        // Victory fanfare
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((note, index) => {
          setTimeout(() => createTone(note, 0.3), index * 100);
        });
        break;
    }
  };

  // Enhanced city data with professional information
  // Now loaded from cities.json file

  // Comprehensive trash items database
  const trashItems: Record<string, TrashItem> = {
    plastic_packaging: { name: 'Plastic Package', emoji: '📦', correctBin: 'yellow', description: 'Recyclable plastic packaging', difficulty: 'easy' },
    metal_packaging: { name: 'Metal Can', emoji: '🥫', correctBin: 'yellow', description: 'Aluminum/tin cans and packaging', difficulty: 'easy' },
    newspapers: { name: 'Newspaper', emoji: '📰', correctBin: 'blue', description: 'Print media and paper', difficulty: 'easy' },
    cardboard: { name: 'Cardboard Box', emoji: '📦', correctBin: 'blue', description: 'Cardboard packaging material', difficulty: 'easy' },
    fruit_scraps: { name: 'Apple Core', emoji: '🍎', correctBin: 'brown', description: 'Organic fruit waste', difficulty: 'easy' },
    food_leftovers: { name: 'Food Scraps', emoji: '🍽️', correctBin: 'brown', description: 'Leftover food waste', difficulty: 'easy' },
    cigarette_butts: { name: 'Cigarette Butt', emoji: '🚬', correctBin: 'grey', description: 'Non-recyclable waste', difficulty: 'medium' },
    diapers: { name: 'Used Diaper', emoji: '👶', correctBin: 'grey', description: 'Hygiene waste', difficulty: 'medium' },
    plastic_bottles: { name: 'Plastic Bottle', emoji: '🧴', correctBin: 'yellow', description: 'Recyclable plastic container', difficulty: 'easy' },
    coffee_grounds: { name: 'Coffee Grounds', emoji: '☕', correctBin: 'brown', description: 'Organic coffee waste', difficulty: 'medium' }
  };

  // Game functions
  const getAvailableTrashItems = (): TrashItem[] => {
    if (!selectedCity || !cityData[selectedCity]) return [];
    
    const cityBins = cityData[selectedCity].bins;
    const availableItems: TrashItem[] = [];
    
    cityBins.forEach((bin: Bin) => {
      bin.keywords.forEach((keyword: string) => {
        if (trashItems[keyword]) {
          availableItems.push({
            ...trashItems[keyword],
            correctBin: bin.id === 'recycling_island' ? 'yellow' : bin.id
          });
        }
      });
    });
    
    return availableItems;
  };

  const generateTrashItem = () => {
    const availableItems = getAvailableTrashItems();
    if (availableItems.length === 0) return null;
    
    let filteredItems = availableItems;
    if (difficulty === 'easy') {
      filteredItems = availableItems.filter(item => item.difficulty === 'easy');
    } else if (difficulty === 'hard') {
      filteredItems = availableItems.filter(item => item.difficulty === 'hard');
    }
    
    if (filteredItems.length === 0) filteredItems = availableItems;
    
    const randomIndex = Math.floor(Math.random() * filteredItems.length);
    return filteredItems[randomIndex];
  };

  const startGame = () => {
    if (!selectedCity) return;
    setGameStarted(true);
    setScore(0);
    setFines(0);
    setRound(1);
    setStreak(0);
    setGameStats({ correct: 0, wrong: 0 });
    setFeedback(null);
    setCelebration(null);
    setConfetti([]);
    setTotalGamesPlayed(prev => prev + 1);
    
    // Play game start sound
    playSound('success');
    
    const newItem = generateTrashItem();
    setCurrentTrashItem(newItem);
    setCharacterState('idle');
  };

  const handleBinSelection = (binId: string) => {
    if (!currentTrashItem || isThrowingAnimation) return;

    setIsThrowingAnimation(true);
    setCharacterState('throwing');
    
    // Play throw sound
    playSound('throw');
    
    setThrownItem({
      ...currentTrashItem,
      targetBin: binId,
      isCorrect: currentTrashItem.correctBin === binId
    });

    setTimeout(() => {
      const isCorrect = currentTrashItem.correctBin === binId;
      
      if (isCorrect) {
        const basePoints = 10;
        const streakBonus = streak >= 3 ? Math.min(streak * 2, 20) : 0;
        const totalPoints = basePoints + streakBonus;
        
        setScore(prev => prev + totalPoints);
        setStreak(prev => prev + 1);
        setGameStats(prev => ({ ...prev, correct: prev.correct + 1 }));
        setCharacterState('celebrating');
        
        // Play success sounds
        if (streak >= 5) {
          playSound('streak');
        } else {
          playSound('success');
        }
        
        const celebration: Celebration = {
          id: Date.now(),
          points: totalPoints,
          isStreak: streak >= 3,
          soundEffect: streak >= 5 ? '🎉' : '✨'
        };
        setCelebration(celebration);
        
        if (streak >= 3) {
          createConfetti();
        }
        
        setFeedback({
          type: 'success',
          emoji: streak >= 5 ? '🔥' : '✅',
          message: `Perfect! ${currentTrashItem.name} belongs in ${getBinName(binId)}!`,
          points: `+${totalPoints} points`,
          streak: streak + 1
        });
      } else {
        setFines(prev => prev + 100);
        setStreak(0);
        setGameStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
        setCharacterState('disappointed');
        
        // Play error sound
        playSound('error');
        
        setFeedback({
          type: 'error',
          emoji: '❌',
          message: `Oops! ${currentTrashItem.name} should go to ${getBinName(currentTrashItem.correctBin)}!`,
          fine: '+100€ fine'
        });
      }

      setTimeout(() => {
        setIsThrowingAnimation(false);
        setThrownItem(null);
        setCharacterState('idle');
        
        if (round >= 10) {
          endGame();
        } else {
          setRound(prev => prev + 1);
          const newItem = generateTrashItem();
          setCurrentTrashItem(newItem);
        }
        
        setTimeout(() => setFeedback(null), 3000);
        setTimeout(() => setCelebration(null), 2000);
      }, 1500);
    }, 800);
  };

  const endGame = () => {
    const finalScore = score - fines;
    if (finalScore > bestScore) {
      setBestScore(finalScore);
      // Play celebration sound for new high score
      playSound('celebration');
    } else {
      // Play regular completion sound
      playSound('success');
    }
    // Could save to localStorage here
  };

  const createConfetti = () => {
    const particles: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      particles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        color: ['🎉', '✨', '🌟', '💫'][Math.floor(Math.random() * 4)],
        speed: 1 + Math.random() * 2
      });
    }
    setConfetti(particles);
    setTimeout(() => setConfetti([]), 3000);
  };

  const getBinName = (binId: string) => {
    if (!selectedCity || !cityData[selectedCity]) return '';
    const bin = cityData[selectedCity].bins.find(b => b.id === binId);
    return bin ? bin.name : '';
  };

  const resetGame = () => {
    setGameStarted(false);
    setSelectedCity('');
    setCurrentTrashItem(null);
    setScore(0);
    setFines(0);
    setRound(1);
    setStreak(0);
    setFeedback(null);
    setCelebration(null);
    setConfetti([]);
    setCharacterState('idle');
  };

  const shareGame = async () => {
    const shareData = {
      title: 'EcoSort Germany - Master Waste Separation!',
      text: `I just scored ${score} points learning German waste separation rules! 🇩🇪♻️ Best score: ${bestScore} | Games played: ${totalGamesPlayed}`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Game stats copied to clipboard! 📋');
      } catch (error) {
        console.log('Could not copy to clipboard');
        // Ultimate fallback: show modal with shareable text
        const shareText = `${shareData.text}\n\nPlay at: ${shareData.url}`;
        prompt('Share this text:', shareText);
      }
    }
  };

  const resetStatistics = () => {
    if (confirm('Are you sure you want to reset all your statistics? This cannot be undone.')) {
      setTotalGamesPlayed(0);
      setBestScore(0);
      localStorage.removeItem('ecoSortGermanyStats');
      alert('Statistics have been reset! 🔄');
    }
  };

  // PWA Install function
  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setInstallPrompt(null);
  };

  // Character component
  const Character = () => {
    const getCharacterEmoji = () => {
      switch (characterState) {
        case 'throwing': return '🤾‍♂️';
        case 'celebrating': return '🎉';
        case 'disappointed': return '😔';
        default: return '🧍‍♂️';
      }
    };

    return (
      <div className={`text-6xl transition-all duration-500 ${
        characterState === 'throwing' ? 'animate-bounce' :
        characterState === 'celebrating' ? 'animate-pulse' :
        characterState === 'disappointed' ? 'animate-shake' : ''
      }`}>
        {getCharacterEmoji()}
      </div>
    );
  };

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Professional Header */}
      <header className="bg-white shadow-xl border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-xl shadow-md">
                <Recycle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {t('title')}
                </h1>
                <p className="text-xs md:text-sm text-gray-500">Master German Waste Separation</p>
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center gap-3">
              {/* Language Switcher - Professional Design */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-lg border border-green-200 shadow-sm">
                <Globe className="w-4 h-4 text-green-600" />
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      i18n.language === 'en' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md transform scale-105' 
                        : 'text-gray-700 hover:bg-white hover:shadow-sm hover:text-green-600'
                    }`}
                  >
                    EN
                  </button>
                  <div className="w-px h-4 bg-green-300"></div>
                  <button
                    onClick={() => changeLanguage('de')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      i18n.language === 'de' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md transform scale-105' 
                        : 'text-gray-700 hover:bg-white hover:shadow-sm hover:text-green-600'
                    }`}
                  >
                    DE
                  </button>
                </div>
              </div>

              {/* Stats Display */}
              {gameStarted && (
                <div className="hidden lg:flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">{score}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">{streak}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">R{round}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Offline/Online Status */}
                <div className={`p-2 rounded-lg ${isOnline ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`} title={isOnline ? 'Online' : 'Offline'}>
                  {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                </div>

                {/* PWA Install Button */}
                {installPrompt && (
                  <button
                    onClick={handleInstallClick}
                    className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 transition-colors text-purple-600"
                    title="Install App"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setShowInstructions(true)}
                  className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors text-blue-600"
                  title="How to play"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition-colors text-yellow-600"
                  title="Statistics"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => window.open('https://github.com/ImtinanFakhar/german-waste-game', '_blank')}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  title="View on GitHub"
                >
                  <Github className="w-4 h-4" />
                </button>

                <button
                  onClick={shareGame}
                  className="p-2 rounded-lg bg-green-100 hover:bg-green-200 transition-colors text-green-600"
                  title="Share game"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Stats Bar */}
          {gameStarted && (
            <div className="lg:hidden mt-3 space-y-3">
              {/* Game Stats */}
              <div className="flex items-center justify-center gap-4 bg-gray-50 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">{score}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Streak: {streak}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">{t('round')} {round}/10</span>
                </div>
              </div>
              
              {/* Mobile Action Buttons */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setShowInstructions(true)}
                  className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors text-blue-600"
                  title="How to play"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition-colors text-yellow-600"
                  title="Statistics"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {!gameStarted ? (
          // City Selection Screen
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('welcome')} 🇩🇪</h2>
                <p className="text-gray-600">
                  {t('instructions')}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl mb-2">🎯</div>
                  <h3 className="font-semibold text-gray-800">Learn Rules</h3>
                  <p className="text-sm text-gray-600">Master each city's unique separation rules</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl mb-2">🏆</div>
                  <h3 className="font-semibold text-gray-800">Score Points</h3>
                  <p className="text-sm text-gray-600">Earn points for correct sorting, avoid fines</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl mb-2">⚡</div>
                  <h3 className="font-semibold text-gray-800">Build Streaks</h3>
                  <p className="text-sm text-gray-600">Chain correct answers for bonus points</p>
                </div>
              </div>
            </div>

            {/* City Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-800">{t('select_city')}</h2>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                  {Object.keys(cityData).length} Cities Available!
                </span>
              </div>
              
              <div className="relative mb-6">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full md:w-64 p-3 border border-gray-300 rounded-lg bg-white text-gray-800 font-medium appearance-none cursor-pointer hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                >
                  <option value="">{t('select_city')}...</option>
                  {Object.entries(cityData).map(([cityKey, city]) => (
                    <option key={cityKey} value={cityKey}>
                      {city.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {selectedCity && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">🏙️ {t('city_info', { city: cityData[selectedCity].name, authority: cityData[selectedCity].authority })}</h3>
                  </div>
                  
                  {/* Difficulty Selection */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Difficulty Level</h3>
                    <div className="flex gap-3">
                      {(['easy', 'medium', 'hard'] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setDifficulty(level)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            difficulty === level
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={startGame}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    {t('start_game')} in {cityData[selectedCity].name}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Game Screen
          <div className="space-y-6">
            {/* Current City Info */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cityData[selectedCity].flag}</span>
                  <div>
                    <h3 className="font-semibold text-green-800">🏙️ Playing in {cityData[selectedCity].name}</h3>
                    <p className="text-green-700 text-sm">Authority: {cityData[selectedCity].authority}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{score - fines}</div>
                  <div className="text-xs text-gray-500">Net Score</div>
                </div>
              </div>
            </div>

            {/* Streak Indicator */}
            {streak >= 3 && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-xl shadow-lg text-center">
                <div className="text-2xl mb-1">🔥</div>
                <div className="font-bold">
                  {streak >= 10 ? '👑 WASTE SORTING MASTER!' : 
                   streak >= 8 ? '⭐ SORTING CHAMPION!' : 
                   '🌟 ON FIRE! Streak Bonus Active!'}
                </div>
                <div className="text-sm opacity-90">Streak: {streak} correct in a row!</div>
              </div>
            )}

            {/* Game Arena */}
            <div className="bg-gradient-to-b from-sky-200 to-green-200 rounded-xl shadow-lg p-6 min-h-96 relative overflow-hidden">
              {/* Confetti */}
              {confetti.length > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                  {confetti.map((particle) => (
                    <div
                      key={particle.id}
                      className="absolute text-2xl animate-bounce"
                      style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        transform: `rotate(${particle.rotation}deg)`,
                        animationDuration: `${particle.speed}s`,
                        animationDelay: `${Math.random() * 2}s`
                      }}
                    >
                      {particle.color}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Celebration */}
              {celebration && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 text-center bg-white rounded-lg p-4 shadow-lg border-2 border-yellow-400 animate-bounce">
                  <div className="text-6xl mb-2">{celebration.soundEffect}</div>
                  <div className={`text-2xl font-bold ${celebration.isStreak ? 'text-yellow-600' : 'text-green-600'}`}>
                    {celebration.points > 10 ? `BONUS! +${celebration.points}` : `+${celebration.points}`}
                  </div>
                  {celebration.isStreak && (
                    <div className="text-sm text-yellow-600 font-medium">
                      🎉 Streak Bonus!
                    </div>
                  )}
                </div>
              )}
              
              {/* Character and Current Item */}
              <div className="flex flex-col items-center mb-8">
                <Character />
                {currentTrashItem && (
                  <div className="mt-4 bg-white rounded-lg p-4 shadow-md text-center max-w-xs">
                    <div className="text-4xl mb-2">{currentTrashItem.emoji}</div>
                    <div className="font-bold text-gray-800">{currentTrashItem.name}</div>
                    <div className="text-sm text-gray-600">{currentTrashItem.description}</div>
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        currentTrashItem.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        currentTrashItem.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {currentTrashItem.difficulty}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback */}
              {feedback && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-lg p-4 shadow-lg border-l-4 border-green-400 max-w-sm">
                  <div className={`flex items-center gap-2 ${
                    feedback.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    <span className="text-2xl">{feedback.emoji}</span>
                    <div>
                      <span className="font-medium text-sm">{feedback.message}</span>
                      <div className={`text-xs ${
                        feedback.type === 'success' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {feedback.points || feedback.fine}
                      </div>
                      {feedback.streak && feedback.streak >= 5 && (
                        <div className="text-yellow-600 text-xs font-medium">
                          🎉 {feedback.streak}-Streak Bonus!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Waste Bins */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {cityData[selectedCity].bins.map((bin, index) => (
                  <div
                    key={bin.id}
                    onClick={() => handleBinSelection(bin.id)}
                    onMouseEnter={() => {
                      if (soundEnabled) {
                        // Subtle hover sound
                        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                        oscillator.type = 'sine';
                        
                        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                        
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.1);
                      }
                    }}
                    className={`cursor-pointer bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-all transform hover:scale-105 border-2 border-transparent hover:border-gray-300 ${
                      thrownItem && thrownItem.targetBin === bin.id ? 'ring-4 ring-blue-400 animate-pulse' : ''
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">{bin.icon}</div>
                      <div className="font-bold text-sm text-gray-800">{bin.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{bin.color} Bin</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Press {index + 1} or {bin.color.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Game Progress */}
              <div className="mt-6 text-center">
                <div className="bg-white rounded-lg p-3 inline-block shadow-md">
                  <div className="text-sm text-gray-600">
                    Playing in {cityData[selectedCity].name} • Round {round}/10
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Authority: {cityData[selectedCity].authority}
                  </div>
                </div>
              </div>

              {/* Reset Game Button */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={resetGame}
                  className="bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-lg shadow-md transition-all"
                  title="Reset Game"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Game Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 text-center shadow-md">
                <div className="text-2xl font-bold text-green-600">{gameStats.correct}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-md">
                <div className="text-2xl font-bold text-red-600">{gameStats.wrong}</div>
                <div className="text-sm text-gray-600">Wrong</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-md">
                <div className="text-2xl font-bold text-yellow-600">{score}</div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-md">
                <div className="text-2xl font-bold text-purple-600">{fines}€</div>
                <div className="text-sm text-gray-600">Fines</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-600 text-sm">
                Learn German waste separation rules interactively! 🇩🇪♻️
              </p>
              <p className="text-gray-500 text-xs">
                Built with ❤️ for environmental education
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Games Played: {totalGamesPlayed} | Best Score: {bestScore}
              </span>
              
              {/* PWA Status */}
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                
                {installPrompt && (
                  <button
                    onClick={handleInstallClick}
                    className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full hover:bg-purple-200 transition-colors flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Install App
                  </button>
                )}
              </div>
              
              <button
                onClick={() => window.open('https://github.com/ImtinanFakhar/german-waste-game', '_blank')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Github className="w-4 h-4" />
                <span className="text-sm">Open Source</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <HelpCircle className="w-6 h-6 text-blue-500" />
                  How to Play EcoSort Germany
                </h2>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">🎯 Game Objective</h3>
                  <p className="text-blue-700 text-sm">
                    Learn German waste separation rules by correctly sorting different types of waste into the appropriate bins. 
                    Each German city has slightly different rules - master them all!
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">🎮 How to Play</h3>
                  <ol className="text-green-700 text-sm space-y-1 list-decimal list-inside">
                    <li>Select a German city to learn their specific waste rules</li>
                    <li>Choose your difficulty level (Easy, Medium, Hard)</li>
                    <li>A waste item will appear - read its description carefully</li>
                    <li>Click on the correct bin where this item should go</li>
                    <li>Earn points for correct answers, avoid fines for mistakes!</li>
                  </ol>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">🔥 Scoring System</h3>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    <li><strong>Correct Answer:</strong> +10 points base</li>
                    <li><strong>Streak Bonus:</strong> +2 points per streak (max +20)</li>
                    <li><strong>Wrong Answer:</strong> +100€ fine</li>
                    <li><strong>Special Streaks:</strong> 5+ in a row = bonus effects!</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">🗂️ Bin Colors</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-yellow-400 rounded"></span>
                      <span className="text-purple-700">Yellow - Packaging</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-blue-400 rounded"></span>
                      <span className="text-purple-700">Blue - Paper</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-amber-600 rounded"></span>
                      <span className="text-purple-700">Brown - Organic</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-gray-400 rounded"></span>
                      <span className="text-purple-700">Grey - Residual</span>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">💡 Pro Tips</h3>
                  <ul className="text-red-700 text-sm space-y-1">
                    <li>• Each city has unique rules - don't assume they're all the same!</li>
                    <li>• Read item descriptions carefully for hints</li>
                    <li>• Build streaks for maximum points</li>
                    <li>• Enable sound for better feedback experience</li>
                    <li>• Share your high scores with friends!</li>
                  </ul>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-indigo-800 mb-2">⌨️ Keyboard Shortcuts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-indigo-700">
                    <div>• <kbd className="bg-white px-1 rounded">1</kbd> or <kbd className="bg-white px-1 rounded">Y</kbd> - Yellow bin</div>
                    <div>• <kbd className="bg-white px-1 rounded">2</kbd> or <kbd className="bg-white px-1 rounded">B</kbd> - Blue bin</div>
                    <div>• <kbd className="bg-white px-1 rounded">3</kbd> or <kbd className="bg-white px-1 rounded">O</kbd> - Brown bin</div>
                    <div>• <kbd className="bg-white px-1 rounded">4</kbd> or <kbd className="bg-white px-1 rounded">G</kbd> - Grey bin</div>
                    <div>• <kbd className="bg-white px-1 rounded">R</kbd> - Reset game</div>
                    <div>• <kbd className="bg-white px-1 rounded">Esc</kbd> - Close modals</div>
                    <div>• <kbd className="bg-white px-1 rounded">Enter</kbd> - Start game</div>
                    <div></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowInstructions(false)}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Got it! Let's Play
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics/Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-yellow-500" />
                  Your Game Statistics
                </h2>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Overall Stats */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Overall Performance
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{totalGamesPlayed}</div>
                      <div className="text-sm text-gray-600">Games Played</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{bestScore}</div>
                      <div className="text-sm text-gray-600">Best Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {totalGamesPlayed > 0 ? Math.round(((gameStats.correct) / Math.max(gameStats.correct + gameStats.wrong, 1)) * 100) : 0}%
                      </div>
                      <div className="text-sm text-gray-600">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{streak}</div>
                      <div className="text-sm text-gray-600">Current Streak</div>
                    </div>
                  </div>
                </div>

                {/* Current Game Stats */}
                {gameStarted && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-500" />
                      Current Game ({cityData[selectedCity]?.name})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{gameStats.correct}</div>
                        <div className="text-sm text-gray-600">Correct</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{gameStats.wrong}</div>
                        <div className="text-sm text-gray-600">Wrong</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{score}</div>
                        <div className="text-sm text-gray-600">Points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{fines}€</div>
                        <div className="text-sm text-gray-600">Fines</div>
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <div className="text-lg font-bold text-gray-800">
                        Net Score: <span className={score - fines >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {score - fines}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Achievements */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Achievements
                  </h3>
                  <div className="space-y-2">
                    <div className={`flex items-center gap-2 p-2 rounded ${totalGamesPlayed >= 1 ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <span className="text-lg">{totalGamesPlayed >= 1 ? '🎮' : '⭕'}</span>
                      <span className={totalGamesPlayed >= 1 ? 'text-green-800' : 'text-gray-500'}>
                        First Game Played
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 p-2 rounded ${bestScore >= 50 ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <span className="text-lg">{bestScore >= 50 ? '🏆' : '⭕'}</span>
                      <span className={bestScore >= 50 ? 'text-green-800' : 'text-gray-500'}>
                        Score Master (50+ points)
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 p-2 rounded ${streak >= 5 ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <span className="text-lg">{streak >= 5 ? '🔥' : '⭕'}</span>
                      <span className={streak >= 5 ? 'text-green-800' : 'text-gray-500'}>
                        On Fire (5+ streak)
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 p-2 rounded ${totalGamesPlayed >= 10 ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <span className="text-lg">{totalGamesPlayed >= 10 ? '🎯' : '⭕'}</span>
                      <span className={totalGamesPlayed >= 10 ? 'text-green-800' : 'text-gray-500'}>
                        Dedicated Player (10+ games)
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 p-2 rounded ${bestScore >= 100 ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <span className="text-lg">{bestScore >= 100 ? '👑' : '⭕'}</span>
                      <span className={bestScore >= 100 ? 'text-green-800' : 'text-gray-500'}>
                        Waste Sorting Champion (100+ points)
                      </span>
                    </div>
                  </div>
                </div>

                {/* City Progress */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    City Progress
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(cityData).map(([cityKey, city]) => (
                      <div key={cityKey} className="flex items-center justify-between p-2 bg-white rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{city.flag}</span>
                          <span className="font-medium">{city.name}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {selectedCity === cityKey && gameStarted ? 'Playing Now' : 'Ready to Play'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Share Section */}
                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg text-center">
                  <h3 className="font-semibold text-gray-800 mb-2">Share Your Progress</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Show off your German waste sorting skills!
                  </p>
                  <button
                    onClick={shareGame}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Game
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center space-y-3">
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors mr-3"
                >
                  Close Statistics
                </button>
                <button
                  onClick={resetStatistics}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Reset All Stats
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalWasteGame;
