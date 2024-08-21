import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../../../lib/supabaseClient';
import { generateAndSaveMaze } from '../../../components/generateAndSaveMaze';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function Lobby() {
  const router = useRouter();
  const { roomId } = router.query;
  // const { playerId } = router.query;
  const [players, setPlayers] = useState<any[]>([]);
  // const playerName = sessionStorage.getItem('playerName') || 'You';
  const playerId = sessionStorage.getItem('playerId');
  const is_host = sessionStorage.getItem('is_host') === 'true';

  console.log("is_host", is_host)
  console.log("players", players)


  useEffect(() => {
    const getPlayers = async () => {
      const { data, error } = await supabase
        .from('game-player-table')
        .select('*')
        .eq('room_id', roomId);

      if (error) {
        console.error('Error fetching players:', error);
      } else {
        // Filter out the current player from the list
        const initialPlayers = (data || []);
        setPlayers(initialPlayers);
      }
    };

    if (roomId) {
      getPlayers();
    }

    // Subscribe to real-time updates
    const playerChannel = supabase.channel('player-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'game-player-table', filter: `room_id=eq.${roomId}` },
        (payload) => {
          console.log('Player change received!', payload);
          setPlayers(prevPlayers => {
            if (payload.new.player_id !== playerId && !prevPlayers.some(player => player.player_id === payload.new.player_id)) {
              return [...prevPlayers, payload.new];
            }
            return prevPlayers;
          });
        }
      )
      .subscribe();

    // Create a unique channel for game status updates
    const gameChannel = supabase.channel('game-channel')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'maze-game-table', filter: `room_id=eq.${roomId}` },
        (payload) => {
          console.log('Game status change received!', payload);
          router.push(`/gameplay/${roomId}`);
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(playerChannel);
      supabase.removeChannel(gameChannel);
    };
  }, [roomId, playerId]);

  useEffect(() => {
    // Log players when they change
    console.log('Updated players:', players);
  }, [players]);

  const handleSubmit = async () => {
    console.log('Start');
    // router.push(`/gameplay/${roomId}`);

    const { data: gameData, error: gameError } = await supabase
      .from('maze-game-table')
      .update({ game_status: 'In_progress' })
      .eq('room_id', roomId);

    if (gameError) {
      console.error('Error updating data in maze_game_table:', gameError);
      return;
    }
  };

  useEffect(() => {
    const mode = sessionStorage.getItem('selectedMode') || 'easy'; // Default to 'easy' if not found
    console.log('Selected Mode:', mode);

    if (typeof roomId === 'string') {
      generateAndSaveMaze(mode, roomId); // Pass mode and roomId to the function
    }
  }, [roomId]);

  const copyRoomIdToClipboard = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId.toString()).then(() => {
        alert('Room ID copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    }
  };

  return (
    <main className={`flex min-h-screen flex-col items-center justify-center p-24 ${inter.className} bg-custom-image`}>
      <div className='flex flex-col items-center justify-center absolute top-20 left-1/2 transform -translate-x-1/2'>
        <h1 className='text-white text-3xl font-bold mb-4'>
          Room ID: {roomId}
        </h1>
        <button
          onClick={copyRoomIdToClipboard}
          className='mb-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200'
        >
          Copy Room ID
        </button>
      </div>
      <div className='w-full md:w-96 bg-white rounded-lg shadow-lg p-6'>
        <p className='text-center text-lg font-semibold mb-4'>Players:</p>
        <ul className='space-y-4'>
          {players.map((player) => (
            <li
              key={player.player_id}
              className={`flex items-center p-3 rounded-md shadow-md ${player.player_id === playerId ? 'bg-red-200' : 'bg-gray-100'}`}
            >
              <div className={`w-12 h-12 flex items-center justify-center ${player.player_id === playerId ? 'bg-red-500' : 'bg-red-300'} text-white rounded-full text-xl font-bold mr-3`}>
                {player.player_name[0]}
              </div>
              <span className='text-lg font-medium'>
                {player.player_name} {player.player_id === playerId ? '(You)' : ''}
              </span>
            </li>
          ))}
        </ul>
        <p className='text-center mt-4 text-lg font-semibold'>{players.length} players</p>
      </div>
      {is_host && (
        <button
          onClick={handleSubmit}
          className='fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200'
        >
          Start Game
        </button>
      )}
    </main>
  );
}