"use client";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { toHex,utf8ToBytes } from "ethereum-cryptography/utils";
import { useState } from 'react';
import Wallet from "./Wallet";
import { keccak256 } from "ethereum-cryptography/keccak";
export default function Test() {

  const [wallets, setWallets] = useState([]);
  const [senderIndex, setSenderIndex] = useState(0);
  const [senderPrivateKey, setSenderPrivateKey] = useState("");
  const [recipientPublicKey, setRecipientPublicKey] = useState("");
  const [amount, setAmount] = useState(0);

  function generateKeys() {
    if (wallets.length >= 2) {
      alert("You can only create up to 2 wallets.");
      return;
    }
    const privateKey = secp256k1.utils.randomPrivateKey();
    const privateKeyHex = toHex(privateKey);
    const publicKey = secp256k1.getPublicKey(privateKey);
    const publicKeyHex = toHex(publicKey);
    const newWallet = {
      publicKey: publicKeyHex,
      privateKey:privateKeyHex,
      balance: 100,
    };

    setWallets([...wallets, newWallet]);
  }

  function sendTransaction() {
    if (!recipientPublicKey) {
      alert("Please enter the recipient's public key.");
      return;
    }

    const sender = wallets[senderIndex];
    const recipientIndex = wallets.findIndex(wallet => wallet.publicKey === recipientPublicKey);
    if (amount <= 0) {
      alert("Please enter a positive amount.");
      return;
    }

    if (amount > sender.balance) {
      alert("Insufficient balance.");
      return;
    }

    if (sender.publicKey === recipientPublicKey) {
      alert("Cannot send to the same address.");
      return;
    }
    if (recipientIndex === -1) {
      alert("Recipient public key not found.");
      return;
    }

    // Create message and hash it
    const message = `Send ${amount} ETH to ${recipientPublicKey}`;
    const messageHash = keccak256(utf8ToBytes(message));

    // Sign the message hash
    const privateKeyBytes = Uint8Array.from(Buffer.from(senderPrivateKey, 'hex'));
    const signature = secp256k1.sign(messageHash, privateKeyBytes)

    // Verify the signature
    const publicKeyBytes = Uint8Array.from(Buffer.from(sender.publicKey, 'hex'));
    const isValidSignature = secp256k1.verify(signature, messageHash, publicKeyBytes);

    if (!isValidSignature) {
      alert("Invalid signature. Transaction aborted.");
      return;
    }

    const updatedSender = { ...sender, balance: sender.balance - amount };
    const recipient = wallets[recipientIndex];
    const updatedRecipient = { ...recipient, balance: recipient.balance + amount };
    const updatedWallets = wallets.map((wallet, index) => {
      if (index === senderIndex) return updatedSender;
      if (index === recipientIndex) return updatedRecipient;
      return wallet;
    });

    setWallets(updatedWallets);
    setAmount(0); // Reset amount after sending
    alert(`Sent ${amount} ETH to ${recipientPublicKey}`);
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-6">CryptoGraphy</h1>
        {wallets.map((wallet, index) => (
          <Wallet key={index} privateKey={wallet.privateKey} publicKey={wallet.publicKey} balance={wallet.balance} index={index} />
        ))}

        <div className="flex justify-center items-center">
          {wallets.length !== 2 ? (
            <button
              className="bg-blue-500 mt-5 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={generateKeys}
            >
              Generate Keys and Get Funds
            </button>
          ) : (
            <div className="mt-8 bg-gray-100 p-8 border rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Send Transaction</h2>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Sender Wallet:</label>
                <select
                  value={senderIndex}
                  onChange={(e) => setSenderIndex(Number(e.target.value))}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  {wallets.map((wallet, index) => (
                    <option key={index} value={index}>
                      Wallet {index + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Sender Private Key:</label>
                <input
                  type="text"
                  value={senderPrivateKey}
                  onChange={(e) => setSenderPrivateKey(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter sender's private key"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Recipient Public Key:</label>
                <input
                  type="text"
                  value={recipientPublicKey}
                  onChange={(e) => setRecipientPublicKey(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter recipient's public key"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Amount:</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter amount to send"
                />
              </div>
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={sendTransaction}
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}