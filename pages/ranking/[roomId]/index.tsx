import { useRouter } from 'next/router';
import Ranking from '@/components/ranking';

const RankingPage = () => {
  const router = useRouter();
  const { roomId } = router.query;

  const handleHomeClick = () => {
    router.push('/');
  };

  if (typeof roomId !== 'string') {
    return <div>Invalid roomId</div>;
  }

  return (
    <div className='flex flex-col justify-between items-center h-screen bg-custom-image relative'>
      <div className='flex flex-col justify-center items-center flex-grow'>
        <h1 className='text-white text-5xl mb-5 z-30'>Ranking</h1>
        <Ranking roomId={roomId} />
      </div>
      <button
        type='button'
        onClick={handleHomeClick}
        className='absolute bottom-4 px-4 py-2 bg-red-600 rounded text-white hover:bg-red-700'
      >
        Home
      </button>
    </div>
  );
};


export default RankingPage;
