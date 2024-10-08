import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import CopyIcon from '/images/copy.png';
import supabase from '../../../lib/supabaseClient';
import { generateAndSaveMaze } from '../../../components/generateAndSaveMaze';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import { toast, Toaster } from 'sonner';
const QRCodeSVG = dynamic(() => import('qrcode.react').then(mod => mod.QRCodeSVG), { ssr: false });

const inter = Inter({ subsets: ['latin'] });

const Lobby = () => {
  const router = useRouter();
  const { roomId } = router.query;
  // const { playerId } = router.query;
  const [players, setPlayers] = useState<any[]>([]);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState<boolean | null>(null);
  const [playerColor, setPlayerColor] = useState<string | null>(null);
  const [showCopyLabel, setShowCopyLabel] = useState<boolean>(false);

  useEffect(() => {
    // Access sessionStorage only in the browser
    const storedPlayerId = sessionStorage.getItem('playerId');
    const storedIsHost = sessionStorage.getItem('is_host') === 'true';
    const storedPlayerColor = sessionStorage.getItem('playerColor');

    setPlayerId(storedPlayerId);
    setIsHost(storedIsHost);
    setPlayerColor(storedPlayerColor);
  }, []);

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
      navigator.clipboard.writeText(`${window.origin}/join/${roomId}`)
        .then(() => {
          toast.success('Copied to clipboard!');
        })
        .catch(err => {
          toast.error('Failed to copy!');
          console.error('Error copying text: ', err);
        });
    }
  };


  return (
    <main className={`flex flex-col items-center justify-center p-6 ${inter.className} bg-custom-image`}>
      <div className='flex flex-col items-center'>
        <Toaster position='top-center' richColors duration={1000} />
        <h1 className='text-white text-5xl w-full text-center'>Lobby</h1>
        <p className='text-white text-md font-bold flex items-center gap-2'>
          <span className='font-normal'>RoomId:</span>
          <span className='font-normal whitespace-nowrap max-w-32 text-ellipsis overflow-hidden'>
            {roomId}
          </span>
          <div className='relative'>
            {roomId ? (
              <Image
                src='/images/copy.png'
                alt='Copy Icon'
                width={20}
                height={20}
                onClick={copyRoomIdToClipboard}
                style={{
                  marginLeft: 2,
                  cursor: 'pointer',
                }}
                onMouseEnter={() => {
                  setShowCopyLabel(true);
                }}
                onMouseOut={() => {
                  setShowCopyLabel(false);
                }}
              />
            ) : null}
            {showCopyLabel ? (
              <span className='absolute left-2 bottom-6 hidden1 text-xs font-normal'>
                copy
              </span>
            ) : null}
          </div>
        </p>
        <br />
        <QRCodeSVG value={`https://a-maze-web.vercel.app/join/${roomId}`} />


        <ul className='w-full text-white'>
          <p className='w-full text-white text-center text-3xl p-4 pb-2'>Rules</p>
          <li>- Be the fastest to reach the goal</li>
          <li>- Use the arrow keys to move</li>
          <li>- Start is in the top-left corner</li>
          <li>- Goal is in the bottom-right corner</li>

        </ul>
      </div>
      <br />

      <div className='w-full md:w-96 bg-white rounded-lg shadow-lg p-3'>
        <p className='text-red-900 text-center text-lg font-semibold mb-4'>Players:</p>
        <ul className='space-y-4'>
          {players.map((player) => (
            <li
              key={player.player_id}
              className={`flex items-center p-1 rounded-md shadow-md ${player.player_id === playerId ? 'bg-red-200' : 'bg-gray-100'} ${player.player_id === playerId ? '' : 'opacity-60'}`} // 自分以外のアイコンに opacity を設定
            >
              <div
                className={`w-7 h-7 flex items-center justify-center text-white rounded-full text-xl font-bold mr-3`}
                style={{ backgroundColor: player.player_color || 'gray' }} // アイコンの背景色を設定
              >
                {player.player_name[0]}
              </div>
              <span
                className='text-lg font-medium'
                style={{ color: player.player_color || 'black' }} // 名前の色を player_color で設定
              >
                {player.player_name} {player.player_id === playerId ? '(You)' : ''}
              </span>

            </li>
          ))}
        </ul>
        <p className='text-red-900 text-center mt-4 text-lg font-semibold'>{players.length} players</p>
      </div>
      {isHost && (
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

export default Lobby