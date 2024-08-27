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
  const [playerColor, setPlayerColor] = useState<string | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const router = useRouter(); // Initialize useRouter hook
  const { roomId } = router.query;
  // const playerId = sessionStorage.getItem('playerId');
  const [phone, setPhone] = useState<boolean>(false);

  useEffect(() => {
    const storedName = sessionStorage.getItem('playerName');
    const storedId = sessionStorage.getItem('playerId');
    const storedColor = sessionStorage.getItem('playerColor');

    setPlayerName(storedName || 'unknown');
    setPlayerId(storedId || null);
    setPlayerColor(storedColor || 'gray');
  }, []);

  console.log('playerName', playerName);
  console.log('roomId', roomId);
  console.log('playerId', playerId);
  console.log('playerColor', playerColor);

  useEffect(() => {
    if (!roomId) return; // Ensure roomId is defined before subscribing

    // Fetch players data
    const getPlayers = async () => {
      const { data, error } = await supabase
        .from('game-player-table')
        .select('*')
        .eq('room_id', roomId);

      if (error) {
        console.error('Error fetching players:', error);
      } else {
        setPlayers(data || []);
      }
    };

    getPlayers();

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
    if (window.innerWidth < 768) {  // basic size of the smartphone
      setPhone(true);
    } else {
      setPhone(false);
    }
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
  };

  return (
    <div
      className={`relative flex h-screen flex-col items-center justify-center p-6 z-10000000  bg-custom-image`}
    >
      {phone && (
        <div className='absolute top-10 transform w-full p-4'>
          <div className='text-white p-4 rounded shadow-lg'>
            <ul className='list-disc list-inside'>
              <p>Swipe on the maze:</p>
              <li>Left or right to move horizontally.</li>
              <li>Up or down to move vertically.</li>
            </ul>
          </div>
        </div>
      )}
      {/* <div className="background-overlay"></div> */}

      <MazeApplet roomId={roomId as string}
        onFinish={handleFinish}
        playerId={playerId as string}
        playerName={playerName as string}
        playerColor={playerColor as string} />

      {/* Timer */}
      <Timer isGameOver={isGameOver} isGiveUp={isGiveUp} className='absolute top-4 right-4 z-30' />

      {/* Home */}
      {/* <button
        type='button'
        onClick={handleHomeClick}
        className='absolute bottom-4 center-4 px-4 py-2 bg-red-600 rounded text-white hover:bg-red-700 z-100000'
      >
        Home
      </button> */}
      {/* Give Up*/}
      <button
        type='button'
        onClick={handleGiveUp}
        className='absolute bottom-4 right-4 px-4 py-2 bg-red-600 rounded text-white hover:bg-red-700 z-100000'
      >
        Give Up
      </button>

      {/* Player List */}
      <div className='absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-2 z-30'>
        <ul className='space-y-2'>
          {players.map((player) => {
            // プレイヤー名が8文字以上なら、省略するテキストを作成
            const displayName = player.player_name.length > 8
              ? `${player.player_name.slice(0, 8)}...`
              : player.player_name;

            return (
              <li
                key={player.player_id}
                className={`flex items-center p-1 rounded-md shadow-md ${player.player_id === playerId ? 'bg-red-200' : 'bg-gray-100'} ${player.player_id === playerId ? '' : 'opacity-60'}`}
              >
                <div
                  className='w-5 h-5 flex items-center justify-center text-white rounded-full text-base font-bold mr-3'
                  style={{ backgroundColor: player.player_color || 'gray' }}
                >
                  {player.player_name[0]}
                </div>
                <span
                  className='text-base font-medium'
                  style={{ color: player.player_color || 'black' }}
                >
                  {displayName} {player.player_id === playerId ? '(You)' : ''}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
