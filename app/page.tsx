'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAccount, useDisconnect, useConnect, useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { supabase } from '@/lib/supabase';
import { sdk } from '@farcaster/miniapp-sdk';

import {
  Home as HomeIcon,
  User,
  Trophy,
  Gift,
  Play,
  Car,
  Award,
  Star,
  Zap,
  Crown,
  TrendingUp
} from 'lucide-react';

// Dynamic import to avoid SSR issues
const RacingGame = dynamic(() => import('./components/RacingGame'), { ssr: false });

type GameState = 'menu' | 'playing';
type TabType = 'home' | 'profile' | 'leaderboard' | 'rewards';

interface LeaderboardEntry {
  wallet_address: string;
  username: string;
  score: number;
  created_at: string;
}

interface FarcasterProfile {
  pfp_url?: string;
  display_name?: string;
  username?: string;
  follower_count?: number;
  following_count?: number;
  profile?: {
    bio?: {
      text?: string;
    };
  };
  power_badge?: boolean;
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [_leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [farcasterProfile, setFarcasterProfile] = useState<FarcasterProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState('Initializing...');
  const { sendTransaction, isPending, isSuccess } = useSendTransaction()

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();

  // Format wallet address
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Load last score from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLastScore = localStorage.getItem('lastScore');
      if (savedLastScore) {
        setScore(parseInt(savedLastScore, 10));
      }
    }
  }, []);

  // Initialize app with progressive loading
  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('Initializing app...');
        setIsLoading(true);
        setLoadingProgress(0);
        setLoadingStep('Initializing...');

        // Simulate progressive loading steps
        const steps = [
          { progress: 20, step: 'Loading game assets...', delay: 800 },
          { progress: 40, step: 'Connecting to blockchain...', delay: 600 },
          { progress: 60, step: 'Initializing Farcaster...', delay: 800 },
          { progress: 80, step: 'Setting up racing environment...', delay: 600 },
          { progress: 95, step: 'Almost ready...', delay: 400 }
        ];

        for (const step of steps) {
          setLoadingProgress(step.progress);
          setLoadingStep(step.step);
          await new Promise(resolve => setTimeout(resolve, step.delay));
        }

        // Initialize Farcaster SDK
        await sdk.actions.ready();
        console.log('SDK ready called successfully');
        
        // Final step
        setLoadingProgress(100);
        setLoadingStep('Ready!');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setIsAppReady(true);
      } catch (error) {
        console.error('Error initializing:', error);
        // Even if there's an error, we should continue
        setLoadingProgress(100);
        setLoadingStep('Ready!');
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsAppReady(true);
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, []);

  // Auto-connect Farcaster
  useEffect(() => {
    const autoConnectFarcaster = async () => {
      if (showConnectModal || !isAppReady || isLoading) return;

      try {
        const context = await sdk.context;
        console.log('Farcaster context:', context);

        if (context?.user) {
          console.log('Farcaster user detected:', context.user);
          if (!isConnected && connectors.length > 0) {
            const farcasterConnector = connectors[0];
            try {
              await connect({ connector: farcasterConnector });
            } catch (err) {
              console.log('Auto-connect error:', err);
            }
          }
        }
      } catch (error) {
        console.log('Farcaster context error:', error);
      }
    };

    autoConnectFarcaster();
  }, [connectors, isConnected, connect, showConnectModal, isAppReady, isLoading]);

  // Load Farcaster profile
  useEffect(() => {
    const loadFarcasterProfile = async () => {
      if (!isConnected || !address) {
        setFarcasterProfile(null);
        setProfileImageError(false);
        return;
      }

      setLoadingProfile(true);
      setProfileImageError(false);
      try {
        const apiKey = process.env.NEXT_PUBLIC_NEYNAR_API_KEY;
        if (!apiKey) {
          console.log('No Neynar API key found');
          setLoadingProfile(false);
          return;
        }

        const response = await fetch(
          `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}`,
          {
            headers: {
              accept: 'application/json',
              api_key: apiKey,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data && data[address.toLowerCase()] && data[address.toLowerCase()][0]) {
            setFarcasterProfile(data[address.toLowerCase()][0]);
          }
        }
      } catch (error) {
        console.error('Error loading Farcaster profile:', error);
      }
      setLoadingProfile(false);
    };

    loadFarcasterProfile();
  }, [isConnected, address]);

  // Define loadUserHighScore with useCallback
  const loadUserHighScore = useCallback(async () => {
    if (!address) return;

    try {
      // Get best score
      const { data: bestData, error: bestError } = await supabase
        .from('racing_scores')
        .select('*')
        .eq('wallet_address', address)
        .order('score', { ascending: false })
        .limit(1);

      if (bestError) {
        console.log('No existing high score');
        setBestScore(0);
      } else if (bestData && bestData.length > 0) {
        setBestScore(bestData[0].score);
      }

      // Get last score (most recent game)
      const { data: lastData, error: lastError } = await supabase
        .from('racing_scores')
        .select('*')
        .eq('wallet_address', address)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!lastError && lastData && lastData.length > 0) {
        setScore(lastData[0].score);
      }

      // Get total games
      const { count } = await supabase
        .from('racing_scores')
        .select('*', { count: 'exact', head: true })
        .eq('wallet_address', address);

      setTotalGames(count || 0);
    } catch (error) {
      console.error('Error loading high score:', error);
    }
  }, [address]);

  // Load player stats
  useEffect(() => {
    if (isConnected && address && isAppReady) {
      loadUserHighScore();
    } else {
      setBestScore(0);
      setTotalGames(0);
    }
  }, [isConnected, address, isAppReady, loadUserHighScore]);

  // Define loadLeaderboard with useCallback
  const loadLeaderboard = useCallback(async () => {
    console.log('🔍 Loading leaderboard...');
    try {
      const { data: allScores, error } = await supabase
        .from('racing_scores')
        .select('*')
        .order('score', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (allScores && allScores.length > 0) {
        const bestScoresMap = new Map<string, LeaderboardEntry>();
        
        allScores.forEach((entry) => {
          const existing = bestScoresMap.get(entry.wallet_address);
          if (!existing || entry.score > existing.score) {
            bestScoresMap.set(entry.wallet_address, entry);
          }
        });

        const uniqueScores = Array.from(bestScoresMap.values())
          .sort((a, b) => b.score - a.score)
          .slice(0, 20);

        console.log(`✅ Found ${uniqueScores.length} unique players!`);
        setLeaderboard(uniqueScores);
      } else {
        console.log('⚠️ No scores in database yet');
        setLeaderboard([]);
      }
    } catch (error) {
      console.error('💥 Error loading leaderboard:', error);
      setLeaderboard([]);
    }
  }, []);

  // Load leaderboard when tab changes
  useEffect(() => {
    if (isAppReady) {
      loadLeaderboard();
    }
  }, [isAppReady, loadLeaderboard]);

  const handleGameOver = async (finalScore: number) => {
    setScore(finalScore);
    setGameState('menu');
    setActiveTab('home');

    if (typeof window !== 'undefined') {
      localStorage.setItem('lastScore', finalScore.toString());
    }

    if (finalScore > bestScore) {
      setBestScore(finalScore);
    }

    if (address) {
      try {
        const username = farcasterProfile?.username || formatAddress(address);
        
        const { error } = await supabase
          .from('racing_scores')
          .insert([{
            wallet_address: address,
            username: username,
            score: finalScore,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
        
        setTotalGames(totalGames + 1);
        loadLeaderboard();
      } catch (error) {
        console.error('Error saving score:', error);
      }
    }
  };

// Auto-start game after successful payment
useEffect(() => {
  if (isSuccess) {
    setGameState('playing')
  }
}, [isSuccess])

const startGame = () => {
  if (!isConnected) {
    setShowConnectModal(true)
    return
  }
  
  // Trigger payment transaction
  sendTransaction({
    to: '0x542F55d412e113b7F4AF35b5F88029F690685AA0', // REPLACE WITH YOUR WALLET
    value: parseEther('0.00001'), // 0.00001 ETH = ~$0.04
  })
}


  const handleConnect = async (connectorId: string) => {
    try {
      const connector = connectors.find(c => c.id === connectorId);
      if (!connector) return;

      await connect({ connector });
      setTimeout(() => setShowConnectModal(false), 500);
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setFarcasterProfile(null);
    setProfileImageError(false);
    setTimeout(() => setShowConnectModal(true), 300);
  };

  const _handleImageError = () => {
    setProfileImageError(true);
  };

  // Enhanced Loading screen
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: `url('https://up6.cc/2025/10/176116251220711.png') center/cover no-repeat`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        {/* Loading Container */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '28px',
          padding: '40px 32px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
        }}>
          {/* Animated Logo */}
          <div style={{
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            animation: 'pulse 2s ease-in-out infinite',
            boxShadow: '0 8px 25px rgba(255, 107, 107, 0.4)'
          }}>
            <Car size={48} color="white" />
          </div>
          
          {/* Title */}
          <h1 style={{ 
            color: 'white', 
            fontSize: '28px', 
            fontWeight: '900',
            marginBottom: '8px',
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            DRIVING ROAD
          </h1>
          
          {/* Subtitle */}
          <p style={{ 
            color: '#feca57', 
            fontSize: '14px', 
            marginBottom: '32px',
            fontWeight: '700',
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>
            RACE & EARN
          </p>

          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '6px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '16px'
          }}>
            <div style={{
              width: `${loadingProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #feca57 0%, #ff9ff3 100%)',
              borderRadius: '10px',
              transition: 'width 0.5s ease-in-out',
              boxShadow: '0 0 10px rgba(254, 202, 87, 0.5)'
            }} />
          </div>

          {/* Progress Text */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <p style={{ 
              color: 'rgba(255,255,255,0.8)', 
              fontSize: '12px',
              fontWeight: '600',
              margin: 0
            }}>
              {loadingStep}
            </p>
            <p style={{ 
              color: '#feca57', 
              fontSize: '12px',
              fontWeight: '700',
              margin: 0
            }}>
              {loadingProgress}%
            </p>
          </div>

          {/* Loading Dots */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '6px',
            marginTop: '20px'
          }}>
            {[1, 2, 3].map((dot) => (
              <div
                key={dot}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#feca57',
                  animation: `bounce 1.4s infinite ${dot * 0.16}s`,
                  opacity: 0.6
                }}
              />
            ))}
          </div>

          {/* Tips */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '12px 16px',
            borderRadius: '12px',
            marginTop: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <p style={{ 
              color: 'rgba(255,255,255,0.7)', 
              fontSize: '12px',
              fontWeight: '600',
              margin: 0,
              fontStyle: 'italic'
            }}>
              Tip: Use arrow keys or swipe to control your car
            </p>
          </div>
        </div>

        {/* Animation Styles */}
        <style jsx>{`
          @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4); }
            50% { transform: scale(1.05); box-shadow: 0 12px 35px rgba(255, 107, 107, 0.6); }
            100% { transform: scale(1); box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4); }
          }
          
          @keyframes bounce {
            0%, 80%, 100% {
              transform: scale(0.8);
              opacity: 0.6;
            }
            40% {
              transform: scale(1.2);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }

  // Game playing view
  if (gameState === 'playing') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <RacingGame onGameOver={handleGameOver} />
      </div>
    );
  }

  // Main menu
  return (
    <div style={{
      minHeight: '100vh',
      background: `url('https://up6.cc/2025/10/176116251220711.png') center/cover no-repeat`,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header - Mobile Gaming Design */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexShrink: 0,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(255, 107, 107, 0.4)'
          }}>
            <Car size={24} color="white" />
          </div>
          <div>
            <p style={{ 
              color: 'white', 
              fontSize: '20px', 
              fontWeight: '900', 
              margin: 0,
              letterSpacing: '1px',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              DRIVING ROAD
            </p>
            <p style={{ 
              color: '#feca57', 
              fontSize: '10px', 
              margin: 0,
              fontWeight: '700',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>
              RACE & EARN
            </p>
          </div>
        </div>

        {isConnected ? (
          <button
            onClick={() => setShowConnectModal(true)}
            style={{
              background: 'linear-gradient(135deg, #ff9ff3 0%, #f368e0 100%)',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(243, 104, 224, 0.4)'
            }}
          >
            <div style={{
              width: '8px',
              height: '8px',
              background: '#1dd1a1',
              borderRadius: '50%'
            }} />
            <p style={{ 
              color: 'white', 
              fontSize: '14px', 
              fontWeight: '700', 
              margin: 0,
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
            }}>
              {farcasterProfile?.username ? `@${farcasterProfile.username}` : formatAddress(address!)}
            </p>
          </button>
        ) : (
          <button
            onClick={() => setShowConnectModal(true)}
            style={{
              background: 'linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)',
              color: 'white',
              fontWeight: '700',
              padding: '12px 24px',
              borderRadius: '25px',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(72, 219, 251, 0.4)',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
            }}
          >
            Connect
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ 
        padding: '20px 16px',
        flex: 1,
        overflowY: 'auto'
      }}>
        {activeTab === 'home' && (
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            {/* Profile Card */}
            {isConnected && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '25px',
                padding: '20px',
                marginBottom: '20px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: (farcasterProfile?.pfp_url && !profileImageError) 
                    ? `url(${farcasterProfile.pfp_url})` 
                    : 'rgba(255, 255, 255, 0.3)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '50%',
                  border: '3px solid white',
                  margin: '0 auto 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                }}>
                  {(!farcasterProfile?.pfp_url || profileImageError) && (
                    <User size={32} color="white" />
                  )}
                  {(farcasterProfile?.pfp_url && !profileImageError) && (
                    <img 
                      src={farcasterProfile.pfp_url} 
                      alt="Profile" 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={_handleImageError}
                    />
                  )}
                </div>
                
                <div style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  display: 'inline-block',
                  marginBottom: '12px'
                }}>
                  {loadingProfile ? (
                    <p style={{ 
                      color: 'white', 
                      fontSize: '14px', 
                      margin: 0, 
                      fontWeight: '600' 
                    }}>
                      Loading...
                    </p>
                  ) : farcasterProfile?.username ? (
                    <p style={{ 
                      color: 'white', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      margin: 0 
                    }}>
                      @{farcasterProfile.username}
                    </p>
                  ) : (
                    <p style={{ 
                      color: 'white', 
                      fontSize: '14px', 
                      fontFamily: 'monospace', 
                      fontWeight: '600', 
                      margin: 0 
                    }}>
                      {formatAddress(address!)}
                    </p>
                  )}
                </div>
                
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  padding: '8px 16px',
                  borderRadius: '20px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#1dd1a1',
                    borderRadius: '50%'
                  }} />
                  <p style={{ 
                    color: 'white', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    margin: 0 
                  }}>
                    Connected
                  </p>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            {isConnected && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 107, 107, 0.3)',
                  padding: '16px',
                  borderRadius: '20px',
                  textAlign: 'center',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
                }}>
                  <Award size={20} color="#ff6b6b" style={{ margin: '0 auto 8px' }} />
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginBottom: '4px', fontWeight: '600' }}>BEST</p>
                  <p style={{ color: '#ff6b6b', fontSize: '24px', fontWeight: 'bold' }}>{bestScore}</p>
                </div>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(72, 219, 251, 0.3)',
                  padding: '16px',
                  borderRadius: '20px',
                  textAlign: 'center',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
                }}>
                  <TrendingUp size={20} color="#48dbfb" style={{ margin: '0 auto 8px' }} />
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginBottom: '4px', fontWeight: '600' }}>GAMES</p>
                  <p style={{ color: '#48dbfb', fontSize: '24px', fontWeight: 'bold' }}>{totalGames}</p>
                </div>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(29, 209, 161, 0.3)',
                  padding: '16px',
                  borderRadius: '20px',
                  textAlign: 'center',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
                }}>
                  <Star size={20} color="#1dd1a1" style={{ margin: '0 auto 8px' }} />
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginBottom: '4px', fontWeight: '600' }}>LAST</p>
                  <p style={{ color: '#1dd1a1', fontSize: '24px', fontWeight: 'bold' }}>{score}</p>
                </div>
              </div>
            )}

            {/* Play Button */}
