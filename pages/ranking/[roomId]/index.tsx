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
    <div className='flex justify-center items-center h-screen bg-custom-image'>
      <Ranking roomId={roomId} />
      <button
        type='button'
        onClick={handleHomeClick}
        className='absolute bottom-4 center-4 px-4 py-2 bg-red-600 rounded text-white hover:bg-red-700 z-100000'
      >
        Home
      </button>
    </div>
  );
};

export default RankingPage;
