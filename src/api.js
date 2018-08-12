import Promise from 'bluebird';
import Cookie from 'js-cookie';
import { BigNumber } from 'bignumber.js';
import web3 from '@/web3';
import * as config from '@/config';
import request from 'superagent';
import timeout from 'timeout-then';
import meinvABI from './abi/meinvABI.json';
import swal from 'sweetalert';


// Sometimes, web3.version.network might be undefined,
// as a workaround, use defaultNetwork in that case.
const networkId = 1;
const network = config.network[networkId] || config.defaultNetwork;
const meinvContract = new web3.eth.Contract(meinvABI, network.contract);

let store = [];
let isInit = false;


export const init = async () => {
  await request
    .get('https://api.leancloud.cn/1.1/classes/ad')
    .set({
      'X-LC-Id': 'R6A46DH2meySCVNM1uWOoW2M-gzGzoHsz',
      'X-LC-Key': '8R6rGgpHa0Y9pq8uO53RAPCB',
    })
    .type('json')
    .accept('json')
    .then((response) => {
      if (response.body && response.body.results) {
        store = response.body.results;
      }
      isInit = true;
    });
};

init().then();

export const getMe = async () => {
  if (!window.web3) {
    throw Error('NO_METAMASK');
  }
  return new Promise((resolve, reject) => {
    web3.eth.getAccounts((error, accounts) => {
      const address = accounts[0];
      if (address) {
        return resolve({ address });
      }
      return reject(new Error('METAMASK_LOCKED'));
    });
  });
};

export const getMyAddress = async() => {
  const me = await getMe();
  return me.address;
};

export const getAnnouncements = async () => {
  const response = await request
    .get('https://api.leancloud.cn/1.1/classes/announcement')
    .set({
      'X-LC-Id': 'R6A46DH2meySCVNM1uWOoW2M-gzGzoHsz',
      'X-LC-Key': '8R6rGgpHa0Y9pq8uO53RAPCB',
    })
    .type('json')
    .accept('json');

  if (response.body && response.body.results) {
    return response.body.results;
  }

  return [];
};

export const getGg = async (id, time = 0) => {
  if (!isInit) {
    return timeout((time + 1) * 500).then(() => getGg(id, time + 1));
  }

  const item = store.find(x => x.id === `${id}`);

  if (item && item.str) {
    return item.str;
  }

  return '';
};

export const setGg = async (id, str) => {
  const response = await request
    .get('https://api.leancloud.cn/1.1/classes/ad')
    .set({
      'X-LC-Id': 'R6A46DH2meySCVNM1uWOoW2M-gzGzoHsz',
      'X-LC-Key': '8R6rGgpHa0Y9pq8uO53RAPCB',
    })
    .type('json')
    .accept('json');
  if (response.body && response.body.results) {
    store = response.body.results;
  }
  const item = store.find(x => x.id === `${id}`);

  if (item) {
    // update request
    await request
      .put(`https://api.leancloud.cn/1.1/classes/ad/${item.objectId}`)
      .set({
        'X-LC-Id': 'R6A46DH2meySCVNM1uWOoW2M-gzGzoHsz',
        'X-LC-Key': '8R6rGgpHa0Y9pq8uO53RAPCB',
      })
      .type('json')
      .accept('json')
      .send({
        str,
      });
    // update store
    item.str = str;
  } else {
    // create request
    await request
      .post('https://api.leancloud.cn/1.1/classes/ad')
      .set({
        'X-LC-Id': 'R6A46DH2meySCVNM1uWOoW2M-gzGzoHsz',
        'X-LC-Key': '8R6rGgpHa0Y9pq8uO53RAPCB',
      })
      .type('json')
      .accept('json')
      .send({
        id: `${id}`,
        str,
      });
    // update store
    await init();
  }

  return str;
};

// 获取此卡片的推荐nextPrice，需要和卡片blockchain上的nextPrice进行比较，选择较大的创建交易
export const getNextPrice = async (id, time = 0) => {
  if (!isInit) {
    if (time >= 1500) {
      return 0;
    }

    return timeout((time + 1) * 500).then(() => getNextPrice(id, time + 1));
  }

  const item = store.find(x => x.id === `${id}`);

  if (item && item.nextPrice) {
    // Convert nextPrice from 'ether' to 'wei'
    return web3.toWei(item.nextPrice, 'ether');
  }

  return 0;
};

