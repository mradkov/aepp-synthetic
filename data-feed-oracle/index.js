import Ae from '@aeternity/aepp-sdk/es/ae/universal'
import Node from '@aeternity/aepp-sdk/es/node'
import * as Crypto from '@aeternity/aepp-sdk/es/utils/crypto'

const util = require('util');
const dns = require('dns');
const setTimeoutPromise = util.promisify(setTimeout);

const config = {
  contractAddress: "ct_27GvKZe88wxaw8vWNArjokojXnHUZSPPum441dK2o4XKCWcNk8",
  contractSource:`@compiler >= 4
contract DataProvider =
  type state = int
  entrypoint init() : state = 1
  entrypoint get() : int = state
  stateful entrypoint update(x: int) = put(x)`,
  keypair: {
    publicKey: "ak_qBjk7ctehTwReM93LBHW6fXBCt2btwLtXx9AChneyF2VvyG7Z",
    secretKey: "daff9ee05abe1a836f71e0cc7dfed9bc790402fc33d9e1bfba3134bdc0320bbd6d69037b2917e7169fd4db0093ca67f4857940dd8f31ddea9c2b9a2e1a0044a0"
  }
}


Node.debugSwagger(false)({
  url: 'https://sdk-testnet.aepps.com',
  internalUrl: 'https://sdk-testnet.aepps.com',
}).then(node => {
  
  Ae({
    compilerUrl: 'https://compiler.aepps.com',
    nodes: [{name: 'testnet', instance: node}],
    keypair: config.keypair,
  }).then(async ae => {
    console.log('connected!')
    const contractInstance = await ae.getContractInstance(config.contractSource, { contractAddress: config.contractAddress, callStatic: true });

    const update = await contractInstance.methods.update(2)
    console.log(update)

  }).catch(err => console.log(err))
})

