import { useState } from 'react';

function Wallet({ publicKey, privateKey, balance, index }) {
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const togglePrivateKey = () => {
    setShowPrivateKey(!showPrivateKey);
  };

  return (
    <div className="mt-8 bg-gray-100 p-4 rounded-lg shadow-inner">
      <strong className="flex justify-center items-center">Wallet {index + 1}</strong>
      <p className="mb-4">
        <strong>Public Key:</strong> {publicKey}
      </p>
      {showPrivateKey && (
        <p className="mb-4">
          <strong>Private Key (DO NOT SHARE):</strong> {privateKey}
        </p>
      )}
      <p className="mb-4">
        <strong>Balance:</strong> {balance} ETH
      </p>
      <button
        className="bg-gray-300 hover:bg-gray-500 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={togglePrivateKey}
      >
        {showPrivateKey ? 'Hide' : 'Show'} Private Key
      </button>
    </div>
  );
}

export default Wallet;
