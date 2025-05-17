// pages/index.js
import { useState } from 'react'
import Para, { Environment } from '@getpara/web-sdk'
import { ParaEthersSigner }   from '@getpara/ethers-v6-integration'
import { ethers }             from 'ethers'

export default function Home() {
  const [signer, setSigner] = useState(null)

  // ← These will come from Vercel env vars in a bit
  const API_KEY       = process.env.NEXT_PUBLIC_PARA_KEY
  const RPC_URL       = process.env.NEXT_PUBLIC_RPC_URL
  const CONTRACT_ADDR = process.env.NEXT_PUBLIC_CONTRACT_ADDR
  const CONTRACT_ABI  = ['function claim() returns (bool)']

  const connect = async () => {
    const para = new Para(Environment.BETA, API_KEY)
    await para.init()
    if (!await para.isFullyLoggedIn()) {
      await para.createUser()
    }
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    setSigner(new ParaEthersSigner(para, provider))
  }

  const claim = async () => {
    if (!signer) return
    const contract = new ethers.Contract(CONTRACT_ADDR, CONTRACT_ABI, signer)
    await (await contract.claim()).wait()
    alert('✅ Token claimed!')
  }

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Para Claim Demo</h1>
      <button onClick={connect}>Connect Para Wallet</button>
      <button onClick={claim} disabled={!signer} style={{ marginLeft: 8 }}>
        Claim Token
      </button>
    </div>
  )
}