export const getLocale = async () => (
  Cookie.get('locale') ||
  (
    navigator.language ||
    navigator.browserLanguage ||
    navigator.userLanguage
  ).toLowerCase()
);

export const setLocale = async (locale) => {
  Cookie.set('locale', locale, { expires: 365 });
};

export const sellCard = (userAddress, cardId, price) => new Promise((resolve, reject) => {
  meinvContract.methods.sellCard(cardId, price).send({
    from: userAddress,
    value: 0,
    gas: 220000,
    gasPrice: 2 * 1000000000
  },
  (err, result) => (err ? reject(err): resolve(result)));
});

export const likePic = (userAddress, picId) => new Promise((resolve, reject) => {
  meinvContract.methods.likePic(picId).send({
    from: userAddress,
    value: 0,
    gas: 220000,
    gasPrice: 2 * 1000000000
  },
  (err, result) => (err ? reject(err): resolve(result)));
});

export const createNewPic = (userAddress, url) => new Promise((resolve, reject) => {
  meinvContract.methods.createNewPic(url).send({
    from: userAddress,
    value: 1000000000000000,
    gas: 220000,
    gasPrice: 2 * 1000000000
  },
  (err, result) => (err ? reject(err): resolve(result)));
});

const badPic = new Set([1]);

export const getNetwork = async () => {
  const netId = await Promise.promisify(web3.eth.net.getId)();
  return config.network[netId];
};

export const getAllPicInfo = async (address) => {
  const picList = [];
  const cardInfo = await meinvContract.methods.getAllPicInfo().call({
    from: address
  });
  // 0 for uint, 1 for address, 2 for string, 3 for bool
  const t = cardInfo['1'].length;
  var indexCount = 0;
  for (var i=0; i<t;i++) {
    var item = new Object();
    item.id = parseInt(cardInfo['0'][i*3+0]);
    item.index = indexCount;
    if (badPic.has(item.id)) {
      continue;
    }
    item.likeNumber = parseInt(cardInfo['0'][i*3+1]);
    item.ctime = cardInfo['0'][i*3+2];
    item.owner = cardInfo['1'][i];
    item.url = cardInfo['2'][i];
    item.confirmed = cardInfo['3'][i*3+0];
    item.deleted = cardInfo['3'][i*3+1];
    item.hasLiked = cardInfo['3'][i*3+2];
    picList.push(item);
    indexCount += 1;
  }
  const result = new Object();
  result.picList = picList;
  result.lastCreateTimestamp = parseInt(cardInfo['4']);
  return result;
};

export const getGameStats = async(address) => {
  const gameInfo = await meinvContract.methods.getGameStats().call({
    from: address
  });
  var operationList = [];
  var stepBonusList = [];
  var gameStats = new Object();
  for (var i=0; i<gameInfo['0'].length; i++) {
    var item = new Object();
    item.owner = gameInfo['0'][i][0];
    item.timestamp = parseInt(gameInfo['0'][i][1]);
    item.amount = parseFloat((parseInt(gameInfo['0'][i][2])*1.0/1000000000000000000).toFixed(3));
    item.realAmount = parseInt(gameInfo['0'][i][2]);
    item.opType = parseInt(gameInfo['0'][i][3]);
    operationList.push(item);
  }
  gameStats.operationList = operationList;
  gameStats.prizePool = parseFloat((parseInt(gameInfo['1'][0])*1.0/1000000000000000000).toFixed(3));
  gameStats.winnerPrizePool = parseFloat((gameStats.prizePool * 0.35).toFixed(3));
  gameStats.gameTotalBurn = parseInt(gameInfo['1'][1]);
  gameStats.maxBurn = parseInt(gameInfo['1'][2]);
  gameStats.gameTotalReserved = parseInt(gameInfo['1'][3]);
  gameStats.maxReserved = parseInt(gameInfo['1'][4]);
  gameStats.userHolderNumber = parseInt(gameInfo['1'][5]);
  gameStats.buyPrice = parseFloat((parseInt(gameInfo['1'][6])*1.0/1000000000000000000).toFixed(5));
  gameStats.buyTotalNumber = parseInt(gameInfo['1'][7]);
  gameStats.claimEthPrice = parseFloat((parseInt(gameInfo['1'][8])*1.0/1000000000000000000).toFixed(4));
  gameStats.gameStartTimestamp = parseInt(gameInfo['1'][9])
  gameStats.buyBalanceSum = parseFloat((parseInt(gameInfo['1'][10])*0.1/1000000000000000000).toFixed(3));
  gameStats.buyTotalSum = parseFloat((parseInt(gameInfo['1'][11])*1/1000000000000000000).toFixed(3));
  var currentTimestamp = Date.parse(new Date())/1000;
  if (currentTimestamp > gameStats.gameStartTimestamp) {
    gameStats.gameStarted = true;
    gameStats.startCountdown = 0;
  } else {
    gameStats.gameStarted = false;
    gameStats.startCountdown = gameStats.gameStartTimestamp - currentTimestamp;
  }
  // alert(gameStats.gameStartTimestamp + " " + currentTimestamp);
  // alert(gameStats.startCountdown);
  for (var i=0;i<gameInfo['2'].length;i++) {
    var item = new Object();
    item.owner = gameInfo['2'][i][0];
    item.prize = (parseInt(gameInfo['2'][i][1])*1.0/1000000000000000000).toFixed(3);
    item.stepCount = parseInt(gameInfo['2'][i][2]);
    stepBonusList.push(item);
  }
  stepBonusList.sort(function(a,b) {return b.stepCount - a.stepCount;})
  gameStats.stepBonusList = stepBonusList;
  gameStats.inviteCode = gameInfo['3'];
  gameStats.gameEnded = gameInfo['4'];
  return gameStats;
}

