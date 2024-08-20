import Image from 'next/image';
import { Inter } from 'next/font/google';
import { useEffect, useState } from 'react';
import { generateAndSaveMaze } from '../../../components/generateAndSaveMaze';
import { useRouter } from 'next/router';
import supabase from '../../../lib/supabaseClient';

const inter = Inter({ subsets: ['latin'] });

export default function Lobby() {
  const router = useRouter();
  const { roomId } = router.query;
  const { playerId } = router.query;
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    if (playerId && roomId) {
      setPlayers((prevPlayers) => [
        ...prevPlayers,
        { player_id: playerId, room_id: roomId, player_name: 'You', is_host: false }
      ]);
    }

    // リアルタイムでプレイヤーの情報を受信
    const channels = supabase.channel('custom-insert-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'game-player-table', filter: `room_id=eq.${roomId}` },
        (payload) => {
          console.log('Change received!', payload)
          setPlayers((prevPlayers) => [...prevPlayers, payload.new]);
        }
      )
      .subscribe()

    // クリーンアップ
    return () => {
      supabase.removeChannel(channels);
    };
  }, [roomId, playerId]);

  const handleSubmit = () => {
    console.log('Start');
    // Store player name and roomId in sessionStorage
    // sessionStorage.setItem('playerName', playerName);
    // sessionStorage.setItem('roomId', roomId); // Store roomId

    // Navigate to gameplay page with roomId
    router.push(`/gameplay/${roomId}`);
  };

  // const channels = supabase.channel('custom-insert-channel')
  //   .on(
  //     'postgres_changes',
  //     { event: 'INSERT', schema: 'public', table: 'game-player-table', filter: `room_id=eq.${roomId}` },
  //     (payload) => {
  //       console.log('Change received!', payload)
  //       setPlayers((prevPlayers) => [...prevPlayers, payload.new]);
  //     }
  //   )
  //   .subscribe()


  useEffect(() => {
    // Call the function to generate and save the maze when the component mounts
    // const roomId = 'actual-room-id'; // Replace with actual room ID or fetch dynamically
    const mode = sessionStorage.getItem('selectedMode') || 'easy'; // Default to 'easy' if not found
    console.log('Selected Mode:', mode); // Debug log ここでは、正しくmodeを入手することができている。

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
      <h1 className='text-white text-3xl font-bold mb-4'>
        Room ID: {roomId}
      </h1>
      <button
        onClick={copyRoomIdToClipboard}
        className='mb-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200'
      >
        Copy Room ID
      </button>
      <div className='w-full md:w-96 bg-white rounded-lg shadow-lg p-6'>
        <p className='text-center text-lg font-semibold mb-2'>Players:</p>
        <ul className='list-disc pl-5 space-y-2'>
          {players.map((player) => (
            <li key={player.player_id} className='flex items-center p-2 bg-gray-100 rounded-md'>
              <span className='ml-3'>{player.player_name}</span>
            </li>
          ))}
        </ul>
        <p className='text-center mt-4'>{players.length} players</p>
      </div>
      <button
        onClick={handleSubmit}
        className='absolute bottom-10 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200'
      >
        Start Game
      </button>
    </main>
  );
}