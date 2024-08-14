import { useRouter } from 'next/router';
import { useState } from 'react';

// const logFunction = () => {
//     console.log("Start");
//     // TODO: navigate to gameplay page
// };

export default function Mode() {
    const router = useRouter();
    const [selectedMode, setSelectedMode] = useState<string>('easy'); // Default to 'easy'

    const handleSubmit = () => {
        console.log("Start");
        router.push({
            pathname: '/gameplay',
            query: { mode: selectedMode }
        });
    };

    return (
        <div className="flex flex-col items-center justify-center border border-white rounded-lg p-4 bg-white w-80">
            <h2 className='text-red-900 font-medium text-lg text-center pb-2'>
                Host game
            </h2>
            <input
                type='text'
                placeholder='Enter your display name'
                className='border border-gray-300 rounded bg-white p-2 w-full mb-4 text-black-900 focus:border-red-700'
            />
            <p className="mb-4 text-red-900">Please choose the mode</p>
            <div className="flex gap-4 mb-4">
                <label className="flex items-center text-red-900">
                    <input type="radio" name="mode" value="easy" defaultChecked onChange={(ev) => { setSelectedMode(ev.target.value) }} className="mr-2" />
                    Easy
                </label>
                <label className="flex items-center text-red-900">
                    <input type="radio" name="mode" value="hard" onChange={(ev) => { setSelectedMode(ev.target.value) }} className="mr-2" />
                    Hard
                </label>
                <label className="flex items-center text-red-900">
                    <input type="radio" name="mode" value="super-hard" onChange={(ev) => { setSelectedMode(ev.target.value) }} className="mr-2" />
                    Super Hard
                </label>
            </div>
            <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-red-600 rounded text-white hover:bg-red-700 w-full"
            >
                Submit
            </button>
        </div>
    );
}
