import { Inter } from 'next/font/google';
import Timer from '@/components/timer';
import Ranking from '@/components/ranking';
import MazeApplet from '@/components/mazeapplet';
import { useEffect, useState } from 'react';
import router, { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';
import supabase from '../../../lib/supabaseClient';


const inter = Inter({ subsets: ['latin'] });

export default function Gameplay() {
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isGiveUp, setIsGiveUp] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  const router = useRouter(); // Initialize useRouter hook
  const { roomId } = router.query;
  // const playerId = sessionStorage.getItem('playerId');

  useEffect(() => {
    const storedName = sessionStorage.getItem('playerName');
    const storedId = sessionStorage.getItem('playerId');
    setPlayerName(storedName || 'unknown');
    setPlayerId(storedId || null);
  }, []);

  console.log('playerName', playerName);
  console.log('roomId', roomId);
  console.log('playerId', playerId);

  useEffect(() => {
    if (!roomId) return; // Ensure roomId is defined before subscribing

    const clearChannel = supabase.channel('clear-channel')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'maze-game-table', filter: `room_id=eq.${roomId}` },
        (payload) => {
          console.log('Game status change received!', payload);
          // Only navigate to ranking if game_status is 'Over'
          if (payload.new.game_status === 'Over') {
            router.push(`/ranking/${roomId}`);
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(clearChannel);
    };
  }, [roomId, router]);

  const handleFinish = async (clearTime: number) => {
    setIsGameOver(true);
    console.log('Game cleared in', clearTime, 'seconds');

    const { data, error } = await supabase
      .from('game-player-table')
      .update({
        clear_time: clearTime,
      })
      .match({
        room_id: roomId,
        player_id: playerId,
      });

    if (error) {
      console.error('Error saving clear time:', error);
    } else {
      console.log('Clear time saved successfully:', data);
      // router.push(`/ranking/${roomId}`);
      // Check if all players have cleared
      const allCleared = await checkAllPlayersCleared();
      if (allCleared) {
        handleEnd();
      }
    }
  };


  const handleGiveUp = async () => {
    setIsGameOver(true);
    setIsGiveUp(true);
    console.log('Game given up.');

    const giveUpTime = 99 * 60 + 59; // 99 minutes and 59 seconds in seconds

    const { data, error } = await supabase
      .from('game-player-table')
      .update({ clear_time: giveUpTime })
      .match({ room_id: roomId, player_id: playerId });

    if (error) {
      console.error('Error updating clear time to give up:', error);
    } else {
      console.log('Clear time set to give up successfully:', data);
      const allCleared = await checkAllPlayersCleared();
      if (allCleared) {
        handleEnd();
      }
    }
  };

  const checkAllPlayersCleared = async () => {
    if (roomId) {
      const { data, error } = await supabase
        .from('game-player-table')
        .select('player_id')
        .eq('room_id', roomId)
        .is('clear_time', null);

      if (error) {
        console.error('Error fetching player data:', error);
        return false;
      }

      // If there are no players with NULL clear_time, all players have cleared
      return data.length === 0; // Returns true if no players have NULL clear_time
    }
    return false;
  };


  const handleHomeClick = () => {
    router.push('/');
  };

  const handleEnd = async () => {
    const { data: gameData, error: gameError } = await supabase
      .from('maze-game-table')
      .update({ game_status: 'Over' })
      .eq('room_id', roomId);

    if (gameError) {
      console.error('Error updating data in maze_game_table:', gameError);
      return;
    }
    // router.push(`/ranking/${roomId}`);
  };

  return (
    <div
      className={`relative flex h-screen flex-col items-center justify-center p-24 z-10000000  bg-custom-image`}
    >
      {/* <div className="background-overlay"></div> */}

      <MazeApplet roomId={roomId as string} onFinish={handleFinish} />

      {/* Timer */}
      <Timer isGameOver={isGameOver} isGiveUp={isGiveUp} className='absolute top-4 right-4 z-30' />

      {/* Home */}
      <button
        type='button'
        onClick={handleHomeClick}
        className='absolute bottom-4 center-4 px-4 py-2 bg-red-600 rounded text-white hover:bg-red-700 z-100000'
      >
        Home
      </button>
      {/* Give Up*/}
      <button
        type='button'
        onClick={handleGiveUp}
        className='absolute bottom-4 right-4 px-4 py-2 bg-red-600 rounded text-white hover:bg-red-700 z-100000'
      >
        Give Up
      </button>
      {/* Player Name */}
      <div
        className='absolute bottom-4 left-4 text-white font-bold mb-1 text-3xl z-30'
        style={{ zIndex: 20 }}
      >
        Player: {playerName}
      </div>
    </div>
  );
}
