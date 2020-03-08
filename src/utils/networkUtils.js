import throttle from 'lodash/throttle';

export const GWEI_UNIT = 1000000000;

export const SUPPORTED_NETWORKS = {
	1: 'MAINNET',
	3: 'ROPSTEN',
	4: 'RINKEBY',
	42: 'KOVAN',
	MAINNET: 1,
	ROPSTEN: 3,
	RINKEBY: 4,
	KOVAN: 42,
};

export const DEFAULT_GAS_LIMIT = {
	mint: 2200000,
	burn: 2200000,
	claim: 1400000,
	exchange: 220000,
	sendSNX: 120000,
	sendEth: 21000,
	sendSynth: 150000,
};

export const INFURA_PROJECT_ID = process.env.REACT_APP_INFURA_PROJECT_ID;

export const INFURA_JSON_RPC_URLS = {
	1: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
	3: `https://ropsten.infura.io/v3/${INFURA_PROJECT_ID}`,
	4: `https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`,
	42: `https://kovan.infura.io/v3/${INFURA_PROJECT_ID}`,
};

export const PORTIS_APP_ID = '26e198be-a8bb-4240-ad78-ae88579085bc';

export const SUPPORTED_WALLETS_MAP = {
	METAMASK: 'Metamask',
	TREZOR: 'Trezor',
	LEDGER: 'Ledger',
	COINBASE: 'Coinbase',
	WALLET_CONNECT: 'WalletConnect',
	PORTIS: 'Portis',
};
export const SUPPORTED_WALLETS = Object.values(SUPPORTED_WALLETS_MAP);

export const hasWeb3 = () => {
	return window.web3;
};

export const defaultNetwork = { name: 'MAINNET', networkId: 1 };

export async function getEthereumNetwork() {
	if (!window.web3) return defaultNetwork;
	let networkId = 1;
	try {
		if (window.web3?.eth?.net) {
			networkId = await window.web3.eth.net.getId();
			return { name: SUPPORTED_NETWORKS[networkId], networkId: Number(networkId) };
		} else if (window.web3?.version?.network) {
			networkId = Number(window.web3.version.network);
			return { name: SUPPORTED_NETWORKS[networkId], networkId };
		} else if (window.ethereum?.networkVersion) {
			networkId = Number(window.ethereum?.networkVersion);
			return { name: SUPPORTED_NETWORKS[networkId], networkId };
		}
		return defaultNetwork;
	} catch (e) {
		console.log(e);
		return defaultNetwork;
	}
}

export const getTransactionPrice = (gasPrice, gasLimit, ethPrice) => {
	if (!gasPrice || !gasLimit || !ethPrice) return 0;
	return (gasPrice * ethPrice * gasLimit) / GWEI_UNIT;
};

const getPriceLimit = (networkInfo, gasPriceLimit) => {
	const fast = networkInfo.fast / 10;
	const average = networkInfo.average / 10;
	const slow = networkInfo.safeLow / 10;

	const speed = {
		fast,
		average,
		slow,
	};

	if (gasPriceLimit) {
		return {
			...speed,
			fastestAllowed: gasPriceLimit,
			averageAllowed: Math.min(average, gasPriceLimit),
			slowAllowed: Math.min(slow, gasPriceLimit),
		};
	}
	return {
		...speed,
		fastestAllowed: fast,
		averageAllowed: average,
		slowAllowed: slow,
	};
};

export const getGasInfo = async () => {
	try {
		const results = await fetch('https://ethgasstation.info/json/ethgasAPI.json');
		const networkInfo = await results.json();
		return getPriceLimit(networkInfo, 0);
	} catch (e) {
		console.log('Error while getting gas info', e);
	}
};

export function onMetamaskAccountChange(cb) {
	if (!window.ethereum) return;
	const listener = throttle(cb, 1000);
	window.ethereum.on('accountsChanged', listener);
}

export function onMetamaskNetworkChange(cb) {
	if (!window.ethereum) return;
	const listener = throttle(cb, 1000);
	window.ethereum.on('networkChanged', listener);
}

export const isMainNet = (networkId) => networkId === SUPPORTED_NETWORKS.MAINNET;