export const addWinnerPrize = (userAddress, donateNumber) => new Promise((resolve, reject) => {
  meinvContract.methods.addWinnerPrize(donateNumber).send({
    from: userAddress,
    value: donateNumber,
    gas: 220000,
    gasPrice: 2 * 1000000000
  },
  (err, result) => (err ? reject(err): resolve(result)));
});

export const buy = (userAddress, ethAmount, inviteCode) => new Promise((resolve, reject) => {
  meinvContract.methods.buy(inviteCode).send({
    from: userAddress,
    value: parseInt(parseFloat(ethAmount) * 1000000000000000000),
    gas: 360000,
    gasPrice: 2 * 1000000000
  },
  (err, result) => (err ? reject(err): resolve(result)));
});

export const claim = (userAddress) => new Promise((resolve, reject) => {
  meinvContract.methods.claim().send({
    from: userAddress,
    value: 0,
    gas: 400000,
    gasPrice: 2 * 1000000000
  },
  (err, result) => (err ? reject(err): resolve(result)));
});

export const sell = (userAddress, quantity) => new Promise((resolve, reject) => {
  meinvContract.methods.sell(quantity).send({
    from: userAddress,
    value: 0,
    gas: 360000,
    gasPrice: 2 * 1000000000
  },
  (err, result) => (err ? reject(err): resolve(result)));
});

export const destroy = (userAddress, quantity) => new Promise((resolve, reject) => {
  meinvContract.methods.destroy(quantity).send({
    from: userAddress,
    value: 0,
    gas: 360000,
    gasPrice: 2 * 1000000000
  },
  (err, result) => (err ? reject(err): resolve(result)));
});

export const setInviteCode = (userAddress, inviteCode) => new Promise((resolve, reject) => {
  meinvContract.methods.setInviteCode(inviteCode).send({
    from: userAddress,
    value: 10000000000000000,
    gas: 400000,
    gasPrice: 2 * 1000000000
  },
  (err, result) => (err ? reject(err): resolve(result)));
});

export const setInviteCodeFree = (userAddress, inviteCode) => new Promise((resolve, reject) => {
  meinvContract.methods.setInviteCodeFree(inviteCode).send({
    from: userAddress,
    value: 0,
    gas: 400000,
    gasPrice: 2 * 1000000000
  },
  (err, result) => (err ? reject(err): resolve(result)));
});

export const joinGame = (userAddress) => new Promise((resolve, reject) => {
  meinvContract.methods.joinGame().send({
    from: userAddress,
    value: "10000000000000000",
    gas: 220000,
    gasPrice: 2 * 1000000000
  },
  (err, result) => (err ? reject(err): resolve(result)));
});

export const getItemName = (itemId) => {
  const aaa = config.itemData[itemId]['name'];
  return aaa;
};
