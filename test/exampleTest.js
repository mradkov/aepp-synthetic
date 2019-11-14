/*
 * ISC License (ISC)
 * Copyright (c) 2018 aeternity developers
 *
 *  Permission to use, copy, modify, and/or distribute this software for any
 *  purpose with or without fee is hereby granted, provided that the above
 *  copyright notice and this permission notice appear in all copies.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 *  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 *  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 *  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 *  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 *  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 *  PERFORMANCE OF THIS SOFTWARE.
 */

const AeSDK = require('@aeternity/aepp-sdk');
const Universal = AeSDK.Universal;
const Crypto = AeSDK.Crypto;
const MemoryAccount = AeSDK.MemoryAccount;
const Deployer = require('aeproject-lib').Deployer;
const DATA_PROVIDER_CONTRACT_PATH = "./contracts/DataProvider.aes";
const CONTRACT_SOURCE_DATA_PROVIDER = utils.readFileRelative(DATA_PROVIDER_CONTRACT_PATH, 'utf-8');
const SYNTHETIC_CONTRACT_PATH = "./contracts/SyntheticBet.aes";
const CONTRACT_SOURCE_SYNTHETIC = utils.readFileRelative(SYNTHETIC_CONTRACT_PATH, 'utf-8');


describe('Synthetic Contract', () => {

  let deployer, dataProvider, syntheticInstance;
  let client;
    
  before(async () => {
    client = await Universal({
      url: "http://localhost:3001",
      internalUrl: "http://localhost:3001/internal",
      accounts: [
          MemoryAccount({ keypair: { secretKey: wallets[0].secretKey, publicKey: wallets[0].publicKey } }),
          MemoryAccount({ keypair: { secretKey: wallets[1].secretKey, publicKey: wallets[1].publicKey } }),
          MemoryAccount({ keypair: { secretKey: wallets[2].secretKey, publicKey: wallets[2].publicKey } })
      ],
      networkId: "ae_devnet",
      compilerUrl: "http://localhost:3080"
    })
  })

  it('Deploying Contracts', async () => {
    dataProvider = await client.getContractInstance(CONTRACT_SOURCE_DATA_PROVIDER);
    const init = await dataProvider.deploy([]);
    assert.equal(init.result.returnType, 'ok');

    syntheticInstance = await client.getContractInstance(CONTRACT_SOURCE_SYNTHETIC);
    const init2 = await syntheticInstance.deploy([dataProvider.deployInfo.address, 10]);
    assert.equal(init2.result.returnType, 'ok');
  })

  it('Should place bet from client side 1', async () => {
    const result = await syntheticInstance.methods.place_bet("BTC", true, { amount : 500, onAccount: wallets[0].publicKey })
    assert.ok(result.decodedResult >= 0, "cant place properly")  
  })

  it('Should take bet from client side 2', async () => {
    const result = await syntheticInstance.methods.take_bet(0, false, { amount : 500 , onAccount: wallets[1].publicKey })
    assert.ok(result.decodedResult, "cant place properly")  
  })

  it('should liquidate propertly', async () => {
    const update_data = await dataProvider.methods.update(2)

    const result = await syntheticInstance.methods.liquidate(0, { onAccount: wallets[0].publicKey })
    assert.ok(result.decodedResult, "cant liquidate properly")  
  })

})