<button
  onClick={startGame}
  style={{
    width: '100%',
    background: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)',
    color: 'white',
    fontWeight: '800',
    padding: '22px',
    borderRadius: '25px',
    fontSize: '18px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '20px',
    boxShadow: '0 6px 25px rgba(254, 202, 87, 0.4)',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
    letterSpacing: '1px'
  }}
>
  {isPending ? (
    <>
      <span style={{ fontSize: '24px' }}></span>
      Processing Payment...
    </>
  ) : isConnected ? (
    <>
      <Play size={24} fill="white" />
      START RACING
    </>
  ) : (
    <>
      <span style={{ fontSize: '24px' }}></span>
      CONNECT TO PLAY
    </>
  )}
</button>


            {/* Game Features */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <Crown size={20} color="#feca57" fill="#feca57" />
                <p style={{ 
                  color: 'white', 
                  fontSize: '18px', 
                  fontWeight: '800',
                  margin: 0,
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
                }}>
                  Premium Racing Experience
                </p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Car size={14} color="#feca57" />
                  </div>
                  <p style={{ 
                    color: 'rgba(255,255,255,0.9)', 
                    fontSize: '14px', 
                    margin: 0,
                    fontWeight: '600'
                  }}>
                    High-speed racing action
                  </p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Trophy size={14} color="#feca57" fill="#feca57" />
                  </div>
                  <p style={{ 
                    color: 'rgba(255,255,255,0.9)', 
                    fontSize: '14px', 
                    margin: 0,
                    fontWeight: '600'
                  }}>
                    Compete for top rankings
                  </p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Zap size={14} color="#feca57" fill="#feca57" />
                  </div>
                  <p style={{ 
                    color: 'rgba(255,255,255,0.9)', 
                    fontSize: '14px', 
                    margin: 0,
                    fontWeight: '600'
                  }}>
                    Earn exclusive rewards
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div style={{ maxWidth: '480px', margin: '0 auto', color: 'white' }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '900', 
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              <User size={28} fill="white" />
              Player Profile
            </h2>
            {isConnected ? (
              <div>
                {farcasterProfile && (
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '20px',
                    padding: '24px',
                    marginBottom: '20px',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
                  }}>
                    <p style={{ 
                      color: '#feca57', 
                      fontSize: '16px', 
                      marginBottom: '15px', 
                      fontWeight: '800', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
                    }}>
                      <Zap size={16} fill="#feca57" />
                      Farcaster Profile
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: (farcasterProfile.pfp_url && !profileImageError) 
                          ? `url(${farcasterProfile.pfp_url})` 
                          : 'rgba(255, 255, 255, 0.3)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: '3px solid white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                      }}>
                        {(!farcasterProfile.pfp_url || profileImageError) && (
                          <User size={32} color="white" />
                        )}
                        {(farcasterProfile.pfp_url && !profileImageError) && (
                          <img 
                            src={farcasterProfile.pfp_url} 
                            alt="Profile" 
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                            onError={_handleImageError}
                          />
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: 'white', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>
                          {farcasterProfile.display_name} {farcasterProfile.power_badge && '⚡'}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>
                          @{farcasterProfile.username}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      <div style={{ 
                        background: 'rgba(255, 255, 255, 0.1)', 
                        padding: '12px', 
                        borderRadius: '12px', 
                        border: '1px solid rgba(255, 255, 255, 0.2)' 
                      }}>
                        <div style={{ color: '#48dbfb', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                          <User size={12} />
                          Followers
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#48dbfb' }}>
                          {farcasterProfile.follower_count?.toLocaleString() || 0}
                        </div>
                      </div>
                      <div style={{ 
                        background: 'rgba(255, 255, 255, 0.1)', 
                        padding: '12px', 
                        borderRadius: '12px', 
                        border: '1px solid rgba(255, 255, 255, 0.2)' 
                      }}>
                        <div style={{ color: '#ff9ff3', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                          <User size={12} />
                          Following
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#ff9ff3' }}>
                          {farcasterProfile.following_count?.toLocaleString() || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
                }}>
                  <p style={{ 
                    fontSize: '18px', 
                    fontWeight: '800', 
                    marginBottom: '16px', 
                    color: '#feca57', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>
                    <Trophy size={20} fill="#feca57" />
                    Game Stats
                  </p>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px'
                  }}>
                    <div style={{ 
                      background: 'rgba(255, 255, 255, 0.1)', 
                      padding: '12px', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(255, 255, 255, 0.2)' 
                    }}>
                      <div style={{ color: '#ff6b6b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                        <Award size={12} />
                        Best Score
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '800', color: '#ff6b6b' }}>
                        {bestScore}
                      </div>
                    </div>
                    <div style={{ 
                      background: 'rgba(255, 255, 255, 0.1)', 
                      padding: '12px', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(255, 255, 255, 0.2)' 
                    }}>
                      <div style={{ color: '#1dd1a1', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                        <Star size={12} />
                        Total Games
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '800', color: '#1dd1a1' }}>
                        {totalGames}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
                <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '20px', fontSize: '16px', fontWeight: '600' }}>
                  Connect your wallet to view profile
                </p>
                <button
                  onClick={() => setShowConnectModal(true)}
                  style={{
                    background: 'linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)',
                    color: 'white',
                    fontWeight: '700',
                    padding: '14px 28px',
                    borderRadius: '25px',
                    fontSize: '16px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(72, 219, 251, 0.4)'
                  }}
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div style={{ maxWidth: '480px', margin: '0 auto', color: 'white' }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '900', 
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              <Trophy size={28} fill="white" />
              Leaderboard
            </h2>
            <div style={{
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
            }}>
              {_leaderboard.length > 0 ? (
                <div>
                  {_leaderboard.map((entry, index) => (
                    <div
                      key={entry.wallet_address}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                        borderRadius: '12px',
                        marginBottom: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        background: index < 3 ? 
                          ['#FFD700', '#C0C0C0', '#CD7F32'][index] : 
                          'rgba(255, 255, 255, 0.3)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px',
                        fontSize: '14px',
                        fontWeight: '800',
                        color: index < 3 ? 'white' : 'white',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>
                          {entry.username}
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', fontWeight: '600' }}>
                          {formatAddress(entry.wallet_address)}
                        </div>
                      </div>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: '800',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}>
                        {entry.score}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.8)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
                  <p style={{ marginBottom: '8px', fontSize: '16px', fontWeight: '700' }}>
                    No scores yet
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: '600' }}>
                    Be the first to play and top the leaderboard!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

       {activeTab === 'rewards' && (
  <div style={{ maxWidth: '480px', margin: '0 auto', color: 'white' }}>
    <h2 style={{ 
      fontSize: '24px', 
      fontWeight: '900', 
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: 'white',
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
    }}>
      <Gift size={28} fill="#feca57" />
      Rewards
    </h2>
    <div style={{
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '20px',
      padding: '24px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
    }}>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ 
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(254, 202, 87, 0.4)'
          }}>
            <Gift size={40} color="white" fill="white" />
          </div>
        </div>
        <p style={{ 
          fontSize: '18px', 
          fontWeight: '800', 
          marginBottom: '8px',
          color: '#feca57'
        }}>
          Coming Soon
        </p>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.5', fontWeight: '600' }}>
          Exciting rewards system is under development. 
          Compete in races and earn exclusive prizes!
        </p>
      </div>
      
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        padding: '20px',
        marginTop: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Zap size={18} color="white" fill="white" />
          </div>
          <p style={{ 
            color: '#48dbfb', 
            fontSize: '16px', 
            fontWeight: '800',
            margin: 0
          }}>
            Planned Features
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Star size={12} color="#feca57" fill="#feca57" />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', margin: 0, fontWeight: '600' }}>
              Daily challenges and rewards
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Award size={12} color="#ff9ff3" fill="#ff9ff3" />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', margin: 0, fontWeight: '600' }}>
              Exclusive NFTs for top players
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={12} color="#1dd1a1" fill="#1dd1a1" />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', margin: 0, fontWeight: '600' }}>
              Token rewards and airdrops
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
      </div>

      {/* Bottom Navigation */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'sticky',
        bottom: 0,
        zIndex: 100,
        flexShrink: 0,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {[
          { id: 'home' as TabType, icon: HomeIcon, label: 'Home' },
          { id: 'profile' as TabType, icon: User, label: 'Profile' },
          { id: 'leaderboard' as TabType, icon: Trophy, label: 'Rank' },
          { id: 'rewards' as TabType, icon: Gift, label: 'Rewards' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              padding: '10px 16px',
              borderRadius: '20px',
              minWidth: '60px',
              backdropFilter: 'blur(10px)'
            }}
          >
            <tab.icon 
              size={22} 
              color={activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.7)'} 
              fill={activeTab === tab.id ? 'white' : 'none'}
            />
            <p style={{ 
              fontSize: '11px', 
              fontWeight: '700',
              margin: 0,
              color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.7)',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
            }}>
              {tab.label}
            </p>
          </button>
        ))}
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '24px',
            padding: '32px 24px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
          }}>
            <h2 style={{ 
              color: 'white', 
              fontSize: '24px', 
              fontWeight: '900', 
              marginBottom: '8px',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              {isConnected ? 'Account' : 'Connect Wallet'}
            </h2>
            <p style={{ 
              color: 'rgba(255,255,255,0.8)', 
              fontSize: '14px', 
              marginBottom: '32px',
              fontWeight: '600'
            }}>
              {isConnected ? 'Manage your connection' : 'Choose a wallet to get started'}
            </p>

            {isConnected ? (
              <div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '24px',
                  textAlign: 'left',
                  backdropFilter: 'blur(10px)'
                }}>
                  <p style={{ 
                    color: '#feca57', 
                    fontSize: '12px', 
                    fontWeight: '800', 
                    marginBottom: '8px' 
                  }}>
                    CONNECTED WALLET
                  </p>
                  <p style={{ 
                    color: 'white', 
                    fontSize: '16px', 
                    fontFamily: 'monospace', 
                    marginBottom: '4px',
                    fontWeight: '700'
                  }}>
                    {formatAddress(address!)}
                  </p>
                  {farcasterProfile?.username && (
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '600' }}>
                      @{farcasterProfile.username}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleDisconnect}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 107, 107, 0.2)',
                    color: '#ff6b6b',
                    fontWeight: '700',
                    padding: '16px',
                    borderRadius: '20px',
                    fontSize: '16px',
                    border: '1px solid rgba(255, 107, 107, 0.3)',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  Disconnect Wallet
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {connectors.map((connector) => (
                  <button
                    key={connector.id}
                    onClick={() => handleConnect(connector.id)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontWeight: '700',
                      padding: '16px 20px',
                      borderRadius: '20px',
                      fontSize: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Zap size={14} color="white" fill="white" />
                    </div>
                    {connector.name}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowConnectModal(false)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255,255,255,0.8)',
                fontWeight: '600',
                padding: '12px',
                borderRadius: '20px',
                fontSize: '14px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                marginTop: '20px',
                backdropFilter: 'blur(10px)'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
