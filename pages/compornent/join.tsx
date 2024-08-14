import router, { useRouter } from 'next/router';

export default function Join() {
    const handleSubmit = () => {
        console.log("Join");
        // TODO: navigate to gameplay page;
        router.push('/gameplay');
    };

    return (
        <div className="flex flex-col items-center justify-center border border-white rounded-lg p-4 bg-white w-80">
            <h2 className='text-red-900 font-medium text-lg text-center pb-2'>
                Join game
            </h2>
            <input
                type='text'
                placeholder='Enter room ID'
                className='border border-gray-300 rounded bg-white p-2 w-full mb-4 text-black-800 focus:border-gray-500'
            />
            <input
                type='text'
                placeholder='Enter your display name'
                className='border border-gray-300 rounded bg-white p-2 w-full mb-4 text-black-800 focus:border-gray-500'
            />
            <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-red-600 rounded text-white hover:bg-red-700 w-full"
            >
                Submit
            </button>
        </div>
    );
}
