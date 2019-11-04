import React from 'react';
import { ChartCard } from './ChartCard';

export default {
	title: 'Charts',
};

const chartData = [
	{
		block: 9589418,
		synth: 'sBTC',
		timestamp: 1583122553000,
		date: '2020-03-02T04:15:53.000Z',
		hash: '0x764a76c12c92216f05f32fb0b4b94a80fa5e7243740ab990d14a3b8598bfd857',
		rate: 8639.27353705313,
	},
	{
		block: 9589331,
		synth: 'sBTC',
		timestamp: 1583121381000,
		date: '2020-03-02T03:56:21.000Z',
		hash: '0x174487c8d92c45d803624c3c3936a554dcd044242886f42455bea763aa51e196',
		rate: 8616.80211567975,
	},
	{
		block: 9589175,
		synth: 'sBTC',
		timestamp: 1583119462000,
		date: '2020-03-02T03:24:22.000Z',
		hash: '0x93aac298d1f41f5eff8ad4da2a079c9750ae0d826e4f1f6362245da0d6b356a3',
		rate: 8620.092666636157,
	},
	{
		block: 9589163,
		synth: 'sBTC',
		timestamp: 1583119335000,
		date: '2020-03-02T03:22:15.000Z',
		hash: '0x5c169f56b0f03657b4c750b10f1102fcb61a4cef051834974bdbb5f272fa8ce2',
		rate: 8609.540195755113,
	},
	{
		block: 9589150,
		synth: 'sBTC',
		timestamp: 1583119204000,
		date: '2020-03-02T03:20:04.000Z',
		hash: '0x9d5984fdefb3511ce49be489b02f75817e7469ec6d7b3986e93700ac57941089',
		rate: 8620.331990138491,
	},
	{
		block: 9589142,
		synth: 'sBTC',
		timestamp: 1583118972000,
		date: '2020-03-02T03:16:12.000Z',
		hash: '0x53d2ffc7d1629e45ef82f78f65cad34a7d80be4fca925e56811937d8861b7ec2',
		rate: 8607.417506899714,
	},
	{
		block: 9589086,
		synth: 'sBTC',
		timestamp: 1583117863000,
		date: '2020-03-02T02:57:43.000Z',
		hash: '0x5b5060eca7e453233229b5a2db462a851003b93ba2681746e137b8fc2bed6df8',
		rate: 8622.512097798184,
	},
	{
		block: 9588982,
		synth: 'sBTC',
		timestamp: 1583116369000,
		date: '2020-03-02T02:32:49.000Z',
		hash: '0x77f44de570f3314e850cb1fab66dd3f77426d10da753c62a77d438382e5f82f7',
		rate: 8613.39227876373,
	},
	{
		block: 9588929,
		synth: 'sBTC',
		timestamp: 1583115715000,
		date: '2020-03-02T02:21:55.000Z',
		hash: '0xbf106b2c4e6b27634bd01aa1bdb7b2ba15495f2d5dd3fdd224427e9749f7e21e',
		rate: 8578.583846530913,
	},
	{
		block: 9588911,
		synth: 'sBTC',
		timestamp: 1583115477000,
		date: '2020-03-02T02:17:57.000Z',
		hash: '0xecc087cb1001fbd5f75e4c75c542f540253810222fc4544b9f0bee553230e7e1',
		rate: 8567.695633017569,
	},
	{
		block: 9588852,
		synth: 'sBTC',
		timestamp: 1583114776000,
		date: '2020-03-02T02:06:16.000Z',
		hash: '0x86261fd846d9170da1a947bafba9f80dc70d5af0eaf41578b3fdcb446f6c61c5',
		rate: 8577.921559817205,
	},
	{
		block: 9588729,
		synth: 'sBTC',
		timestamp: 1583113090000,
		date: '2020-03-02T01:38:10.000Z',
		hash: '0x891c502dbe3801b969a71f9a007e8426a8b57ec564e1ea9c83a12fe3d86c18d5',
		rate: 8555.206601140308,
	},
	{
		block: 9588708,
		synth: 'sBTC',
		timestamp: 1583112845000,
		date: '2020-03-02T01:34:05.000Z',
		hash: '0x5af4c0ba272e44d59c91ac22554d4ec344a473fc7c375ddf3399799d69250fbe',
		rate: 8540.102634482791,
	},
	{
		block: 9588640,
		synth: 'sBTC',
		timestamp: 1583111884000,
		date: '2020-03-02T01:18:04.000Z',
		hash: '0x6958670b1d695b51faad12d9e9b59fbe1b5253017d2827c0950b7e70e8de1bde',
		rate: 8530.423052418673,
	},
	{
		block: 9588609,
		synth: 'sBTC',
		timestamp: 1583111404000,
		date: '2020-03-02T01:10:04.000Z',
		hash: '0xdfb10bd7c261d2726df9a328b1036b3441e49d6c318be2356a374f94fc3fc46c',
		rate: 8547.538919338096,
	},
	{
		block: 9588455,
		synth: 'sBTC',
		timestamp: 1583109487000,
		date: '2020-03-02T00:38:07.000Z',
		hash: '0x7d80fba48823db1d75accb7a274f2d80917a9168d949dc4150868775c26b8292',
		rate: 8559.046266197163,
	},
	{
		block: 9588362,
		synth: 'sBTC',
		timestamp: 1583108333000,
		date: '2020-03-02T00:18:53.000Z',
		hash: '0x7991b1fa34c26a0addb6311ba38730b15c713d629d073b6e27ec12543cb0e217',
		rate: 8541.371450315788,
	},
	{
		block: 9588309,
		synth: 'sBTC',
		timestamp: 1583107476000,
		date: '2020-03-02T00:04:36.000Z',
		hash: '0x5ef83c0b6459af6beb5ef161f15e92edee872e361b06f1982e5c8f86339165c0',
		rate: 8517.68305956404,
	},
	{
		block: 9588235,
		synth: 'sBTC',
		timestamp: 1583106612000,
		date: '2020-03-01T23:50:12.000Z',
		hash: '0x54a6f65c3cc1526d0f6ad78db15a282ec24c5dc3dedd6bc8624a6d0a8e64664e',
		rate: 8538.69894744671,
	},
	{
		block: 9588180,
		synth: 'sBTC',
		timestamp: 1583105776000,
		date: '2020-03-01T23:36:16.000Z',
		hash: '0xd73520f7ce4bc1251be7b7ba242676ca2430a9777edd157dd9f10fd1b909706b',
		rate: 8551.136665240583,
	},
	{
		block: 9588122,
		synth: 'sBTC',
		timestamp: 1583104926000,
		date: '2020-03-01T23:22:06.000Z',
		hash: '0x66293ddad9567ec8cd9ee6a2aa57fb769ccabfb4cdd81b5b3d88ddacaf067995',
		rate: 8577.57359546128,
	},
	{
		block: 9588100,
		synth: 'sBTC',
		timestamp: 1583104558000,
		date: '2020-03-01T23:15:58.000Z',
		hash: '0x6706cbafd5734981aef96a690e82f6b43fd2c489f9d40afae28cc00f6ba1020b',
		rate: 8568.563890573445,
	},
	{
		block: 9588082,
		synth: 'sBTC',
		timestamp: 1583104353000,
		date: '2020-03-01T23:12:33.000Z',
		hash: '0x3357b297ba68220b754399b3e14c71bce28518b345838e52859865f0391bbcf0',
		rate: 8542.662903882574,
	},
	{
		block: 9587949,
		synth: 'sBTC',
		timestamp: 1583102543000,
		date: '2020-03-01T22:42:23.000Z',
		hash: '0xa66431bcacf9a637f100c53dfadcf8d880e728a2b2c21216051a4249f77d48bd',
		rate: 8565.035004246698,
	},
	{
		block: 9587922,
		synth: 'sBTC',
		timestamp: 1583102176000,
		date: '2020-03-01T22:36:16.000Z',
		hash: '0x7d39320ed97864c40103b0b197d96a7febf725f68ae06acc40e0cbd0ca295323',
		rate: 8539.037699779485,
	},
];

export const card = () => (
	<ChartCard
		baseCurrencyKey="sETH"
		quoteCurrencyKey="sUSD"
		price="$1.5"
		change={-0.5}
		chartData={chartData}
	/>
);
