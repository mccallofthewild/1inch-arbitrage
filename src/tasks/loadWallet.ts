import fs from 'fs';
import { ethers } from 'ethers';
import { path } from '../helpers/path';
export const loadWallet = async (provider: ethers.providers.Provider) => {
	const walletPass =
		'82998239798427987f9s87f98s7f7s0g7h00a7809320800z99g9d0nnisslkjfjkmdfsm8';
	let wallet: ethers.Wallet;
	if (fs.existsSync(path`../../wallet.json`)) {
		console.log('wallet exists!!!');

		wallet = await ethers.Wallet.fromEncryptedJson(
			fs.readFileSync(path`../../wallet.json`).toString(),
			walletPass
		);
	} else {
		wallet = ethers.Wallet.createRandom();
		fs.writeFileSync(path`../../wallet.json`, await wallet.encrypt(walletPass));
		fs.writeFileSync(path`../../WALLET_ADDRESS`, wallet.address);
	}
	return wallet.connect(provider);
};
